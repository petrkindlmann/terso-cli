import { Command } from 'commander';
import * as fs from 'node:fs';
import * as path from 'node:path';
import ora from 'ora';
import { loadProjectConfig, ProjectConfig } from '../lib/config.js';
import { OmnusApiClient } from '../lib/api-client.js';

const TERSO_DIR = '.terso';
const GENERATED_DIR = 'generated';

export function registerStatusCommand(program: Command): void {
  program
    .command('status')
    .description('Show project status and freshness of generated context files')
    .action(async () => {
      try {
        await runStatus();
      } catch (error) {
        console.error('Status check failed:', error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });
}

async function runStatus(): Promise<void> {
  let config: ProjectConfig;
  try {
    config = loadProjectConfig();
  } catch {
    console.log('Terso is not initialized in this directory.');
    console.log('Run `terso init` to get started.');
    return;
  }

  console.log('Terso Project Status');
  console.log('====================');
  console.log(`  Project ID: ${config.projectId}`);
  console.log(`  API URL:    ${config.apiUrl}`);
  console.log('');

  // Check generated files
  const generatedDir = path.join(process.cwd(), TERSO_DIR, GENERATED_DIR);

  if (!fs.existsSync(generatedDir)) {
    console.log('Generated context: no files (run `terso sync`)');
    return;
  }

  const files = fs.readdirSync(generatedDir).filter((f) => f.endsWith('.md'));

  if (files.length === 0) {
    console.log('Generated context: no files (run `terso sync`)');
    return;
  }

  console.log(`Generated context: ${files.length} file(s)`);
  console.log('');

  for (const file of files) {
    const filePath = path.join(generatedDir, file);
    const stats = fs.statSync(filePath);
    const age = getAge(stats.mtimeMs);
    console.log(`  ${file}`);
    console.log(`    Modified: ${stats.mtime.toISOString()} (${age})`);
  }

  // Try to get remote status
  console.log('');
  const spinner = ora('Fetching remote status').start();
  try {
    const client = new OmnusApiClient(config.apiUrl, config.apiKey);
    const remoteStatus = await client.getStatus(config.projectId);
    spinner.succeed('Remote status');
    console.log(`  Fragments:      ${remoteStatus.fragmentCount ?? 'unknown'}`);
    console.log(`  Last ingestion: ${remoteStatus.lastIngestion ?? 'none'}`);
    console.log(`  Last export:    ${remoteStatus.lastExport ?? 'never'}`);
  } catch {
    spinner.warn('Remote status unavailable (API not reachable)');
  }
}

function getAge(mtimeMs: number): string {
  const ageMs = Date.now() - mtimeMs;
  const minutes = Math.floor(ageMs / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}
