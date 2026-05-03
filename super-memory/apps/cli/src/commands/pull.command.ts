import fs from 'node:fs';
import path from 'node:path';
import { loadProjectConfig } from '../config/cli-config.js';
import { makeClient } from '../clients/super-memory-api.client.js';
import { logger } from '../utils/logger.js';

export async function pullCommand(cwd: string) {
  const config = loadProjectConfig(cwd);
  const client = makeClient(config.apiUrl, config.apiKey);

  const query = `${config.projectName || ''} ${config.repoName || ''} architecture rules`.trim();
  const res = await client.memorySearch(query);
  if (!res.success) {
    logger.error(`Pull failed: ${JSON.stringify(res.error || {})}`);
    return;
  }

  const memories = res.data?.memories || [];
  const md = `# Super Memory Local Context\n\n${memories.map((m: any) => `## ${m.title}\n\n${m.content}`).join('\n\n')}`;
  const file = path.join(cwd, '.supermemory', 'context.md');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, md);
  logger.info(`Updated ${file}`);
}
