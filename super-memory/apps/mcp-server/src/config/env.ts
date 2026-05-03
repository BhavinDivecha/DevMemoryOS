import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  SUPER_MEMORY_API_URL: z.string().default("http://localhost:4000"),
  SUPER_MEMORY_API_KEY: z.string().min(1),
  MCP_SERVER_NAME: z.string().default("super-memory"),
  MCP_WRITE_MODE: z.enum(["readonly", "suggest", "direct"]).default("suggest"),
  MCP_DEFAULT_LIMIT: z.coerce.number().int().min(1).default(8),
  MCP_MAX_LIMIT: z.coerce.number().int().min(1).default(20),
  MCP_ENABLE_RESOURCES: z.enum(["true", "false"]).default("true"),
  MCP_ENABLE_PROMPTS: z.enum(["true", "false"]).default("true"),
  MCP_REDACT_SECRETS: z.enum(["true", "false"]).default("true"),
  MCP_PROJECT_NAME: z.string().optional(),
  MCP_REPO_PATH: z.string().optional()
});

export const env = schema.parse(process.env);
