import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { runEmit } from '../../src/commands/emit.js';
import { GENERATED_MARKER } from '../../src/lib/agent-targets.js';

let tmpRoot: string;
let logs: string[];
let errors: string[];

beforeEach(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'terso-emit-'));
  logs = [];
  errors = [];
  vi.spyOn(console, 'log').mockImplementation((m: unknown) => {
    logs.push(String(m));
  });
  vi.spyOn(console, 'error').mockImplementation((m: unknown) => {
    errors.push(String(m));
  });
});

afterEach(() => {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
  vi.restoreAllMocks();
});

function writeSource(content: string): void {
  fs.writeFileSync(path.join(tmpRoot, 'AGENTS.md'), content, 'utf-8');
}

function read(rel: string): string {
  return fs.readFileSync(path.join(tmpRoot, rel), 'utf-8');
}

describe('emit command', () => {
  it('returns 2 and prints error when AGENTS.md is missing', async () => {
    const code = await runEmit({}, tmpRoot);
    expect(code).toBe(2);
    expect(errors.join('\n')).toContain('AGENTS.md not found');
  });

  it('emits all default targets when no agent hints exist (first-run)', async () => {
    writeSource('# Project rules\n\nUse pnpm.\n');

    const code = await runEmit({}, tmpRoot);

    expect(code).toBe(0);
    expect(read('CLAUDE.md')).toContain(GENERATED_MARKER);
    expect(read('CLAUDE.md')).toContain('Use pnpm.');
    expect(read('.cursorrules')).toContain('Use pnpm.');
    expect(read('.github/copilot-instructions.md')).toContain('Use pnpm.');
  });

  it('only emits to targets whose presence hints exist', async () => {
    writeSource('rules');
    fs.mkdirSync(path.join(tmpRoot, '.cursor'), { recursive: true });

    const code = await runEmit({}, tmpRoot);

    expect(code).toBe(0);
    expect(fs.existsSync(path.join(tmpRoot, '.cursorrules'))).toBe(true);
    expect(fs.existsSync(path.join(tmpRoot, 'CLAUDE.md'))).toBe(false);
    expect(fs.existsSync(path.join(tmpRoot, '.github/copilot-instructions.md'))).toBe(false);
  });

  it('respects --targets flag with explicit subset', async () => {
    writeSource('rules');

    const code = await runEmit({ targets: 'claude' }, tmpRoot);

    expect(code).toBe(0);
    expect(fs.existsSync(path.join(tmpRoot, 'CLAUDE.md'))).toBe(true);
    expect(fs.existsSync(path.join(tmpRoot, '.cursorrules'))).toBe(false);
  });

  it('blocks overwrite of unmarked existing file without --force', async () => {
    writeSource('new rules');
    fs.writeFileSync(path.join(tmpRoot, 'CLAUDE.md'), '# my hand-written file\n', 'utf-8');

    const code = await runEmit({ targets: 'claude' }, tmpRoot);

    expect(code).toBe(2);
    expect(errors.join('\n')).toContain('blocked');
    expect(read('CLAUDE.md')).toBe('# my hand-written file\n');
  });

  it('overwrites unmarked existing file with --force', async () => {
    writeSource('new rules');
    fs.writeFileSync(path.join(tmpRoot, 'CLAUDE.md'), '# my hand-written file\n', 'utf-8');

    const code = await runEmit({ targets: 'claude', force: true }, tmpRoot);

    expect(code).toBe(0);
    expect(read('CLAUDE.md')).toContain(GENERATED_MARKER);
    expect(read('CLAUDE.md')).toContain('new rules');
  });

  it('updates a previously-generated file without --force', async () => {
    writeSource('v1 rules');
    await runEmit({ targets: 'claude' }, tmpRoot);

    writeSource('v2 rules');
    const code = await runEmit({ targets: 'claude' }, tmpRoot);

    expect(code).toBe(0);
    expect(read('CLAUDE.md')).toContain('v2 rules');
    expect(read('CLAUDE.md')).not.toContain('v1 rules');
  });

  it('reports unchanged when content matches', async () => {
    writeSource('stable rules');
    await runEmit({ targets: 'claude' }, tmpRoot);

    logs.length = 0;
    const code = await runEmit({ targets: 'claude' }, tmpRoot);

    expect(code).toBe(0);
    expect(logs.join('\n')).toContain('ok');
    expect(logs.join('\n')).toContain('CLAUDE.md');
  });

  it('--check exits 1 when files would change', async () => {
    writeSource('new rules');

    const code = await runEmit({ targets: 'claude', check: true }, tmpRoot);

    expect(code).toBe(1);
    expect(errors.join('\n')).toContain('out of date');
    expect(fs.existsSync(path.join(tmpRoot, 'CLAUDE.md'))).toBe(false);
  });

  it('--check exits 0 when everything is in sync', async () => {
    writeSource('rules');
    await runEmit({ targets: 'claude' }, tmpRoot);

    const code = await runEmit({ targets: 'claude', check: true }, tmpRoot);

    expect(code).toBe(0);
  });

  it('--dry-run does not write files', async () => {
    writeSource('rules');

    const code = await runEmit({ targets: 'claude', dryRun: true }, tmpRoot);

    expect(code).toBe(0);
    expect(fs.existsSync(path.join(tmpRoot, 'CLAUDE.md'))).toBe(false);
    expect(logs.join('\n')).toContain('Dry run');
  });

  it('creates parent directories for nested targets like .github/', async () => {
    writeSource('rules');

    const code = await runEmit({ targets: 'copilot' }, tmpRoot);

    expect(code).toBe(0);
    expect(fs.existsSync(path.join(tmpRoot, '.github', 'copilot-instructions.md'))).toBe(true);
  });

  it('rejects unknown target ids with a clear error', async () => {
    writeSource('rules');

    const code = await runEmit({ targets: 'nope' }, tmpRoot);

    expect(code).toBe(2);
    expect(errors.join('\n')).toContain('Unknown agent target');
  });

  it('strips trailing whitespace and ensures single trailing newline in rendered output', async () => {
    writeSource('# rules\n\n\n\n');

    await runEmit({ targets: 'claude' }, tmpRoot);

    const out = read('CLAUDE.md');
    expect(out.endsWith('\n')).toBe(true);
    expect(out.endsWith('\n\n')).toBe(false);
  });
});
