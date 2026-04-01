import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'node:fs';

vi.mock('node:fs');
vi.mock('node:os', () => ({
  tmpdir: () => '/tmp',
}));
vi.mock('node:crypto', () => ({
  createHash: () => ({
    update: () => ({
      digest: () => 'abcdef123456xxxxxxxxxxxxxxxxxxxxxx',
    }),
  }),
}));

const mockedFs = vi.mocked(fs);

import { Command } from 'commander';

async function importCompile() {
  return await import('../../src/commands/compile.js');
}

function buildProgram(register: (p: Command) => void): Command {
  const program = new Command();
  program.exitOverride();
  register(program);
  return program;
}

/**
 * Find the content written via atomic write (writeFileSync to temp, then renameSync to dest).
 * Looks for a renameSync call whose destination includes the target string,
 * then returns the content from the corresponding writeFileSync call.
 */
function findAtomicWriteContent(target: string): string | undefined {
  // Find the renameSync call with destination containing target
  const renameCall = mockedFs.renameSync.mock.calls.find(
    (call) => String(call[1]).includes(target)
  );
  if (!renameCall) return undefined;

  const tmpPath = String(renameCall[0]);

  // Find the writeFileSync call to that temp path
  const writeCall = mockedFs.writeFileSync.mock.calls.find(
    (call) => String(call[0]) === tmpPath
  );
  if (!writeCall) return undefined;

  return writeCall[1] as string;
}

