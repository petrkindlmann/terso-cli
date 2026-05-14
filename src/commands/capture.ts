import { Command } from 'commander';
import { execSync } from 'node:child_process';
import ora from 'ora';
import { loadProjectConfig } from '../lib/config.js';
import { OmnusApiClient } from '../lib/api-client.js';
import { appendOfflineCapture, pendingCaptureCount } from '../lib/offline-store.js';
import { BETA_LABEL, printBetaNotice } from '../lib/beta-notice.js';

export function registerCaptureCommand(program: Command): void {
  program
    .command('capture [text]')
    .description(`${BETA_LABEL} Send a knowledge fragment to Omnus for processing`)
    .option('--scope <scope>', 'Scope hint: shared, project, personal, mixed')
    .option('--project <id>', 'Override project ID')
    .option('--clipboard', 'Capture from clipboard')
    .action(async (text: string | undefined, options) => {
      try {
        printBetaNotice();
        await runCapture(text, options);
      } catch (error) {
        console.error('Capture failed:', error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });
}

interface CaptureOptions {
  scope?: string;
  project?: string;
  clipboard?: boolean;
}

function readClipboard(): string {
  const cmd = process.platform === 'darwin' ? 'pbpaste' : 'xclip -selection clipboard -o';
  try {
    return execSync(cmd, { encoding: 'utf-8' }).trim();
  } catch {
    throw new Error(
      `Failed to read clipboard. Ensure ${process.platform === 'darwin' ? 'pbpaste' : 'xclip'} is available.`
    );
  }
}

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

async function runCapture(text: string | undefined, options: CaptureOptions): Promise<void> {
  if (options.clipboard && !text) {
    text = readClipboard();
    if (!text) {
      console.error('Clipboard is empty.');
      process.exit(1);
    }
    console.log(`Read ${text.length} characters from clipboard.`);
  }

  if (!text) {
    console.error('No text provided. Pass text as argument or use --clipboard.');
    process.exit(1);
  }

  const config = loadProjectConfig();
  const client = new OmnusApiClient(config.apiUrl, config.apiKey);

  const projectHint = options.project || config.projectId;
  const scopeHint = options.scope as 'shared' | 'project' | 'personal' | 'mixed' | undefined;

  const spinner = ora(`Capturing to ${projectHint}`).start();

  // Try API with retry, then queue offline on terminal failure
  let lastError: Error | undefined;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      spinner.text = `Retrying (${attempt}/${MAX_RETRIES})...`;
    }
    try {
      const result = await client.capture(text, projectHint, scopeHint);
      spinner.succeed(`Queued for processing  (id: ${result.ingestionId})`);

      const pending = pendingCaptureCount();
      if (pending > 0) {
        console.log(`  ${pending} offline capture(s) pending — run \`terso sync\` to flush`);
      }
      return;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * (attempt + 1)));
      }
    }
  }

  // All retries failed — queue offline
  spinner.warn(`API unavailable after ${MAX_RETRIES + 1} attempts — saving offline`);

  appendOfflineCapture({
    text,
    projectHint,
    scopeHint,
    capturedAt: new Date().toISOString(),
  });

  const pending = pendingCaptureCount();
  console.log(`  ${pending} offline capture(s) queued — run \`terso sync\` to flush when connectivity returns`);
}
