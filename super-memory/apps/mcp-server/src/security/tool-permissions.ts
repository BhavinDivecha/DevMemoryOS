export type WriteMode = "readonly" | "suggest" | "direct";

const RULES: Record<WriteMode, string[]> = {
  readonly: [
    "memory_search",
    "memory_get_user_preferences",
    "memory_get_project_context",
    "memory_get_repo_rules",
    "memory_get_decision_history"
  ],
  suggest: [
    "memory_search",
    "memory_get_user_preferences",
    "memory_get_project_context",
    "memory_get_repo_rules",
    "memory_get_decision_history",
    "memory_suggest"
  ],
  direct: [
    "memory_search",
    "memory_get_user_preferences",
    "memory_get_project_context",
    "memory_get_repo_rules",
    "memory_get_decision_history",
    "memory_suggest",
    "memory_save"
  ]
};

export function isToolAllowed(mode: WriteMode, toolName: string) {
  return RULES[mode].includes(toolName);
}
