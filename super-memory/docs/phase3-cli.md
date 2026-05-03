# Phase 3 CLI

## Setup

```bash
cd /Volumes/BhavinDivecha/Projects/DevMemoryOS/super-memory
npm install
npm run build -w @super-memory/cli
```

## Commands

```bash
supermemory init --project "Super Memory" --repo "super-memory"
supermemory init --project "Super Memory" --repo "super-memory" --create-api-key
supermemory init --project "Super Memory" --repo "super-memory" --mcp codex
supermemory init --project "Super Memory" --repo "super-memory" --mcp-all
supermemory set-api-key
supermemory login
supermemory logout
supermemory doctor
supermemory scan . --markdown
supermemory scan . --push
supermemory push --pending
supermemory pull
supermemory export --format markdown
supermemory import --file ./super-memory-export.json
```

`supermemory login` stores JWT token in `.supermemory/config.json` as `authToken`.

## Generated local files

- `.supermemory/config.json`
- `.supermemory/ignore`
- `.supermemory/context.md`
- `.supermemory/latest-scan.json`
