import { Command } from 'commander';
import { VERSION } from './lib/version.js';
import { registerInitCommand } from './commands/init.js';
import { registerSyncCommand } from './commands/sync.js';
import { registerCaptureCommand } from './commands/capture.js';
import { registerSearchCommand } from './commands/search.js';
import { registerStatusCommand } from './commands/status.js';
import { registerDoctorCommand } from './commands/doctor.js';
import { registerWatchCommand } from './commands/watch.js';
import { registerCompileCommand } from './commands/compile.js';
import { registerEmitCommand } from './commands/emit.js';
import { registerMcpCommand } from './commands/mcp.js';
import { registerAuthCommand } from './commands/auth.js';
import { registerInstallHookCommand } from './commands/install-hook.js';

const program = new Command();

program
  .name('terso')
  .description('Terso CLI — compile AGENTS.md into per-agent configs and sync project knowledge from Omnus')
  .version(VERSION);

registerInitCommand(program);
registerSyncCommand(program);
registerCaptureCommand(program);
registerSearchCommand(program);
registerStatusCommand(program);
registerDoctorCommand(program);
registerWatchCommand(program);
registerCompileCommand(program);
registerEmitCommand(program);
registerMcpCommand(program);
registerAuthCommand(program);
registerInstallHookCommand(program);

program.parse();
