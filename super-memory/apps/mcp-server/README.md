# Super Memory MCP Server

Local MCP stdio server for Codex/Claude integrations.

## Run

```bash
npm run dev -w @super-memory/mcp-server
```

## Build

```bash
npm run build -w @super-memory/mcp-server
npm run start -w @super-memory/mcp-server
```

## Required env

- `SUPER_MEMORY_API_URL`
- `SUPER_MEMORY_API_KEY`
- `MCP_WRITE_MODE` (`readonly` | `suggest` | `direct`)
