import fs from 'node:fs';
import path from 'node:path';
import { makeClient } from '../clients/super-memory-api.client.js';
import { loadProjectConfig } from '../config/cli-config.js';
import { logger } from '../utils/logger.js';
import { getGitMeta } from '../utils/git.js';

export async function doctorCommand(cwd: string) {
  const config = loadProjectConfig(cwd);
  const client = makeClient(config.apiUrl, config.apiKey);

  const checks: Array<[string, boolean, string]> = [];
  checks.push(['.supermemory/config.json', fs.existsSync(path.join(cwd, '.supermemory', 'config.json')), 'project config exists']);
  checks.push(['git repo', Boolean(getGitMeta(cwd).commitSha), 'git metadata accessible']);
  checks.push(['api key present', Boolean(config.apiKey), 'api key set in config']);
  checks.push(['auth token present (optional)', Boolean(config.authToken) || Boolean(config.apiKey), 'token not required when apiKey is set']);
  checks.push(['api reachable', await client.health(), 'health endpoint reachable']);

  for (const [name, ok, detail] of checks) {
    logger.info(`${ok ? 'PASS' : 'FAIL'} ${name} - ${detail}`);
  }
}
