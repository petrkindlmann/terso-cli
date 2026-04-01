import { Command } from 'commander';
import ora from 'ora';
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

  const spinner = ora(`Syncing context for ${config.projectId}`).start();

  let context;
  try {
    context = await client.exportContext(config.projectId, { force: options.force });
  } catch (error) {
    spinner.fail(`Sync failed: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
    return;
  }

  const filesMap = context.files ?? {};
  const fileEntries = Object.entries(filesMap);

  if (fileEntries.length === 0) {
    spinner.info('No context files available for this project.');
    return;
  }

  if (options.dryRun) {
    spinner.stop();
    console.log(`Would write ${fileEntries.length} file(s):`);
    for (const [p] of fileEntries) {
      console.log(`  ${p}`);
    }
    return;
  }

  const filesForWriter = fileEntries.map(([filePath, content]) => ({ path: filePath, content }));
  const written = writeContextFiles(filesForWriter);

  spinner.succeed(`Synced ${written} changed file(s) of ${fileEntries.length} total`);

  // Flush offline captures if any
  const pending = pendingCaptureCount();
  if (pending > 0) {
    const flushSpinner = ora(`Flushing ${pending} offline capture(s)`).start();
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
        flushSpinner.fail(`Failed at capture ${flushed + 1}: ${(err as Error).message}`);
        break;
      }
    }

    if (flushed === captures.length) {
      clearOfflineCaptures();
      flushSpinner.succeed(`All ${flushed} offline capture(s) flushed`);
    } else {
      flushSpinner.warn(`${flushed}/${captures.length} captures flushed — remainder will retry on next sync`);
    }
  }
}
