import { Command } from 'commander';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { writeContextFiles } from '../lib/file-writer.js';
import { readOfflineCaptures } from '../lib/offline-store.js';

const TERSO_DIR = '.terso';

export function registerCompileCommand(program: Command): void {
  program
    .command('compile')
    .description('Compile local context without API (offline mode)')
    .action(async () => {
      try {
        await runCompile();
      } catch (error) {
        console.error('Compile failed:', error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });
}

async function runCompile(): Promise<void> {
  const tersoDir = path.join(process.cwd(), TERSO_DIR);

  if (!fs.existsSync(tersoDir)) {
    console.error('.terso/ directory not found. Run `terso init` first.');
    process.exit(1);
  }

  console.log('Compiling local context (offline mode)...\n');

  const sections: string[] = [];
  const now = new Date().toISOString();

  // Read PROJECT.md
  const projectMdPath = path.join(tersoDir, 'PROJECT.md');
  if (fs.existsSync(projectMdPath)) {
    const content = fs.readFileSync(projectMdPath, 'utf-8');
    sections.push(`## Project Overview\n\n${content}`);
  }

  // Read STATUS.md
  const statusPath = path.join(tersoDir, 'STATUS.md');
  if (fs.existsSync(statusPath)) {
    const content = fs.readFileSync(statusPath, 'utf-8');
    sections.push(`## Current Status\n\n${content}`);
  }

  // Read ARCHITECTURE.md
  const archPath = path.join(tersoDir, 'ARCHITECTURE.md');
  if (fs.existsSync(archPath)) {
    const content = fs.readFileSync(archPath, 'utf-8');
    sections.push(`## Architecture\n\n${content}`);
  }

  // Read recent decisions
  const decisionsDir = path.join(tersoDir, 'DECISIONS');
  if (fs.existsSync(decisionsDir) && fs.statSync(decisionsDir).isDirectory()) {
    const files = fs.readdirSync(decisionsDir)
      .filter((f) => f.endsWith('.md'))
      .sort()
      .reverse()
      .slice(0, 3);

    if (files.length > 0) {
      const decisionContent = files.map((f) => {
        return fs.readFileSync(path.join(decisionsDir, f), 'utf-8');
      }).join('\n\n---\n\n');
      sections.push(`## Recent Decisions\n\n${decisionContent}`);
    }
  }

  // Include pending offline captures
  const offlineCaptures = readOfflineCaptures();
  if (offlineCaptures.length > 0) {
    const captureText = offlineCaptures.map((c) =>
      `- [${c.capturedAt}] ${c.text.slice(0, 200)}${c.text.length > 200 ? '...' : ''}`
    ).join('\n');
    sections.push(`## Pending Captures (${offlineCaptures.length})\n\n${captureText}`);
  }

  // Build context file
  const frontmatter = [
    '---',
    `generated_at: "${now}"`,
    `expires_at: "${new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()}"`,
    'source_ids: []',
    'generator: "terso-cli v0.1.0 (offline compile)"',
    'freshness: "local"',
    '---',
  ].join('\n');

  const contextContent = `${frontmatter}\n\n# Current Context (Local Compile)\n\n${sections.join('\n\n---\n\n')}`;

  // Path is relative to the generated directory, NOT project root.
  // writeContextFiles joins this with .terso/generated/ automatically.
  writeContextFiles([
    {
      path: 'CURRENT_CONTEXT.md',
      content: contextContent,
    },
  ]);

  console.log('Compiled 1 context file from local sources.');
  if (offlineCaptures.length > 0) {
    console.log(`Included ${offlineCaptures.length} pending offline captures.`);
  }
}
