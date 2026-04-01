/**
 * Claude Code session observer — transcript processor.
 *
 * Reads a JSONL transcript from a Claude Code session, extracts a summary
 * of changes and decisions, and posts it to the Omnus ingestion API.
 *
 * Usage: node process-session.js <transcript_path> <cwd> <session_id>
 *
 * Environment:
 *   OMNUS_API_KEY  — API key for the Omnus ingestion endpoint
 *   OMNUS_API_URL  — Base URL (default: https://omnus.dev)
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TranscriptLine {
  type: string;
  message?: {
    role?: string;
    content?: string | Array<{ type: string; text?: string; name?: string; input?: Record<string, unknown> }>;
  };
  // tool_use / tool_result shapes vary; we access them loosely
  [key: string]: unknown;
}

interface SessionSummary {
  filesChanged: string[];
  decisions: string[];
  lastAssistantMessage: string;
  messageCount: number;
  toolCallCount: number;
}

// ---------------------------------------------------------------------------
// Project detection (mirrors cli/src/lib/project-detector.ts, kept standalone)
// ---------------------------------------------------------------------------

function detectProjectName(dir: string): string {
  // Try package.json
  const pkgPath = path.join(dir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      if (typeof pkg.name === 'string' && pkg.name) {
        return pkg.name.replace(/^@[^/]+\//, '');
      }
    } catch {
      // fall through
    }
  }

  // Try .terso/project.json
  const tersoPath = path.join(dir, '.terso', 'project.json');
  if (fs.existsSync(tersoPath)) {
    try {
      const terso = JSON.parse(fs.readFileSync(tersoPath, 'utf-8'));
      if (typeof terso.projectId === 'string' && terso.projectId) {
        return terso.projectId;
      }
    } catch {
      // fall through
    }
  }

  // Fall back to directory name
  return path.basename(dir);
}

// ---------------------------------------------------------------------------
// Transcript parsing
// ---------------------------------------------------------------------------

function parseTranscript(transcriptPath: string): TranscriptLine[] {
  const content = fs.readFileSync(transcriptPath, 'utf-8');
  const lines: TranscriptLine[] = [];

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      lines.push(JSON.parse(trimmed) as TranscriptLine);
    } catch {
      // Skip malformed lines
    }
  }

  return lines;
}

function extractText(content: unknown): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .filter((block) => block.type === 'text' && typeof block.text === 'string')
      .map((block) => block.text as string)
      .join('\n');
  }
  return '';
}

function extractSummary(lines: TranscriptLine[]): SessionSummary {
  const filesChanged = new Set<string>();
  const decisions: string[] = [];
  let lastAssistantMessage = '';
  let messageCount = 0;
  let toolCallCount = 0;

  for (const line of lines) {
    const role = line.message?.role ?? line.type;

    if (role === 'assistant') {
      messageCount++;
      const text = extractText(line.message?.content);
      if (text) {
        lastAssistantMessage = text;
      }

      // Extract tool use from content blocks
      if (Array.isArray(line.message?.content)) {
        for (const block of line.message!.content) {
          if (block.type === 'tool_use') {
            toolCallCount++;
            const input = block.input as Record<string, unknown> | undefined;

            // Detect file changes from Write/Edit/Bash tool calls
            if (block.name === 'Write' || block.name === 'Edit') {
              const filePath = input?.file_path as string | undefined;
              if (filePath) {
                filesChanged.add(filePath);
              }
            }

            // Detect file changes from Bash commands that write files
            if (block.name === 'Bash') {
              const command = input?.command as string | undefined;
              if (command) {
                // Look for common file-writing patterns
                const redirectMatch = command.match(/>\s*["']?([^\s"'|;&]+)/g);
                if (redirectMatch) {
                  for (const match of redirectMatch) {
                    const filePath = match.replace(/^>\s*["']?/, '').replace(/["']$/, '');
                    if (filePath && !filePath.startsWith('/dev/')) {
                      filesChanged.add(filePath);
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    if (role === 'human') {
      messageCount++;
    }
  }

  // Extract decisions from assistant messages.
  // Look for lines that signal a decision: "I decided", "Decision:", "chose to", etc.
  const decisionPatterns = [
    /(?:^|\n)\s*[-*]?\s*(?:decision|decided|chose|choosing|rationale|trade-?off|approach)[:\s].{10,}/gi,
    /(?:^|\n)\s*[-*]?\s*(?:I (?:decided|chose|went with|opted for|picked)).{10,}/gi,
  ];

  for (const line of lines) {
    if ((line.message?.role ?? line.type) !== 'assistant') continue;
    const text = extractText(line.message?.content);
    if (!text) continue;

    for (const pattern of decisionPatterns) {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(text)) !== null) {
        const decision = match[0].trim().replace(/^[-*]\s*/, '');
        if (decision.length > 200) {
          decisions.push(decision.slice(0, 200) + '...');
        } else {
          decisions.push(decision);
        }
      }
    }
  }

  // Deduplicate decisions
  const uniqueDecisions = [...new Set(decisions)];

  // Truncate last assistant message
  const maxLastMsg = 500;
  if (lastAssistantMessage.length > maxLastMsg) {
    lastAssistantMessage = lastAssistantMessage.slice(0, maxLastMsg) + '...';
  }

  return {
    filesChanged: [...filesChanged],
    decisions: uniqueDecisions.slice(0, 10), // cap at 10
    lastAssistantMessage,
    messageCount,
    toolCallCount,
  };
}

