import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { CliConfig, defaultConfig, ensureDir, loadProjectConfig, saveProjectConfig } from '../config/cli-config.js';
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

function writeMcpConfigs(cwd: string, mcpTargets: string[], config: CliConfig) {
  const mcpDir = path.join(cwd, '.supermemory', 'mcp');
  fs.mkdirSync(mcpDir, { recursive: true });

  const key = config.apiKey || 'smem_replace_me';
  const apiUrl = config.apiUrl || 'http://localhost:4000';
  const projectName = config.projectName || 'Project';
  const repoPath = cwd;

  if (mcpTargets.includes('codex')) {
    const codexDir = path.join(cwd, '.codex');
    fs.mkdirSync(codexDir, { recursive: true });
    fs.writeFileSync(
      path.join(codexDir, 'config.toml'),
      `[mcp_servers.super_memory]\ncommand = \"node\"\nargs = [\"/Volumes/BhavinDivecha/Projects/DevMemoryOS/super-memory/apps/mcp-server/dist/index.js\"]\n\n[mcp_servers.super_memory.env]\nSUPER_MEMORY_API_URL = \"${apiUrl}\"\nSUPER_MEMORY_API_KEY = \"${key}\"\nMCP_PROJECT_NAME = \"${projectName}\"\nMCP_REPO_PATH = \"${repoPath}\"\nMCP_WRITE_MODE = \"suggest\"\nMCP_ENABLE_RESOURCES = \"true\"\nMCP_ENABLE_PROMPTS = \"true\"\n`
    );
  }

  if (mcpTargets.includes('claude')) {
    fs.writeFileSync(
      path.join(mcpDir, 'claude.md'),
      `# Claude MCP Setup\n\nUse:\n\n\`\`\`bash\nclaude mcp add super-memory node /Volumes/BhavinDivecha/Projects/DevMemoryOS/super-memory/apps/mcp-server/dist/index.js\n\`\`\`\n\nEnv:\n\n\`\`\`env\nSUPER_MEMORY_API_URL=${apiUrl}\nSUPER_MEMORY_API_KEY=${key}\nMCP_WRITE_MODE=suggest\nMCP_PROJECT_NAME=${projectName}\nMCP_REPO_PATH=${repoPath}\n\`\`\`\n`
    );
  }

  if (mcpTargets.includes('cursor')) {
    fs.writeFileSync(
      path.join(mcpDir, 'cursor.json'),
      JSON.stringify(
        {
          mcpServers: {
            super_memory: {
              command: 'node',
              args: ['/Volumes/BhavinDivecha/Projects/DevMemoryOS/super-memory/apps/mcp-server/dist/index.js'],
              env: {
                SUPER_MEMORY_API_URL: apiUrl,
                SUPER_MEMORY_API_KEY: key,
                MCP_WRITE_MODE: 'suggest',
                MCP_PROJECT_NAME: projectName,
                MCP_REPO_PATH: repoPath
              }
            }
          }
        },
        null,
        2
      )
    );
  }

  if (mcpTargets.includes('windsurf')) {
    fs.writeFileSync(
      path.join(mcpDir, 'windsurf.json'),
      JSON.stringify(
        {
          mcpServers: {
            super_memory: {
              command: 'node',
              args: ['/Volumes/BhavinDivecha/Projects/DevMemoryOS/super-memory/apps/mcp-server/dist/index.js'],
              env: {
                SUPER_MEMORY_API_URL: apiUrl,
                SUPER_MEMORY_API_KEY: key,
                MCP_WRITE_MODE: 'suggest',
                MCP_PROJECT_NAME: projectName,
                MCP_REPO_PATH: repoPath
              }
            }
          }
        },
        null,
        2
      )
    );
  }

  logger.info(`Generated MCP config templates in ${mcpDir}`);
}

