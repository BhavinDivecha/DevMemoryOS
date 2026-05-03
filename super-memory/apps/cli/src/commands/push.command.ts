import fs from 'node:fs';
import path from 'node:path';
import { loadProjectConfig } from '../config/cli-config.js';
import { makeClient } from '../clients/super-memory-api.client.js';
import { logger } from '../utils/logger.js';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function pushCommand(cwd: string, options: any) {
  const config = loadProjectConfig(cwd);
  const latest = path.join(cwd, '.supermemory', 'latest-scan.json');
  if (!fs.existsSync(latest)) {
    logger.error('No latest-scan.json found. Run supermemory scan first.');
    return;
  }

  const parsed = JSON.parse(fs.readFileSync(latest, 'utf-8'));
  const scan = parsed.scan || {};
  const memories = (parsed.memories || []).map((m: any) => ({ ...m, status: options.active ? 'active' : 'pending' }));

  const client = makeClient(config.apiUrl, config.apiKey);
  const token = options.token || config.authToken;
  const authAvailable = Boolean(token || config.apiKey);
  let projects = authAvailable ? await client.listProjects(token) : { data: [] };
  const repos = authAvailable ? await client.listRepos(token) : { data: [] };
  let project = (projects.data || []).find((p: any) => p.id === config.projectId)
    || (projects.data || []).find((p: any) => p.name === (options.project || config.projectName));

  if (!project && authAvailable && (options.project || config.projectName)) {
    const projectName = options.project || config.projectName;
    const created = await client.createProject({
      name: projectName,
      slug: slugify(projectName),
      description: `Auto-created by supermemory push for ${projectName}`,
      status: 'active'
    }, token);
    if (created.success && created.data?.id) {
      project = created.data;
      config.projectId = created.data.id;
      projects = await client.listProjects(token);
    }
  }
  const repo = (repos.data || []).find((r: any) => r.name === (options.repo || config.repoName));

  const res = await client.createScanResult(
    {
      projectId: project?.id,
      repoId: repo?.id,
      repoPath: scan.root,
      remoteUrl: scan.git?.remoteUrl,
      commitSha: scan.git?.commitSha,
      branchName: scan.git?.branchName,
      detectedStack: scan.detectedStack || {},
      generatedMemories: memories,
      status: 'pending'
    },
    token
  );

  if (project?.id && project.id !== config.projectId) {
    config.projectId = project.id;
    const { saveProjectConfig } = await import('../config/cli-config.js');
    saveProjectConfig(cwd, config);
  }

  logger.info(res.success ? 'Push completed.' : `Push failed: ${JSON.stringify(res.error || {})}`);
}
