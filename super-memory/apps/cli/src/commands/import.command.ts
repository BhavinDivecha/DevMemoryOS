import fs from 'node:fs';
import { loadProjectConfig } from '../config/cli-config.js';
import { makeClient } from '../clients/super-memory-api.client.js';
import { logger } from '../utils/logger.js';

export async function importCommand(cwd: string, file: string, options: any) {
  if (!fs.existsSync(file)) {
    logger.error(`File not found: ${file}`);
    return;
  }

  const config = loadProjectConfig(cwd);
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  const client = makeClient(config.apiUrl, config.apiKey);

  const token = options.token || config.authToken;

  const res = await client.createScanResult({
    repoPath: options.repoPath,
    remoteUrl: options.remoteUrl,
    detectedStack: data.scan?.detectedStack || {},
    generatedMemories: data.memories || data.generatedMemories || [],
    status: 'pending'
  }, token);

  logger.info(res.success ? 'Import pushed as pending scan result.' : `Import failed: ${JSON.stringify(res.error || {})}`);
}