export async function initCommand(options: Partial<CliConfig> & { cwd?: string }) {
  const cwd = options.cwd || process.cwd();
  const dir = ensureDir(cwd);
  const existing = loadProjectConfig(cwd);

  const config: CliConfig = {
    ...defaultConfig,
    ...existing,
    projectName: options.projectName || existing.projectName,
    repoName: options.repoName || existing.repoName,
    apiUrl: options.apiUrl || existing.apiUrl || defaultConfig.apiUrl,
    apiKey: options.apiKey || existing.apiKey,
    writeMode: options.writeMode || 'pending',
    defaultScope: options.defaultScope || 'repo',
    autoPush: options.autoPush !== undefined ? Boolean(options.autoPush) : Boolean(existing.autoPush),
    includePatterns: options.includePatterns || defaultConfig.includePatterns,
    excludePatterns: options.excludePatterns || defaultConfig.excludePatterns
  };

  if (!config.apiKey) {
    const rl = readline.createInterface({ input, output });
    const entered = (await rl.question('Super Memory API key (optional, press enter to skip): ')).trim();
    rl.close();
    if (entered) config.apiKey = entered;
  }

  const createApiKeyFlag = (options as any).createApiKey;
  if (!config.apiKey && createApiKeyFlag) {
    if (!config.authToken) {
      logger.warn('Cannot auto-create API key without login. Run `supermemory login` first.');
    } else {
      const client = makeClient(config.apiUrl, config.apiKey);
      const keyName = typeof createApiKeyFlag === 'string' ? createApiKeyFlag : `${config.repoName || 'repo'}-cli-key`;
      const created = await client.createApiKey(keyName, config.authToken);
      if (created.success && created.data?.key) {
        config.apiKey = created.data.key;
        logger.info(`Auto-created API key '${keyName}' and stored in config.`);
      } else {
        logger.warn(`Failed to auto-create API key: ${JSON.stringify(created.error || created)}`);
      }
    }
  }

  if (config.projectName && (config.authToken || config.apiKey)) {
    const client = makeClient(config.apiUrl, config.apiKey);
    const projects = await client.listProjects(config.authToken);
    const existing = (projects.data || []).find((p: any) => p.name?.toLowerCase() === config.projectName?.toLowerCase());

    if (existing?.id) {
      config.projectId = existing.id;
      logger.info(`Linked to existing project: ${existing.name} (${existing.id})`);
    } else {
      const created = await client.createProject({
        name: config.projectName,
        slug: slugify(config.projectName),
        description: `Auto-created by supermemory init for ${config.projectName}`,
        status: 'active'
      }, config.authToken);

      if (created.success && created.data?.id) {
        config.projectId = created.data.id;
        logger.info(`Created and linked project: ${config.projectName} (${created.data.id})`);
      } else {
        logger.warn(`Could not auto-create project during init: ${JSON.stringify(created.error || created)}`);
      }
    }
  } else if (config.projectName && !config.authToken && !config.apiKey) {
    logger.warn('No auth method found. Set API key (`supermemory set-api-key`) or run `supermemory login` then init again.');
  }

  saveProjectConfig(cwd, config);

  const mcpTargets: string[] = [];
  const rawMcp = (options as any).mcp;
  if (rawMcp) mcpTargets.push(String(rawMcp).toLowerCase());
  if ((options as any).mcpAll) mcpTargets.push('codex', 'claude', 'cursor', 'windsurf');
  const normalized = Array.from(new Set(mcpTargets)).filter((x) => ['codex', 'claude', 'cursor', 'windsurf'].includes(x));
  if (normalized.length) writeMcpConfigs(cwd, normalized, config);

  const ignoreFile = path.join(dir, 'ignore');
  if (!fs.existsSync(ignoreFile)) fs.writeFileSync(ignoreFile, defaultConfig.excludePatterns.join('\n') + '\n');

  const contextFile = path.join(dir, 'context.md');
  if (!fs.existsSync(contextFile)) fs.writeFileSync(contextFile, '# Super Memory Local Context\n\n');

  const latestFile = path.join(dir, 'latest-scan.json');
  if (!fs.existsSync(latestFile)) fs.writeFileSync(latestFile, JSON.stringify({ memories: [] }, null, 2));

  logger.info(`Initialized ${dir}`);
}
