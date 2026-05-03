import fs from 'node:fs';
import path from 'node:path';
import { loadProjectConfig } from '../config/cli-config.js';
import { scanRepo } from '../scanners/repo-scanner.js';
import { generateRepoSummary } from '../generators/repo-summary.generator.js';
import { generateRepoRules } from '../generators/repo-rules.generator.js';
import { generateApiContext } from '../generators/api-context.generator.js';
import { generateDbContext } from '../generators/db-context.generator.js';
import { generateCodexContext } from '../generators/codex-context.generator.js';
import { redactSecrets } from '../security/secret-redaction.js';
import { logger } from '../utils/logger.js';
import { makeClient } from '../clients/super-memory-api.client.js';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function scanCommand(target: string, options: any) {
  const cwd = path.resolve(target || process.cwd());
  const config = loadProjectConfig(cwd);
  const scan = scanRepo(cwd);

  const memories = [
    generateRepoSummary(scan),
    ...generateRepoRules(scan),
    generateApiContext(scan),
    generateDbContext(scan),
    generateCodexContext(scan),
    {
      scope: 'repo',
      title: 'Environment variable requirements',
      content: `Safe env templates include: ${(scan.env.variables || []).join(', ') || 'none detected'}. Do not hardcode these values.`,
      tags: ['env', 'config', 'deployment'],
      importance: 4,
      status: 'pending',
      source: 'repo_scan',
      metadata: { files: scan.env.files }
    }
  ].map((m) => ({ ...m, content: redactSecrets(m.content) }));

  const contextMd = `# Super Memory Local Context\n\n## Project\n${options.project || config.projectName || 'Unknown'}\n\n## Repo\n${options.repo || config.repoName || path.basename(cwd)}\n\n## Stack\n- Language: ${scan.detectedStack.language}\n- Runtime: ${scan.package.runtime}\n- Frameworks: ${(scan.package.frameworks || []).join(', ') || 'none'}\n- Package Manager: ${scan.package.packageManager}\n- Database: ${(scan.package.databases || []).join(', ') || 'none'}\n\n## Rules\n${memories.map((m) => `- ${m.title}: ${m.content}`).join('\n')}\n`;

  const smDir = path.join(cwd, '.supermemory');
  if (!fs.existsSync(smDir)) fs.mkdirSync(smDir, { recursive: true });
  fs.writeFileSync(path.join(smDir, 'context.md'), contextMd);
  fs.writeFileSync(path.join(smDir, 'latest-scan.json'), JSON.stringify({ scan, memories }, null, 2));

  logger.info('Scanning repo...');
  logger.info(`Detected language=${scan.detectedStack.language} framework=${(scan.package.frameworks || []).join(',') || 'none'} packageManager=${scan.package.packageManager}`);
  logger.info(`Generated memories: ${memories.length}`);

  if (options.json) console.log(JSON.stringify({ scan, memories }, null, 2));
  if (options.markdown) console.log(contextMd);

  if (options.push || config.autoPush) {
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
        description: `Auto-created by supermemory scan for ${projectName}`,
        status: 'active'
      }, token);
      if (created.success && created.data?.id) {
        project = created.data;
        config.projectId = created.data.id;
        const { saveProjectConfig } = await import('../config/cli-config.js');
        saveProjectConfig(cwd, config);
        projects = await client.listProjects(token);
      }
    }
    const repo = (repos.data || []).find((r: any) => r.name === (options.repo || config.repoName));

    const payload = {
      projectId: project?.id,
      repoId: repo?.id,
      repoPath: scan.root,
      remoteUrl: scan.git.remoteUrl,
      commitSha: scan.git.commitSha,
      branchName: scan.git.branchName,
      detectedStack: scan.detectedStack,
      generatedMemories: memories.map((m) => ({ ...m, status: options.pending || config.writeMode !== 'active' ? 'pending' : 'active' })),
      status: 'pending'
    };

    if (options.dryRun) {
      logger.info('Dry run enabled. Skipping push.');
      return;
    }

    const res = await client.createScanResult(payload, token);
    logger.info(`Scan result pushed: ${res.success ? 'OK' : 'FAILED'}`);
    if (!res.success) logger.error(JSON.stringify(res.error || {}, null, 2));
  }
}
