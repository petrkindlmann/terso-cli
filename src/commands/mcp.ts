import { Command } from 'commander';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMcpServer, defaultDeps } from '../lib/mcp-server.js';

type ClientId = 'claude' | 'cursor' | 'codex';

const CLIENT_CONFIGS: Record<ClientId, { label: string; configPath: string; example: object }> = {
  claude: {
    label: 'Claude Code',
    configPath: '.mcp.json (project) or ~/.claude.json (user)',
    example: {
      mcpServers: {
        terso: {
          command: 'terso',
          args: ['mcp'],
        },
      },
    },
  },
  cursor: {
    label: 'Cursor',
    configPath: '~/.cursor/mcp.json (user) or .cursor/mcp.json (project)',
    example: {
      mcpServers: {
        terso: {
          command: 'terso',
          args: ['mcp'],
        },
      },
    },
  },
  codex: {
    label: 'Codex CLI',
    configPath: '~/.codex/config.toml (mcp_servers section)',
    example: {
      mcp_servers: {
        terso: {
          command: 'terso',
          args: ['mcp'],
        },
      },
    },
  },
};

export function registerMcpCommand(program: Command): void {
  const mcp = program
    .command('mcp')
    .description('Run an MCP server exposing project context to AI agents');

  mcp
    .action(async () => {
      try {
        await runServer();
      } catch (error) {
        console.error('MCP server failed:', error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });

  mcp
    .command('install')
    .description('Print install snippet for connecting an agent client to terso mcp')
    .requiredOption(
      '--client <name>',
      `agent client: ${Object.keys(CLIENT_CONFIGS).join(' | ')}`,
    )
    .option('--print', 'print the snippet (default; auto-write not yet supported)', true)
    .action((options: { client: string }) => {
      const client = options.client as ClientId;
      const config = CLIENT_CONFIGS[client];
      if (!config) {
        console.error(
          `Unknown client "${options.client}". Supported: ${Object.keys(CLIENT_CONFIGS).join(', ')}`,
        );
        process.exit(1);
      }
      printSnippet(client, config);
    });
}

async function runServer(): Promise<void> {
  const server = createMcpServer(defaultDeps());
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Server runs until stdio closes (parent process exits).
}

function printSnippet(
  client: ClientId,
  config: { label: string; configPath: string; example: object },
): void {
  console.log(`# ${config.label}`);
  console.log(`# Add this to: ${config.configPath}`);
  console.log('');
  if (client === 'codex') {
    console.log('[mcp_servers.terso]');
    console.log('command = "terso"');
    console.log('args = ["mcp"]');
  } else {
    console.log(JSON.stringify(config.example, null, 2));
  }
  console.log('');
  console.log('After saving, restart your agent client.');
}
