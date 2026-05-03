export const codexPlanPrompt = {
  name: "codex_ready_plan",
  description: "Generate a Codex-ready implementation plan using memory context.",
  template:
    "Use Super Memory to fetch user preferences, project context, repo rules, and recent decisions. Then produce a Codex-ready implementation plan with goal, scope, file structure, APIs, database models, services, validation, error handling, security, testing, deployment, and acceptance criteria."
};
