import { Command } from 'commander';
import * as fs from 'node:fs';
import * as path from 'node:path';
import ora from 'ora';
import { detectProject } from '../lib/project-detector.js';
import { loadGlobalConfig } from '../lib/config.js';
import { OmnusApiClient } from '../lib/api-client.js';

const TERSO_DIR = '.terso';
const GENERATED_DIR = 'generated';
const PROJECT_CONFIG_FILE = 'project.json';
const GITIGNORE_CONTENT = `# Terso generated context (disposable, re-synced from API)
generated/
`;

const AGENTS_MD_TEMPLATE = `# Agent instructions

Single source of truth for AI agent behavior in this project.
Run \`terso emit\` to compile this file into per-agent configs
(\`CLAUDE.md\`, \`.cursorrules\`, \`.github/copilot-instructions.md\`).

## Project overview

<!-- One paragraph: what this project is and who uses it. -->

## Conventions

- <!-- e.g. Use TypeScript strict mode. -->
- <!-- e.g. All public functions must have JSDoc. -->

## Commands

- <!-- e.g. \`npm test\` runs the full suite. -->

## Don'ts

- <!-- e.g. Never commit to main directly. -->
`;

export function registerInitCommand(program: Command): void {
  program
    .command('init')
    .description('Initialize Terso in the current project directory')
    .option('--project-id <id>', 'Explicit Omnus project ID')
    .option('--api-url <url>', 'Omnus API base URL')
    .option('--skip-verify', 'Skip project verification against Omnus API')
    .action(async (options) => {
      try {
        await runInit(options);
      } catch (error) {
        console.error('Failed to initialize Terso:', error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });
}

interface InitOptions {
  projectId?: string;
  apiUrl?: string;
  skipVerify?: boolean;
}

async function runInit(options: InitOptions): Promise<void> {
  const cwd = process.cwd();
  const tersoDir = path.join(cwd, TERSO_DIR);
  const generatedDir = path.join(tersoDir, GENERATED_DIR);

  // Check if already initialized
  if (fs.existsSync(tersoDir)) {
    console.log('Terso is already initialized in this directory.');
    console.log(`  Config: ${path.join(tersoDir, PROJECT_CONFIG_FILE)}`);
    return;
  }

  // Detect project info from package.json/git/directory
  // Priority: package.json > git remote > directory name
  const detected = detectProject(cwd);

  // Resolve project ID: explicit flag > detected
  const projectId = options.projectId || detected.name || path.basename(cwd);

  // Resolve API URL: explicit flag > global config > default
  const globalConfig = loadGlobalConfig();
  const apiUrl = options.apiUrl || globalConfig.apiUrl || 'https://omnus.dev';

  console.log(`Detected project: "${projectId}" (from ${detected.source})`);

  // Verify project exists in Omnus (unless --skip-verify)
  let verified = false;
  if (!options.skipVerify) {
    const spinner = ora(`Verifying project against ${apiUrl}`).start();
    try {
      const client = new OmnusApiClient(apiUrl, globalConfig.apiKey);
      const project = await client.verifyProject(projectId);

      if (project) {
        spinner.succeed(`Project "${projectId}" verified`);
        verified = true;
      } else {
        spinner.warn(`Project "${projectId}" not found in Omnus — sync will fail until it is registered`);
      }
    } catch {
      spinner.warn('Could not verify project — continuing with unverified project ID');
    }
  }

  // Create directory structure
  fs.mkdirSync(generatedDir, { recursive: true });

  // Write project config
  const projectConfig = {
    projectId,
    apiUrl,
    detectedFrom: detected.source,
    verified,
    createdAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(tersoDir, PROJECT_CONFIG_FILE),
    JSON.stringify(projectConfig, null, 2) + '\n'
  );

  // Write .gitignore inside .terso/
  fs.writeFileSync(path.join(tersoDir, '.gitignore'), GITIGNORE_CONTENT);

  // Scaffold AGENTS.md if missing — single source for `terso emit`.
  const agentsPath = path.join(cwd, 'AGENTS.md');
  let agentsScaffolded = false;
  if (!fs.existsSync(agentsPath)) {
    fs.writeFileSync(agentsPath, AGENTS_MD_TEMPLATE);
    agentsScaffolded = true;
  }

  console.log('');
  console.log('Terso initialized.');
  console.log(`  Project ID: ${projectId}`);
  console.log(`  API URL:    ${apiUrl}`);
  if (agentsScaffolded) {
    console.log('  AGENTS.md:  scaffolded at project root');
  }
  console.log('');
  console.log('Next steps:');
  console.log('  terso emit    — compile AGENTS.md into per-agent config files');
  console.log('  terso sync    — pull project context from Omnus');
  console.log('  terso capture — send knowledge to Omnus');
  console.log('  terso doctor  — verify configuration and connectivity');
}
