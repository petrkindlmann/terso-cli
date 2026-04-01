import { Command } from 'commander';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { loadProjectConfig } from '../lib/config.js';
import { OmnusApiClient } from '../lib/api-client.js';
import { writeContextFiles } from '../lib/file-writer.js';

const TERSO_DIR = '.terso';
const WATCH_PATHS = ['PROJECT.md', 'DECISIONS', 'STATUS.md', 'ARCHITECTURE.md'];

export function registerWatchCommand(program: Command): void {
  program
    .command('watch')
    .description('Watch for .terso/ changes and auto-sync context')
    .option('--interval <ms>', 'Poll interval in milliseconds', '5000')
    .action(async (options) => {
      try {
        await runWatch(parseInt(options.interval, 10) || 5000);
      } catch (error) {
        console.error('Watch failed:', error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });
}

async function runWatch(intervalMs: number): Promise<void> {
  const config = loadProjectConfig();
  const client = new OmnusApiClient(config.apiUrl, config.apiKey);
  const tersoDir = path.join(process.cwd(), TERSO_DIR);

  if (!fs.existsSync(tersoDir)) {
    console.error('.terso/ directory not found. Run `terso init` first.');
    process.exit(1);
  }

  console.log(`Watching .terso/ for changes (interval: ${intervalMs}ms)`);
  console.log('Press Ctrl+C to stop.\n');

  // Track modification times
  const lastMod = new Map<string, number>();

  // Initialize timestamps
  for (const watchPath of WATCH_PATHS) {
    const fullPath = path.join(tersoDir, watchPath);
    if (fs.existsSync(fullPath)) {
      const stat = fs.statSync(fullPath);
      lastMod.set(watchPath, stat.mtimeMs);
    }
  }

  // Mutex: prevents overlapping syncs
  let syncing = false;
  let pendingSync = false;

  async function syncIfChanged(): Promise<void> {
    let changed = false;
    for (const watchPath of WATCH_PATHS) {
      const fullPath = path.join(tersoDir, watchPath);
      if (!fs.existsSync(fullPath)) continue;

      const stat = fs.statSync(fullPath);
      const prev = lastMod.get(watchPath);
      if (prev !== undefined && stat.mtimeMs > prev) {
        console.log(`Change detected: ${watchPath}`);
        changed = true;
      }
      lastMod.set(watchPath, stat.mtimeMs);
    }

    if (!changed) return;

    // Singleflight: if already syncing, mark pending and return
    if (syncing) {
      pendingSync = true;
      return;
    }

    syncing = true;
    try {
      console.log('Syncing context...');
      const result = await client.exportContext(config.projectId);
      const fileEntries = Object.entries(result.files ?? {});
      const filesForWriter = fileEntries.map(([filePath, content]) => ({
        path: filePath,
        content,
      }));
      const written = writeContextFiles(filesForWriter);
      console.log(`Synced ${written} changed file(s) of ${fileEntries.length} total.\n`);
    } catch (err) {
      console.error('Sync failed:', err instanceof Error ? err.message : err);
    } finally {
      syncing = false;
    }

    // If a sync was requested while we were busy, run again
    if (pendingSync) {
      pendingSync = false;
      await syncIfChanged();
    }
  }

  // Graceful shutdown on SIGINT/SIGTERM
  let aborted = false;
  const shutdown = () => {
    console.log('\nStopping watch...');
    aborted = true;
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Serialized loop: no overlapping intervals
  await syncIfChanged();
  while (!aborted) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    if (!aborted) {
      await syncIfChanged();
    }
  }

  process.exit(0);
}
