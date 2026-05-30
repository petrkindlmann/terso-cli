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

  // Fix 1 — re-feeding generated output as source must not stack markers.
  it('does not double the marker when source already starts with the marker', async () => {
    writeSource(`${GENERATED_MARKER}\n\n# rules\n`);

    await runEmit({ targets: 'claude' }, tmpRoot);

    const out = read('CLAUDE.md');
    const occurrences = out.split(GENERATED_MARKER).length - 1;
    expect(occurrences).toBe(1);
    expect(out).toContain('# rules');
  });

  it('marker-stripping is idempotent when re-emitting generated output repeatedly', async () => {
    writeSource('# rules\n');
    await runEmit({ targets: 'claude' }, tmpRoot);
    const first = read('CLAUDE.md');

    // Feed the generated file back in as the source.
    writeSource(first);
    await runEmit({ targets: 'claude' }, tmpRoot);
    const second = read('CLAUDE.md');

    expect(second).toBe(first);
    expect(second.split(GENERATED_MARKER).length - 1).toBe(1);
  });

  // Fix 3 — --check must not print write verbs.
  it('--check reports drift, never create/update', async () => {
    writeSource('new rules');

    const code = await runEmit({ targets: 'claude', check: true }, tmpRoot);

    expect(code).toBe(1);
    const out = logs.join('\n');
    expect(out).toContain('drift');
    expect(out).not.toContain('create');
    expect(out).not.toContain('update');
  });

  // Fix 5a — unknown target message lists valid targets.
  it('unknown target error lists the valid targets', async () => {
    writeSource('rules');

    const code = await runEmit({ targets: 'cursr' }, tmpRoot);

    expect(code).toBe(2);
    expect(errors.join('\n')).toContain('Valid targets: claude, cursor, copilot');
  });

  // Fix 5b — a directory in place of AGENTS.md fails with a clear message.
  it('returns 2 with a clear message when AGENTS.md is a directory', async () => {
    fs.mkdirSync(path.join(tmpRoot, 'AGENTS.md'), { recursive: true });

    const code = await runEmit({ targets: 'claude' }, tmpRoot);

    expect(code).toBe(2);
    expect(errors.join('\n')).toContain('is not a file');
  });

  // Fix 6 — whitespace-only source warns but still emits.
  it('warns when source is whitespace-only', async () => {
    writeSource('   \n\t\n');

    const code = await runEmit({ targets: 'claude' }, tmpRoot);

    expect(code).toBe(0);
    expect(errors.join('\n')).toContain('empty or whitespace-only');
  });

  // Fix 2 — pinned targets in .terso/project.json win over detection.
  it('emits the pinned target set from .terso/project.json over local detection', async () => {
    writeSource('rules');
    // Local dirs would detect only cursor...
    fs.mkdirSync(path.join(tmpRoot, '.cursor'), { recursive: true });
    // ...but the pinned set says claude + copilot.
    fs.mkdirSync(path.join(tmpRoot, '.terso'), { recursive: true });
    fs.writeFileSync(
      path.join(tmpRoot, '.terso', 'project.json'),
      JSON.stringify({ targets: ['claude', 'copilot'] }),
      'utf-8',
    );

    const code = await runEmit({}, tmpRoot);

    expect(code).toBe(0);
    expect(fs.existsSync(path.join(tmpRoot, 'CLAUDE.md'))).toBe(true);
    expect(fs.existsSync(path.join(tmpRoot, '.github/copilot-instructions.md'))).toBe(true);
    expect(fs.existsSync(path.join(tmpRoot, '.cursorrules'))).toBe(false);
  });

  it('warns about skipped targets when falling back to partial detection', async () => {
    writeSource('rules');
    fs.mkdirSync(path.join(tmpRoot, '.claude'), { recursive: true });

    await runEmit({}, tmpRoot);

    const out = errors.join('\n');
    expect(out).toContain('skipping');
    expect(out).toContain('cursor');
    expect(out).toContain('copilot');
  });

  // Fix 4 — orphan detection and --prune.
  it('warns about an orphaned generated file when a target leaves the active set', async () => {
    writeSource('rules');
    await runEmit({ targets: 'claude,cursor' }, tmpRoot);

    errors.length = 0;
    await runEmit({ targets: 'claude' }, tmpRoot);

    expect(errors.join('\n')).toContain('no longer an active target');
    expect(fs.existsSync(path.join(tmpRoot, '.cursorrules'))).toBe(true);
  });

  it('--prune deletes orphaned generated files but never the active ones', async () => {
    writeSource('rules');
    await runEmit({ targets: 'claude,cursor' }, tmpRoot);

    const code = await runEmit({ targets: 'claude', prune: true }, tmpRoot);

    expect(code).toBe(0);
    expect(fs.existsSync(path.join(tmpRoot, '.cursorrules'))).toBe(false);
    expect(fs.existsSync(path.join(tmpRoot, 'CLAUDE.md'))).toBe(true);
  });

  it('--prune never deletes a hand-written (unmarked) file at an inactive target path', async () => {
    writeSource('rules');
    // Hand-written .cursorrules, not generated by terso.
    fs.writeFileSync(path.join(tmpRoot, '.cursorrules'), '# hand written\n', 'utf-8');

    const code = await runEmit({ targets: 'claude', prune: true }, tmpRoot);

    expect(code).toBe(0);
    expect(fs.existsSync(path.join(tmpRoot, '.cursorrules'))).toBe(true);
    expect(read('.cursorrules')).toBe('# hand written\n');
  });
});
