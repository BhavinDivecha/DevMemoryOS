import { z } from "zod";

export const repoRulesSchema = z.object({
  repoPath: z.string().optional(),
  remoteUrl: z.string().optional(),
  projectName: z.string().optional(),
  limit: z.number().int().min(1).max(20).optional()
});

export const repoRulesTool = {
  name: "memory_get_repo_rules",
  description: "Get coding and implementation rules tied to a repository.",
  schema: repoRulesSchema
};
