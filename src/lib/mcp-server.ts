import * as fs from 'node:fs';
import * as path from 'node:path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { OmnusApiClient } from './api-client.js';
import { ProjectConfig, loadProjectConfig } from './config.js';
import { VERSION } from './version.js';

export interface McpDeps {
  /** Load project config. Returns null when run outside an initialized project. */
  loadConfig: () => ProjectConfig | null;
  /** Build an API client from a config. */
  buildClient: (config: ProjectConfig) => OmnusApiClient;
  /** Project root directory (usually process.cwd()). */
  cwd: string;
}

interface ToolText {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
  [key: string]: unknown;
}

function ok(text: string): ToolText {
  return { content: [{ type: 'text', text }] };
}

function err(text: string): ToolText {
  return { content: [{ type: 'text', text }], isError: true };
}

export const SERVER_NAME = 'terso';
export const SERVER_VERSION = VERSION;

export function createMcpServer(deps: McpDeps): McpServer {
  const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });

  server.registerTool(
    'terso_get_context',
    {
      title: 'Get current project context',
      description:
        'Returns the canonical AGENTS.md plus any context files synced from Omnus into .terso/generated/. Works offline.',
      inputSchema: {},
    },
    async () => handleGetContext(deps),
  );

  server.registerTool(
    'terso_search',
    {
      title: 'Search project knowledge',
      description:
        'Search captured project knowledge in Omnus. Requires auth (TERSO_API_TOKEN or `terso auth set`).',
      inputSchema: {
        query: z.string().min(1).describe('Search query'),
        limit: z
          .number()
          .int()
          .min(1)
          .max(20)
          .optional()
          .describe('Max results (default 5, max 20)'),
      },
    },
    async (args) => handleSearch(args, deps),
  );

  server.registerTool(
    'terso_capture',
    {
      title: 'Capture a knowledge fragment',
      description:
        'Send a piece of project knowledge to Omnus for ingestion. Requires auth.',
      inputSchema: {
        text: z.string().min(1).describe('The knowledge text to capture'),
        scope: z
          .enum(['shared', 'project', 'personal', 'mixed'])
          .optional()
          .describe('Scope hint for the captured fragment'),
      },
    },
    async (args) => handleCapture(args, deps),
  );

  return server;
}

export async function handleGetContext(deps: McpDeps): Promise<ToolText> {
  const sections: string[] = [];

  const agentsPath = path.join(deps.cwd, 'AGENTS.md');
  if (fs.existsSync(agentsPath)) {
    sections.push(`# AGENTS.md\n\n${fs.readFileSync(agentsPath, 'utf-8').trim()}`);
  }

  const generatedDir = path.join(deps.cwd, '.terso', 'generated');
  if (fs.existsSync(generatedDir)) {
    const files = walkMarkdown(generatedDir);
    for (const file of files) {
      const rel = path.relative(deps.cwd, file);
      const body = fs.readFileSync(file, 'utf-8').trim();
      sections.push(`# ${rel}\n\n${body}`);
    }
  }

  if (sections.length === 0) {
    return ok(
      'No project context found. Run `terso init` to scaffold AGENTS.md, or `terso sync` to pull from Omnus.',
    );
  }

  return ok(sections.join('\n\n---\n\n'));
}

export async function handleSearch(
  args: { query: string; limit?: number },
  deps: McpDeps,
): Promise<ToolText> {
  const config = deps.loadConfig();
  if (!config) {
    return err('Not initialized in a project. Run `terso init` first.');
  }
  if (!config.apiKey) {
    return err(
      'No Omnus API token. Set TERSO_API_TOKEN env var or run `terso auth set <token>`.',
    );
  }

  const client = deps.buildClient(config);
  const limit = args.limit ?? 5;

  let response;
  try {
    response = await client.search(args.query, { limit });
  } catch (error) {
    return err(`Search failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (response.records.length === 0) {
    return ok(`No results for "${args.query}".`);
  }

  const lines = [
    `Found ${response.totalFound} result(s) for "${args.query}" (showing ${response.records.length}):`,
    '',
  ];

  for (const r of response.records) {
    lines.push(`## ${r.title}`);
    lines.push(`*${r.kind} · ${r.scope} · score ${r.score.toFixed(2)} · ${r.createdAt}*`);
    lines.push('');
    lines.push(r.body);
    lines.push('');
  }

  return ok(lines.join('\n'));
}

export async function handleCapture(
  args: { text: string; scope?: 'shared' | 'project' | 'personal' | 'mixed' },
  deps: McpDeps,
): Promise<ToolText> {
  const config = deps.loadConfig();
  if (!config) {
    return err('Not initialized in a project. Run `terso init` first.');
  }
  if (!config.apiKey) {
    return err(
      'No Omnus API token. Set TERSO_API_TOKEN env var or run `terso auth set <token>`.',
    );
  }

  const client = deps.buildClient(config);

  try {
    const result = await client.capture(args.text, config.projectId, args.scope);
    return ok(`Captured. ingestionId=${result.ingestionId} status=${result.status}`);
  } catch (error) {
    return err(`Capture failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function walkMarkdown(dir: string): string[] {
  const out: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkMarkdown(full));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      out.push(full);
    }
  }
  return out.sort();
}

/**
 * Default deps wiring for production use — reads project.json from cwd,
 * builds an OmnusApiClient from it.
 */
export function defaultDeps(): McpDeps {
  return {
    cwd: process.cwd(),
    loadConfig: () => {
      try {
        return loadProjectConfig();
      } catch {
        return null;
      }
    },
    buildClient: (config) => new OmnusApiClient(config.apiUrl, config.apiKey),
  };
}
