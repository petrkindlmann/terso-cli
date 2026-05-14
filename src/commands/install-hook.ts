import { Command } from 'commander';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { fileURLToPath } from 'node:url';
import { BETA_LABEL, printBetaNotice } from '../lib/beta-notice.js';

const SUPPORTED_CLIENTS = ['claude'] as const;
type ClientId = (typeof SUPPORTED_CLIENTS)[number];

interface InstallHookOptions {
  client?: string;
  uninstall?: boolean;
  dryRun?: boolean;
  scope?: 'user' | 'project';
}

export function registerInstallHookCommand(program: Command): void {
  program
    .command('install-hook')
    .description(
      `${BETA_LABEL} Install the Omnus session observer into an agent client's hooks (Claude Code today)`,
    )
    .option('--client <name>', `agent client: ${SUPPORTED_CLIENTS.join(' | ')}`, 'claude')
    .option('--uninstall', 'remove the hook instead of adding it')
    .option('--dry-run', 'print what would change without writing')
    .option('--scope <scope>', 'install scope: user (~/.claude/settings.json) or project (.claude/settings.json)', 'user')
    .action((options: InstallHookOptions) => {
      try {
        printBetaNotice();
        const code = runInstallHook(options, process.cwd());
        if (code !== 0) process.exit(code);
      } catch (error) {
        console.error('install-hook failed:', error instanceof Error ? error.message : error);
        process.exit(2);
      }
    });
}

export function runInstallHook(options: InstallHookOptions, projectRoot: string): number {
  const client = (options.client ?? 'claude') as ClientId;
  if (!SUPPORTED_CLIENTS.includes(client)) {
    console.error(`Unsupported client "${client}". Supported: ${SUPPORTED_CLIENTS.join(', ')}`);
    return 2;
  }

  const scope = options.scope ?? 'user';
  if (scope !== 'user' && scope !== 'project') {
    console.error(`Invalid --scope "${scope}". Use "user" or "project".`);
    return 2;
  }

  const settingsPath =
    scope === 'project'
      ? path.join(projectRoot, '.claude', 'settings.json')
      : path.join(os.homedir(), '.claude', 'settings.json');

  const hookScriptPath = resolveHookScript();
  if (!hookScriptPath) {
    console.error(
      'Could not locate omnus-session-observer.sh. Reinstall terso-cli or set TERSO_HOOK_PATH.',
    );
    return 2;
  }

  const command = hookScriptPath;
  const settings = readSettings(settingsPath);
  const before = JSON.stringify(settings);

  if (options.uninstall) {
    removeHook(settings, command);
  } else {
    addHook(settings, command);
  }

  const after = JSON.stringify(settings);
  const changed = before !== after;

  if (!changed) {
    console.log(
      options.uninstall
        ? `Hook not present in ${displayPath(settingsPath)} — nothing to remove.`
        : `Hook already installed in ${displayPath(settingsPath)} — nothing to do.`,
    );
    return 0;
  }

  if (options.dryRun) {
    console.log(`Would ${options.uninstall ? 'remove' : 'install'} hook in ${displayPath(settingsPath)}.`);
    console.log(`  command: ${command}`);
    return 0;
  }

  fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf-8');
  console.log(
    options.uninstall
      ? `Removed Omnus session hook from ${displayPath(settingsPath)}.`
      : `Installed Omnus session hook in ${displayPath(settingsPath)}.\n  command: ${command}`,
  );
  return 0;
}

function resolveHookScript(): string | undefined {
  const envOverride = process.env.TERSO_HOOK_PATH;
  if (envOverride && fs.existsSync(envOverride)) return envOverride;

  // dist/commands/install-hook.js → ../../hooks/omnus-session-observer.sh when installed.
  // src/commands/install-hook.ts → ../../hooks/omnus-session-observer.sh when running via tsx.
  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.join(here, '..', '..', 'hooks', 'omnus-session-observer.sh'),
    path.join(here, '..', '..', '..', 'hooks', 'omnus-session-observer.sh'),
  ];
  return candidates.find((c) => fs.existsSync(c));
}

interface ClaudeHookEntry {
  hooks: Array<{ type: 'command'; command: string }>;
  matcher?: string;
}

interface ClaudeSettings {
  hooks?: {
    SessionEnd?: ClaudeHookEntry[];
    [event: string]: ClaudeHookEntry[] | undefined;
  };
  [key: string]: unknown;
}

function readSettings(p: string): ClaudeSettings {
  if (!fs.existsSync(p)) return {};
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8')) as ClaudeSettings;
  } catch (err) {
    throw new Error(
      `Cannot parse ${p}: ${err instanceof Error ? err.message : err}. Fix or delete it and retry.`,
    );
  }
}

function addHook(settings: ClaudeSettings, command: string): void {
  settings.hooks ??= {};
  settings.hooks.SessionEnd ??= [];
  const entries = settings.hooks.SessionEnd;
  const already = entries.some((e) => e.hooks?.some((h) => h.command === command));
  if (already) return;
  entries.push({ hooks: [{ type: 'command', command }] });
}

function removeHook(settings: ClaudeSettings, command: string): void {
  const entries = settings.hooks?.SessionEnd;
  if (!entries) return;
  const filtered = entries
    .map((e) => ({ ...e, hooks: (e.hooks ?? []).filter((h) => h.command !== command) }))
    .filter((e) => e.hooks.length > 0);
  if (filtered.length === 0) {
    delete settings.hooks!.SessionEnd;
  } else {
    settings.hooks!.SessionEnd = filtered;
  }
}

function displayPath(p: string): string {
  const home = os.homedir();
  return p.startsWith(home) ? p.replace(home, '~') : p;
}
