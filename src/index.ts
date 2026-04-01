import { Command } from 'commander';
import { registerInitCommand } from './commands/init.js';
import { registerSyncCommand } from './commands/sync.js';
import { registerCaptureCommand } from './commands/capture.js';
import { registerSearchCommand } from './commands/search.js';
import { registerStatusCommand } from './commands/status.js';
import { registerDoctorCommand } from './commands/doctor.js';
import { registerWatchCommand } from './commands/watch.js';
import { registerCompileCommand } from './commands/compile.js';
import { registerAuthCommand } from './commands/auth.js';

const program = new Command();

program
  .name('terso')
  .description('Terso CLI — sync project knowledge from Omnus')
  .version('0.1.0');

registerInitCommand(program);
registerSyncCommand(program);
registerCaptureCommand(program);
registerSearchCommand(program);
registerStatusCommand(program);
registerDoctorCommand(program);
registerWatchCommand(program);
registerCompileCommand(program);
registerAuthCommand(program);

program.parse();
