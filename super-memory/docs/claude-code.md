# Claude Code MCP Setup

## CLI-style setup

```bash
claude mcp add super-memory node /absolute/path/to/super-memory/apps/mcp-server/dist/index.js
```

Then provide env values:

```env
SUPER_MEMORY_API_URL=http://localhost:4000
SUPER_MEMORY_API_KEY=smem_your_key_here
MCP_WRITE_MODE=suggest
MCP_ENABLE_RESOURCES=true
MCP_ENABLE_PROMPTS=true
```

If your Claude Code version uses JSON config, use the same command + env values in its MCP server entry.
