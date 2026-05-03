import { z } from "zod";

export const memorySuggestSchema = z.object({
  title: z.string().min(2),
  content: z.string().min(2),
  scope: z.string().min(1),
  projectName: z.string().optional(),
  repoPath: z.string().optional(),
  clientName: z.string().optional(),
  tags: z.array(z.string()).optional(),
  importance: z.number().int().min(1).max(5).optional()
});

export const memorySuggestTool = {
  name: "memory_suggest",
  description: "Suggest a new memory as pending for approval.",
  schema: memorySuggestSchema
};
