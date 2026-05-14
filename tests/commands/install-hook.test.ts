import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { runInstallHook } from '../../src/commands/install-hook.js';

let tmpRoot: string;
let tmpHookScript: string;
let prevHookEnv: string | undefined;

beforeEach(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'terso-hook-'));
  tmpHookScript = path.join(tmpRoot, 'omnus-session-observer.sh');
  fs.writeFileSync(tmpHookScript, '#!/usr/bin/env bash\necho hi\n', { mode: 0o755 });
  prevHookEnv = process.env.TERSO_HOOK_PATH;
  process.env.TERSO_HOOK_PATH = tmpHookScript;
});

afterEach(() => {
  if (prevHookEnv === undefined) {
    delete process.env.TERSO_HOOK_PATH;
  } else {
    process.env.TERSO_HOOK_PATH = prevHookEnv;
  }
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

function readSettings(): unknown {
  const p = path.join(tmpRoot, '.claude', 'settings.json');
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

describe('install-hook command', () => {
  it('installs the hook into a project-scoped settings.json', () => {
    const code = runInstallHook({ client: 'claude', scope: 'project' }, tmpRoot);
    expect(code).toBe(0);

    const settings = readSettings() as { hooks: { SessionEnd: Array<{ hooks: Array<{ command: string }> }> } };
    expect(settings.hooks.SessionEnd).toHaveLength(1);
    expect(settings.hooks.SessionEnd[0].hooks[0].command).toBe(tmpHookScript);
  });

  it('is idempotent — running twice does not duplicate the hook', () => {
    runInstallHook({ client: 'claude', scope: 'project' }, tmpRoot);
    const code = runInstallHook({ client: 'claude', scope: 'project' }, tmpRoot);
    expect(code).toBe(0);
    const settings = readSettings() as { hooks: { SessionEnd: Array<{ hooks: unknown[] }> } };
    expect(settings.hooks.SessionEnd).toHaveLength(1);
  });

  it('--uninstall removes the hook and leaves other entries intact', () => {
    const settingsPath = path.join(tmpRoot, '.claude', 'settings.json');
    fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
    fs.writeFileSync(
      settingsPath,
      JSON.stringify({
        hooks: {
          SessionEnd: [
            { hooks: [{ type: 'command', command: '/some/other/hook.sh' }] },
            { hooks: [{ type: 'command', command: tmpHookScript }] },
          ],
        },
      }),
    );

    const code = runInstallHook({ client: 'claude', scope: 'project', uninstall: true }, tmpRoot);
    expect(code).toBe(0);

    const settings = readSettings() as { hooks: { SessionEnd: Array<{ hooks: Array<{ command: string }> }> } };
    expect(settings.hooks.SessionEnd).toHaveLength(1);
    expect(settings.hooks.SessionEnd[0].hooks[0].command).toBe('/some/other/hook.sh');
  });

  it('--dry-run does not write the settings file', () => {
    const code = runInstallHook({ client: 'claude', scope: 'project', dryRun: true }, tmpRoot);
    expect(code).toBe(0);
    expect(fs.existsSync(path.join(tmpRoot, '.claude', 'settings.json'))).toBe(false);
  });

  it('rejects unknown clients', () => {
    const code = runInstallHook({ client: 'cursor', scope: 'project' }, tmpRoot);
    expect(code).toBe(2);
  });
});
