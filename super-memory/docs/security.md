# MCP Security

- Default `MCP_WRITE_MODE=suggest`
- `readonly` blocks all writes
- `direct` enables `memory_save`
- API key is mandatory for MCP endpoints
- Audit entries are written to `mcp_audit_logs`
- Secrets are redacted (API keys, JWTs, DB URLs, passwords, private keys)
- Result limits enforced by tool schemas
