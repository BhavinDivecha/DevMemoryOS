import { env } from "../config/env.js";

export class SuperMemoryApiClient {
  constructor(private readonly apiUrl: string, private readonly apiKey?: string) {}

  private async request(path: string, method: string, body?: any, token?: string) {
    const headers: Record<string, string> = { "content-type": "application/json" };
    if (this.apiKey) headers["x-api-key"] = this.apiKey;
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${this.apiUrl}/api/v1${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { success: false, error: data.error || data };
    return data;
  }

  health() {
    return fetch(`${this.apiUrl}/health`).then((r) => r.ok).catch(() => false);
  }

  mcpBootstrap() {
    return this.request("/mcp/context/bootstrap", "GET");
  }

  listProjects(token?: string) {
    return this.request("/projects", "GET", undefined, token);
  }

  createProject(payload: { name: string; slug: string; description?: string; status?: string }, token?: string) {
    return this.request("/projects", "POST", payload, token);
  }

  createApiKey(name: string, token?: string) {
    return this.request("/api-keys", "POST", { name }, token);
  }

  listRepos(token?: string) {
    return this.request("/repos", "GET", undefined, token);
  }

  createScanResult(payload: any, token?: string) {
    return this.request("/scan-results", "POST", payload, token);
  }

  listScanResults(token?: string) {
    return this.request("/scan-results", "GET", undefined, token);
  }

  applyScanResult(id: string, payload?: any, token?: string) {
    return this.request(`/scan-results/${id}/apply`, "POST", payload || {}, token);
  }

  memorySearch(query: string) {
    return this.request("/mcp/tools/memory-search", "POST", { query, limit: 20 });
  }

  login(email: string, password: string) {
    return this.request("/auth/login", "POST", { email, password });
  }
}

export function makeClient(apiUrl?: string, apiKey?: string) {
  return new SuperMemoryApiClient(apiUrl || env.SUPER_MEMORY_API_URL, apiKey || env.SUPER_MEMORY_API_KEY);
}
