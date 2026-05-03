import { z } from "zod";

export const decisionHistorySchema = z.object({
  projectName: z.string().optional(),
  topic: z.string().optional(),
  limit: z.number().int().min(1).max(20).optional()
});

export const decisionHistoryTool = {
  name: "memory_get_decision_history",
  description: "Fetch previous decisions by project/topic.",
  schema: decisionHistorySchema
};
