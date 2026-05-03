# Super Memory (Phase 1)

Phase 1 core memory server without MCP integration.

## Stack
- API: Fastify + TypeScript + Prisma
- DB: PostgreSQL + pgvector
- Web: React + Vite + Tailwind + React Query + Zustand + React Hook Form
- Infra: Docker Compose

## Features
- JWT auth: register/login/me
- Projects, clients, repos CRUD
- Memories CRUD + search + archive/restore + bulk archive
- API key creation/list/revoke (secret shown only once)
- JSON export/import
- Embeddings abstraction (works when disabled)
- Seed data for initial memories

## Setup
1. `cd /Volumes/BhavinDivecha/Projects/DevMemoryOS/super-memory`
2. `cp .env.example .env`
3. Fill `JWT_SECRET` and optional `OPENAI_API_KEY`
4. Run: `docker compose up --build`

## URLs
- API: `http://localhost:4000`
- Web: `http://localhost:5173`
- Postgres: `localhost:5432`

## API Prefix
All endpoints are under `/api/v1`.

## Security Notes
- Passwords hashed with bcrypt.
- API keys are stored as SHA-256 hashes.
- User-level data isolation is applied on API queries.
- Do not store passwords, private keys, API tokens, or sensitive customer data.


## Phase 3 (CLI + Scanner)
- CLI app: `apps/cli`
- Scan endpoints: `/api/v1/scan-results`
- Dashboard scans page: `/scans`
- Docs: `docs/phase3-cli.md`
