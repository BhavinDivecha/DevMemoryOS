# Codex MCP Setup

## Global config

File: `~/.codex/config.toml`

```toml
[mcp_servers.super_memory]
command = "node"
args = ["/absolute/path/to/super-memory/apps/mcp-server/dist/index.js"]

[mcp_servers.super_memory.env]
SUPER_MEMORY_API_URL = "http://localhost:4000"
SUPER_MEMORY_API_KEY = "smem_your_key_here"
MCP_WRITE_MODE = "suggest"
MCP_ENABLE_RESOURCES = "true"
MCP_ENABLE_PROMPTS = "true"
```

## Project config

File: `.codex/config.toml`

```toml
[mcp_servers.super_memory]
command = "node"
args = ["../../super-memory/apps/mcp-server/dist/index.js"]

[mcp_servers.super_memory.env]
SUPER_MEMORY_API_URL = "http://localhost:4000"
SUPER_MEMORY_API_KEY = "smem_your_key_here"
MCP_PROJECT_NAME = "Super Memory"
MCP_REPO_PATH = "/absolute/path/to/repo"
MCP_WRITE_MODE = "suggest"
```
