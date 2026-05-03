import { env } from "../config/env.js";

export class SuperMemoryApiClient {
  private async request(path: string, method: string, body?: any) {
    const res = await fetch(`${env.SUPER_MEMORY_API_URL}/api/v1${path}`, {
      method,
      headers: {
        "content-type": "application/json",
        "x-api-key": env.SUPER_MEMORY_API_KEY
      },
      body: body !== undefined ? JSON.stringify(body) : undefined
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error?.message || json?.message || `HTTP ${res.status}`);
    return json;
  }

  bootstrapContext() {
    return this.request("/mcp/context/bootstrap", "GET");
  }

  memorySearch(input: any) {
    return this.request("/mcp/tools/memory-search", "POST", input);
  }

  userPreferences(input: any) {
    return this.request("/mcp/tools/user-preferences", "POST", input);
  }

  projectContext(input: any) {
    return this.request("/mcp/tools/project-context", "POST", input);
  }

  repoRules(input: any) {
    return this.request("/mcp/tools/repo-rules", "POST", input);
  }

  decisionHistory(input: any) {
    return this.request("/mcp/tools/decision-history", "POST", input);
  }

  memorySuggest(input: any) {
    return this.request("/mcp/tools/memory-suggest", "POST", input);
  }

  memorySave(input: any) {
    return this.request("/mcp/tools/memory-save", "POST", input);
  }

  auditLog(input: any) {
    return this.request("/mcp/audit-log", "POST", input);
  }
}
