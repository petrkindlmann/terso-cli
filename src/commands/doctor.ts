import { Command } from 'commander';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { loadGlobalConfig, loadProjectConfig } from '../lib/config.js';
import { OmnusApiClient } from '../lib/api-client.js';

const TERSO_DIR = '.terso';
const GENERATED_DIR = 'generated';

export function registerDoctorCommand(program: Command): void {
  program
    .command('doctor')
    .description('Check Terso configuration, API connectivity, and file permissions')
    .action(async () => {
      try {
        await runDoctor();
      } catch (error) {
        console.error('Doctor failed:', error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });
}

interface CheckResult {
  name: string;
  status: 'ok' | 'warn' | 'fail';
  message: string;
}

async function runDoctor(): Promise<void> {
  const results: CheckResult[] = [];

  console.log('Terso Doctor');
  console.log('============\n');

  // Check 1: Global config
  results.push(checkGlobalConfig());

  // Check 2: Project initialization
  results.push(checkProjectInit());

  // Check 3: Project config validity
  results.push(checkProjectConfig());

  // Check 4: Generated directory permissions
  results.push(checkGeneratedDir());

  // Check 5: Git ignore
  results.push(checkGitIgnore());

  // Check 6: API connectivity
  results.push(await checkApiConnectivity());

  // Print results
  let hasFailures = false;
  for (const result of results) {
    const icon = result.status === 'ok' ? '[OK]' : result.status === 'warn' ? '[WARN]' : '[FAIL]';
    console.log(`  ${icon} ${result.name}: ${result.message}`);
    if (result.status === 'fail') hasFailures = true;
  }

  console.log('');
  if (hasFailures) {
    console.log('Some checks failed. Fix the issues above and run `terso doctor` again.');
  } else {
    console.log('All checks passed.');
  }
}

function checkGlobalConfig(): CheckResult {
  const globalConfig = loadGlobalConfig();
  if (globalConfig.apiUrl && globalConfig.apiKey) {
    return { name: 'Global config', status: 'ok', message: 'Found with API key' };
  }
  if (globalConfig.apiUrl) {
    return { name: 'Global config', status: 'warn', message: 'Found but no API key set' };
  }
  return { name: 'Global config', status: 'warn', message: 'Not found at ~/.terso/config.json (using defaults)' };
}

function checkProjectInit(): CheckResult {
  const tersoDir = path.join(process.cwd(), TERSO_DIR);
  if (fs.existsSync(tersoDir)) {
    return { name: 'Project init', status: 'ok', message: '.terso/ directory exists' };
  }
  return { name: 'Project init', status: 'fail', message: '.terso/ not found. Run `terso init`' };
}

function checkProjectConfig(): CheckResult {
  try {
    const config = loadProjectConfig();
    if (!config.projectId) {
      return { name: 'Project config', status: 'fail', message: 'Missing projectId in .terso/project.json' };
    }
    return { name: 'Project config', status: 'ok', message: `Project: ${config.projectId}` };
  } catch {
    return { name: 'Project config', status: 'fail', message: 'Cannot read .terso/project.json' };
  }
}

function checkGeneratedDir(): CheckResult {
  const generatedDir = path.join(process.cwd(), TERSO_DIR, GENERATED_DIR);
  if (!fs.existsSync(generatedDir)) {
    return { name: 'Generated dir', status: 'warn', message: '.terso/generated/ does not exist (will be created on sync)' };
  }

  try {
    fs.accessSync(generatedDir, fs.constants.W_OK);
    return { name: 'Generated dir', status: 'ok', message: '.terso/generated/ is writable' };
  } catch {
    return { name: 'Generated dir', status: 'fail', message: '.terso/generated/ is not writable' };
  }
}

function checkGitIgnore(): CheckResult {
  const gitignorePath = path.join(process.cwd(), TERSO_DIR, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, 'utf-8');
    if (content.includes('generated/')) {
      return { name: 'Git ignore', status: 'ok', message: 'generated/ is in .terso/.gitignore' };
    }
    return { name: 'Git ignore', status: 'warn', message: '.terso/.gitignore exists but does not exclude generated/' };
  }
  return { name: 'Git ignore', status: 'warn', message: 'No .terso/.gitignore (generated files may be committed)' };
}

async function checkApiConnectivity(): Promise<CheckResult> {
  try {
    const config = loadProjectConfig();
    const client = new OmnusApiClient(config.apiUrl, config.apiKey);
    await client.healthCheck();
    return { name: 'API connectivity', status: 'ok', message: `Connected to ${config.apiUrl}` };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return { name: 'API connectivity', status: 'fail', message: `Cannot reach API: ${msg}` };
  }
}
