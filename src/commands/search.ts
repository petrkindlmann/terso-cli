import { Command } from 'commander';
import ora from 'ora';
import { loadProjectConfig } from '../lib/config.js';
import { OmnusApiClient } from '../lib/api-client.js';
import { BETA_LABEL, printBetaNotice } from '../lib/beta-notice.js';

export function registerSearchCommand(program: Command): void {
  program
    .command('search <query>')
    .description(`${BETA_LABEL} Search knowledge base in Omnus`)
    .option('--scope <scope>', 'Filter by scope: shared, project, personal')
    .option('--kind <kind>', 'Filter by kind: fact, decision, procedure, etc.')
    .option('--limit <n>', 'Maximum results', '10')
    .action(async (query: string, options) => {
      try {
        printBetaNotice();
        await runSearch(query, options);
      } catch (error) {
        console.error('Search failed:', error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });
}

interface SearchOptions {
  scope?: string;
  kind?: string;
  limit: string;
}

interface SearchResult {
  id: string;
  summary: string;
  kind: string;
  scope: string;
  confidence: number;
  createdAt: string;
}

async function runSearch(query: string, options: SearchOptions): Promise<void> {
  const config = loadProjectConfig();
  const client = new OmnusApiClient(config.apiUrl, config.apiKey);

  const spinner = ora(`Searching for "${query}"`).start();

  let results;
  try {
    results = await client.search(query, {
      scope: options.scope,
      kind: options.kind,
      limit: parseInt(options.limit, 10),
    });
  } catch (error) {
    spinner.fail(`Search failed: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
    return;
  }

  if (!results.records || results.records.length === 0) {
    spinner.info('No results found.');
    return;
  }

  spinner.succeed(`Found ${results.records.length} result(s)`);
  console.log('');

  for (const record of results.records) {
    const confidence = Math.round((record.confidence || 0) * 100);
    const score = Math.round((record.score || 0) * 100);
    console.log(`  [${record.kind}] ${record.title}`);
    console.log(`    Scope: ${record.scope}  Score: ${score}%  Confidence: ${confidence}%  ID: ${record.id}`);
    console.log('');
  }
}
