import { z } from "zod";

export const userPreferencesSchema = z.object({ limit: z.number().int().min(1).max(20).optional() });

export const userPreferencesTool = {
  name: "memory_get_user_preferences",
  description: "Return stable global user preferences and development style memory.",
  schema: userPreferencesSchema
};