describe('compile command', () => {
  let consoleLogs: string[];

  beforeEach(() => {
    vi.clearAllMocks();
    consoleLogs = [];
    vi.spyOn(process, 'cwd').mockReturnValue('/projects/my-app');
    vi.spyOn(console, 'log').mockImplementation((...args: unknown[]) => {
      consoleLogs.push(args.join(' '));
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(process, 'exit').mockImplementation((() => {}) as never);

    mockedFs.mkdirSync.mockReturnValue(undefined);
    mockedFs.writeFileSync.mockReturnValue(undefined);
    mockedFs.renameSync.mockReturnValue(undefined);
    // Default: file does not exist yet (so content-addressed check skips)
    mockedFs.existsSync.mockReturnValue(false);
  });

  it('registers "compile" command on program', async () => {
    const { registerCompileCommand } = await importCompile();
    const program = new Command();
    registerCompileCommand(program);

    const cmd = program.commands.find((c) => c.name() === 'compile');
    expect(cmd).toBeDefined();
    expect(cmd!.description()).toBe('Compile local context without API (offline mode)');
  });

  it('exits with error if .terso/ does not exist', async () => {
    mockedFs.existsSync.mockReturnValue(false);
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {}) as never);

    const { registerCompileCommand } = await importCompile();
    const program = buildProgram(registerCompileCommand);
    await program.parseAsync(['compile'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('compiles PROJECT.md into CURRENT_CONTEXT.md', async () => {
    mockedFs.existsSync.mockImplementation((p) => {
      const s = String(p);
      if (s.endsWith('.terso')) return true;
      if (s.endsWith('PROJECT.md')) return true;
      if (s.endsWith('STATUS.md')) return false;
      if (s.endsWith('ARCHITECTURE.md')) return false;
      if (s.endsWith('DECISIONS')) return false;
      if (s.includes('captures.jsonl')) return false;
      // For content-addressed check in writeContextFiles: file doesn't exist yet
      if (s.includes('CURRENT_CONTEXT')) return false;
      return false;
    });
    mockedFs.readFileSync.mockImplementation((p) => {
      if (String(p).endsWith('PROJECT.md')) return 'Omnus is a knowledge platform.';
      return '';
    });

    const { registerCompileCommand } = await importCompile();
    const program = buildProgram(registerCompileCommand);
    await program.parseAsync(['compile'], { from: 'user' });

    const content = findAtomicWriteContent('CURRENT_CONTEXT');
    expect(content).toBeDefined();
    expect(content).toContain('## Project Overview');
    expect(content).toContain('Omnus is a knowledge platform.');
  });

  it('includes STATUS.md and ARCHITECTURE.md when present', async () => {
    mockedFs.existsSync.mockImplementation((p) => {
      const s = String(p);
      if (s.endsWith('.terso')) return true;
      if (s.endsWith('PROJECT.md')) return true;
      if (s.endsWith('STATUS.md')) return true;
      if (s.endsWith('ARCHITECTURE.md')) return true;
      if (s.endsWith('DECISIONS')) return false;
      if (s.includes('captures.jsonl')) return false;
      if (s.includes('CURRENT_CONTEXT')) return false;
      return false;
    });
    mockedFs.readFileSync.mockImplementation((p) => {
      const s = String(p);
      if (s.endsWith('PROJECT.md')) return 'Project overview content';
      if (s.endsWith('STATUS.md')) return 'Current status content';
      if (s.endsWith('ARCHITECTURE.md')) return 'Architecture content';
      return '';
    });

    const { registerCompileCommand } = await importCompile();
    const program = buildProgram(registerCompileCommand);
    await program.parseAsync(['compile'], { from: 'user' });

    const content = findAtomicWriteContent('CURRENT_CONTEXT');
    expect(content).toBeDefined();
    expect(content).toContain('## Project Overview');
    expect(content).toContain('## Current Status');
    expect(content).toContain('## Architecture');
    expect(content).toContain('Current status content');
    expect(content).toContain('Architecture content');
  });

  it('includes recent decisions (up to 3, reversed)', async () => {
    mockedFs.existsSync.mockImplementation((p) => {
      const s = String(p);
      if (s.endsWith('.terso')) return true;
      if (s.endsWith('PROJECT.md')) return false;
      if (s.endsWith('STATUS.md')) return false;
      if (s.endsWith('ARCHITECTURE.md')) return false;
      if (s.endsWith('DECISIONS')) return true;
      if (s.includes('captures.jsonl')) return false;
      if (s.includes('CURRENT_CONTEXT')) return false;
      return false;
    });
    mockedFs.statSync.mockReturnValue({ isDirectory: () => true } as fs.Stats);
    mockedFs.readdirSync.mockReturnValue([
      '001-use-supabase.md',
      '002-vercel-migration.md',
      '003-add-embeddings.md',
      '004-latest-decision.md',
    ] as any);
    mockedFs.readFileSync.mockImplementation((p) => {
      const s = String(p);
      if (s.includes('002')) return 'Decision 2';
      if (s.includes('003')) return 'Decision 3';
      if (s.includes('004')) return 'Decision 4';
      return '';
    });

    const { registerCompileCommand } = await importCompile();
    const program = buildProgram(registerCompileCommand);
    await program.parseAsync(['compile'], { from: 'user' });

    const content = findAtomicWriteContent('CURRENT_CONTEXT');
    expect(content).toBeDefined();
    expect(content).toContain('## Recent Decisions');
    expect(content).toContain('Decision 4');
    expect(content).toContain('Decision 3');
    expect(content).toContain('Decision 2');
  });

  it('includes offline captures when present', async () => {
    mockedFs.existsSync.mockImplementation((p) => {
      const s = String(p);
      if (s.endsWith('.terso')) return true;
      if (s.endsWith('PROJECT.md')) return false;
      if (s.endsWith('STATUS.md')) return false;
      if (s.endsWith('ARCHITECTURE.md')) return false;
      if (s.endsWith('DECISIONS')) return false;
      if (s.includes('captures.jsonl')) return true;
      if (s.includes('CURRENT_CONTEXT')) return false;
      return false;
    });
    const captures = [
      JSON.stringify({ text: 'First offline note', capturedAt: '2026-03-15T09:00:00Z' }),
      JSON.stringify({ text: 'Second offline note', capturedAt: '2026-03-15T10:00:00Z' }),
    ].join('\n');
    mockedFs.readFileSync.mockImplementation((p) => {
      if (String(p).includes('captures.jsonl')) return captures;
      return '';
    });

    const { registerCompileCommand } = await importCompile();
    const program = buildProgram(registerCompileCommand);
    await program.parseAsync(['compile'], { from: 'user' });

    const content = findAtomicWriteContent('CURRENT_CONTEXT');
    expect(content).toBeDefined();
    expect(content).toContain('## Pending Captures (2)');
    expect(content).toContain('First offline note');
    expect(content).toContain('Second offline note');
  });

  it('generates YAML frontmatter with timestamps', async () => {
    mockedFs.existsSync.mockImplementation((p) => {
      const s = String(p);
      if (s.endsWith('.terso')) return true;
      if (s.includes('captures.jsonl')) return false;
      if (s.includes('CURRENT_CONTEXT')) return false;
      return false;
    });
    mockedFs.readFileSync.mockReturnValue('');

    const { registerCompileCommand } = await importCompile();
    const program = buildProgram(registerCompileCommand);
    await program.parseAsync(['compile'], { from: 'user' });

    const content = findAtomicWriteContent('CURRENT_CONTEXT');
    expect(content).toBeDefined();

    // The frontmatter is generated by the compile command in the content field.
    // writeContextFiles writes it as-is (no client-side frontmatter).
    expect(content).toContain('generated_at:');
    expect(content).toContain('generator: "terso-cli v0.1.0 (offline compile)"');
    expect(content).toContain('freshness: "local"');
  });

  it('prints success message', async () => {
    mockedFs.existsSync.mockImplementation((p) => {
      const s = String(p);
      if (s.endsWith('.terso')) return true;
      if (s.includes('captures.jsonl')) return false;
      if (s.includes('CURRENT_CONTEXT')) return false;
      return false;
    });
    mockedFs.readFileSync.mockReturnValue('');

    const { registerCompileCommand } = await importCompile();
    const program = buildProgram(registerCompileCommand);
    await program.parseAsync(['compile'], { from: 'user' });

    expect(consoleLogs.some((l) => l.includes('Compiled 1 context file'))).toBe(true);
  });
});
