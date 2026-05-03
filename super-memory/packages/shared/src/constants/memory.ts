export const MemoryScopes = [
  "global_user",
  "project",
  "client",
  "repo",
  "decision",
  "prompt_rule",
  "architecture",
  "api_contract",
  "deployment",
  "bug_fix",
  "preference"
] as const;

export const MemorySources = [
  "manual",
  "chat_import",
  "repo_scan",
  "ai_suggestion",
  "api",
  "dashboard"
] as const;

export const MemoryStatuses = ["active", "pending", "archived", "rejected"] as const;
