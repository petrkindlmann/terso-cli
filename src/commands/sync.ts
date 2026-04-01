import { Command } from 'commander';
import { loadProjectConfig } from '../lib/config.js';
import { OmnusApiClient } from '../lib/api-client.js';
import { writeContextFiles } from '../lib/file-writer.js';
import { readOfflineCaptures, clearOfflineCaptures, pendingCaptureCount } from '../lib/offline-store.js';

export function registerSyncCommand(program: Command): void {
  program
    .command('sync')
    .description('Pull project context from Omnus and write to .terso/generated/')
    .option('--force', 'Overwrite all files even if unchanged')
    .option('--dry-run', 'Show what would be written without writing')
    .action(async (options) => {
      try {
        await runSync(options);
      } catch (error) {
        console.error('Sync failed:', error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });
}

interface SyncOptions {
  force?: boolean;
  dryRun?: boolean;
}

async function runSync(options: SyncOptions): Promise<void> {
  const config = loadProjectConfig();
  const client = new OmnusApiClient(config.apiUrl, config.apiKey);

  console.log(`Syncing context for project: ${config.projectId}`);
  console.log(`  API: ${config.apiUrl}`);

  // Fetch context from API
  const context = await client.exportContext(config.projectId, {
    force: options.force,
  });

  // API returns files as Record<string, string> (path -> content)
  // Convert to the array format that writeContextFiles expects
  const filesMap = context.files ?? {};
  const fileEntries = Object.entries(filesMap);

  if (fileEntries.length === 0) {
    console.log('No context files available for this project.');
    return;
  }

  if (options.dryRun) {
    console.log(`Would write ${fileEntries.length} file(s):`);
    for (const [path] of fileEntries) {
      console.log(`  ${path}`);
    }
    return;
  }

  // Write files to .terso/generated/
  // Server owns final content (including frontmatter). CLI writes as-is.
  const filesForWriter = fileEntries.map(([filePath, content]) => ({
    path: filePath,
    content,
  }));
  const written = writeContextFiles(filesForWriter);

  console.log(`Synced ${written} changed file(s) to .terso/generated/`);

  // Flush offline captures if any
  const pending = pendingCaptureCount();
  if (pending > 0) {
    console.log(`\nFlushing ${pending} offline capture(s)...`);
    const captures = readOfflineCaptures();
    let flushed = 0;

    for (const capture of captures) {
      try {
        await client.capture(
          capture.text,
          capture.projectHint ?? config.projectId,
          capture.scopeHint as 'shared' | 'project' | 'personal' | 'mixed' | undefined,
        );
        flushed++;
      } catch (err) {
        console.error(`  Failed to flush capture from ${capture.capturedAt}: ${(err as Error).message}`);
        break; // Stop flushing on first failure to preserve order
      }
    }

    if (flushed === captures.length) {
      clearOfflineCaptures();
      console.log(`  All ${flushed} offline captures flushed.`);
    } else {
      console.warn(`  ${flushed}/${captures.length} captures flushed. Remaining will retry on next sync.`);
    }
  }

  console.log(`Last sync: ${new Date().toISOString()}`);
}
