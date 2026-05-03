import { z } from "zod";

export const memorySaveSchema = z.object({
  title: z.string().min(2),
  content: z.string().min(2),
  scope: z.string().min(1),
  projectName: z.string().optional(),
  repoPath: z.string().optional(),
  clientName: z.string().optional(),
  tags: z.array(z.string()).optional(),
  importance: z.number().int().min(1).max(5).optional()
});

export const memorySaveTool = {
  name: "memory_save",
  description: "Directly save memory as active (direct mode only).",
  schema: memorySaveSchema
};
