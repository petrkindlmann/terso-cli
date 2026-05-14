import { Command } from 'commander';
import { loadGlobalConfig, saveGlobalConfig } from '../lib/config.js';
import { BETA_LABEL } from '../lib/beta-notice.js';

export function registerAuthCommand(program: Command): void {
  const auth = program
    .command('auth')
    .description(`${BETA_LABEL} Manage Omnus API authentication`);

  auth
    .command('set')
    .description('Set API token for authentication')
    .argument('<token>', 'Omnus API token')
    .action((token: string) => {
      const config = loadGlobalConfig();
      config.apiKey = token;
      saveGlobalConfig(config);
      console.log('API token saved to ~/.terso/config.json');
    });

  auth
    .command('status')
    .description('Show current authentication status')
    .action(() => {
      // Also check env var override
      const envToken = process.env.TERSO_API_TOKEN;
      const config = loadGlobalConfig();

      if (envToken) {
        console.log(`Authenticated via TERSO_API_TOKEN env var (${envToken.slice(0, 8)}...)`);
      } else if (config.apiKey) {
        console.log(`Authenticated via ~/.terso/config.json (${config.apiKey.slice(0, 8)}...)`);
      } else {
        console.log('Not authenticated. Run `terso auth set <token>` to set a token.');
      }

      if (config.apiUrl) {
        console.log(`API URL: ${config.apiUrl}`);
      }
    });

  auth
    .command('clear')
    .description('Remove stored API token')
    .action(() => {
      const config = loadGlobalConfig();
      delete config.apiKey;
      saveGlobalConfig(config);
      console.log('API token removed from ~/.terso/config.json');
    });
}