// ---------------------------------------------------------------------------
// Build ingestion payload
// ---------------------------------------------------------------------------

function buildPayload(
  summary: SessionSummary,
  projectName: string,
  sessionId: string
): { sourceType: string; text: string; projectHint: string; scopeHint: string; idempotencyKey: string } {
  const parts: string[] = [];

  parts.push(`Claude Code session ${sessionId}`);
  parts.push(`Project: ${projectName}`);
  parts.push(`Messages: ${summary.messageCount}, Tool calls: ${summary.toolCallCount}`);
  parts.push('');

  if (summary.filesChanged.length > 0) {
    parts.push('Files changed:');
    for (const f of summary.filesChanged.slice(0, 30)) {
      parts.push(`  - ${f}`);
    }
    if (summary.filesChanged.length > 30) {
      parts.push(`  ... and ${summary.filesChanged.length - 30} more`);
    }
    parts.push('');
  }

  if (summary.decisions.length > 0) {
    parts.push('Decisions:');
    for (const d of summary.decisions) {
      parts.push(`  - ${d}`);
    }
    parts.push('');
  }

  if (summary.lastAssistantMessage) {
    parts.push('Final summary:');
    parts.push(summary.lastAssistantMessage);
  }

  return {
    sourceType: 'claude_code',
    text: parts.join('\n'),
    projectHint: projectName,
    scopeHint: 'project',
    idempotencyKey: `claude_code_session_${sessionId}`,
  };
}

// ---------------------------------------------------------------------------
// Send to Omnus API
// ---------------------------------------------------------------------------

async function sendToOmnus(payload: Record<string, unknown>): Promise<void> {
  const apiUrl = (process.env.OMNUS_API_URL || 'https://omnus.dev').replace(/\/$/, '');
  const apiKey = process.env.OMNUS_API_KEY;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'omnus-session-observer/1.0',
  };

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const url = `${apiUrl}/api/ingestions`;

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(8000), // 8s timeout to stay within hook limit
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Omnus API returned ${response.status}: ${body}`);
  }

  const result = await response.json() as { ingestionId?: string };
  if (result.ingestionId) {
    // Write to stderr so it doesn't interfere with hook protocol
    process.stderr.write(`[omnus-observer] Ingestion queued: ${result.ingestionId}\n`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const [transcriptPath, cwd, sessionId] = process.argv.slice(2);

  if (!transcriptPath || !cwd || !sessionId) {
    process.stderr.write('Usage: process-session.js <transcript_path> <cwd> <session_id>\n');
    process.exit(1);
  }

  if (!fs.existsSync(transcriptPath)) {
    process.stderr.write(`[omnus-observer] Transcript not found: ${transcriptPath}\n`);
    process.exit(0); // Exit cleanly — don't block session
  }

  const projectName = detectProjectName(cwd);
  const lines = parseTranscript(transcriptPath);

  if (lines.length === 0) {
    process.stderr.write('[omnus-observer] Empty transcript, skipping.\n');
    process.exit(0);
  }

  const summary = extractSummary(lines);

  // Skip trivial sessions (no tool calls and very few messages)
  if (summary.toolCallCount === 0 && summary.messageCount <= 2) {
    process.stderr.write('[omnus-observer] Trivial session, skipping.\n');
    process.exit(0);
  }

  const payload = buildPayload(summary, projectName, sessionId);

  try {
    await sendToOmnus(payload);
  } catch (error) {
    // Log but don't fail — never block session exit
    const msg = error instanceof Error ? error.message : String(error);
    process.stderr.write(`[omnus-observer] Failed to send: ${msg}\n`);
  }
}

main();
