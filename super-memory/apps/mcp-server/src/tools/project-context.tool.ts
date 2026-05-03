import { z } from "zod";

export const projectContextSchema = z.object({
  projectName: z.string().min(1),
  limit: z.number().int().min(1).max(20).optional()
});

export const projectContextTool = {
  name: "memory_get_project_context",
  description: "Fetch project-specific context and memories.",
  schema: projectContextSchema
};
