#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from './commands/init.command.js';
import { doctorCommand } from './commands/doctor.command.js';
import { scanCommand } from './commands/scan.command.js';
import { pushCommand } from './commands/push.command.js';
import { pullCommand } from './commands/pull.command.js';
import { exportCommand } from './commands/export.command.js';
import { importCommand } from './commands/import.command.js';
import { loginCommand } from './commands/login.command.js';
import { logoutCommand } from './commands/logout.command.js';
import { setApiKeyCommand } from './commands/set-api-key.command.js';

const program = new Command();
program.name('supermemory').description('Super Memory CLI').version('0.1.0');

program
  .command('init')
  .option('--project <name>')
  .option('--repo <name>')
  .option('--api-url <url>')
  .option('--api-key <key>')
  .option('--create-api-key [name]', 'auto create API key using logged-in user token')
  .option('--mcp <client>', 'generate MCP config for: codex|claude|cursor|windsurf')
  .option('--mcp-all', 'generate MCP configs for codex, claude, cursor, windsurf')
  .action(async (opts) => {
    await initCommand({
      projectName: opts.project,
      repoName: opts.repo,
      apiUrl: opts.apiUrl,
      apiKey: opts.apiKey,
      createApiKey: opts.createApiKey,
      mcp: opts.mcp,
      mcpAll: opts.mcpAll
    } as any);
  });

program.command('doctor').action(async () => doctorCommand(process.cwd()));

program
  .command('login')
  .option('--email <email>')
  .option('--password <password>')
  .action(async (opts) => loginCommand(process.cwd(), opts));

program.command('logout').action(async () => logoutCommand(process.cwd()));

program
  .command('set-api-key')
  .option('--api-key <key>')
  .action(async (opts) => setApiKeyCommand(process.cwd(), opts));

program
  .command('scan [target]')
  .option('--project <name>')
  .option('--repo <name>')
  .option('--dry-run')
  .option('--json')
  .option('--markdown')
  .option('--push')
  .option('--pending')
  .option('--token <jwt>')
  .action(async (target, opts) => scanCommand(target || process.cwd(), opts));

program
  .command('push')
  .option('--pending')
  .option('--active')
  .option('--project <name>')
  .option('--repo <name>')
  .option('--token <jwt>')
  .action(async (opts) => pushCommand(process.cwd(), opts));

program.command('pull').action(async () => pullCommand(process.cwd()));

program
  .command('export')
  .option('--format <format>', 'json|markdown', 'json')
  .action(async (opts) => exportCommand(process.cwd(), opts.format));

program
  .command('import')
  .requiredOption('--file <path>')
  .option('--repo-path <path>')
  .option('--remote-url <url>')
  .option('--token <jwt>')
  .action(async (opts) => importCommand(process.cwd(), opts.file, opts));

program.parseAsync(process.argv);
