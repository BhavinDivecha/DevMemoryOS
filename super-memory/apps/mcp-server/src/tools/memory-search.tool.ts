import { z } from "zod";

export const memorySearchSchema = z.object({
  query: z.string().min(1),
  scope: z.string().optional(),
  projectName: z.string().optional(),
  repoPath: z.string().optional(),
  clientName: z.string().optional(),
  tags: z.array(z.string()).optional(),
  limit: z.number().int().min(1).max(20).optional()
});

export const memorySearchTool = {
  name: "memory_search",
  description: "Search memory by query and optional scope/project/repo filters.",
  schema: memorySearchSchema
};
