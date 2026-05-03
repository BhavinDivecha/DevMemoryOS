import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { env } from "./config/env.js";
import { SuperMemoryApiClient } from "./clients/super-memory-api.client.js";
import { redactSecrets } from "./security/redaction.js";
import { isToolAllowed } from "./security/tool-permissions.js";
import { memorySearchTool } from "./tools/memory-search.tool.js";
import { userPreferencesTool } from "./tools/memory-get-user-preferences.tool.js";
import { projectContextTool } from "./tools/project-context.tool.js";
import { repoRulesTool } from "./tools/repo-rules.tool.js";
import { decisionHistoryTool } from "./tools/decision-history.tool.js";
import { memorySuggestTool } from "./tools/memory-suggest.tool.js";
import { memorySaveTool } from "./tools/memory-save.tool.js";
import { userPreferencesResource } from "./resources/user-preferences.resource.js";
import { projectResource } from "./resources/project.resource.js";
import { repoResource } from "./resources/repo.resource.js";
import { codexPlanPrompt } from "./prompts/codex-plan.prompt.js";
import { debugWithMemoryPrompt } from "./prompts/debug-with-memory.prompt.js";
import { implementationContextPrompt } from "./prompts/implementation-context.prompt.js";
import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

const api = new SuperMemoryApiClient();

const tools = [memorySearchTool, userPreferencesTool, projectContextTool, repoRulesTool, decisionHistoryTool, memorySuggestTool, memorySaveTool];
const toolMap = new Map(tools.map((t) => [t.name, t]));

function asTextContent(payload: any) {
  const value = env.MCP_REDACT_SECRETS === "true" ? redactSecrets(payload) : payload;
  return {
    content: [{ type: "text", text: JSON.stringify(value, null, 2) }]
  };
}

export function buildServer() {
  const server = new Server({ name: env.MCP_SERVER_NAME, version: "0.1.0" }, { capabilities: { tools: {}, resources: {}, prompts: {} } });

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: tools
      .filter((tool) => isToolAllowed(env.MCP_WRITE_MODE, tool.name))
      .map((tool) => ({ name: tool.name, description: tool.description, inputSchema: tool.schema }))
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const name = request.params.name;
    const args = request.params.arguments || {};

    if (!isToolAllowed(env.MCP_WRITE_MODE, name)) {
      return asTextContent({ success: false, error: { code: "FORBIDDEN", message: `Tool ${name} is disabled in ${env.MCP_WRITE_MODE} mode` } });
    }

    const tool = toolMap.get(name);
    if (!tool) return asTextContent({ success: false, error: { code: "TOOL_NOT_FOUND", message: `Unknown tool: ${name}` } });

    try {
      const input: any = tool.schema.parse(args);
      let result: any;

      switch (name) {
        case "memory_search":
          result = await api.memorySearch({ ...input, limit: input.limit || env.MCP_DEFAULT_LIMIT });
          break;
        case "memory_get_user_preferences":
          result = await api.userPreferences({ limit: input.limit || env.MCP_DEFAULT_LIMIT });
          break;
        case "memory_get_project_context":
          result = await api.projectContext({ ...input, limit: input.limit || env.MCP_DEFAULT_LIMIT });
          break;
        case "memory_get_repo_rules":
          result = await api.repoRules({ ...input, limit: input.limit || env.MCP_DEFAULT_LIMIT });
          break;
        case "memory_get_decision_history":
          result = await api.decisionHistory({ ...input, limit: input.limit || env.MCP_DEFAULT_LIMIT });
          break;
        case "memory_suggest":
          result = await api.memorySuggest(input);
          break;
        case "memory_save":
          result = await api.memorySave(input);
          break;
        default:
          result = { success: false, error: { code: "TOOL_NOT_FOUND", message: `Unknown tool: ${name}` } };
      }

      try {
        await api.auditLog({ toolName: name, input, outputSummary: "MCP tool call completed", status: "success" });
      } catch {
        // no-op
      }

      return asTextContent(result);
    } catch (error: any) {
      try {
        await api.auditLog({ toolName: name, input: args, outputSummary: "MCP tool call failed", status: "error", errorMessage: error?.message });
      } catch {
        // no-op
      }
      return asTextContent({ success: false, error: { code: "TOOL_EXECUTION_FAILED", message: error?.message || "Tool call failed" } });
    }
  });

  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    if (env.MCP_ENABLE_RESOURCES !== "true") return { resources: [] };
    return {
      resources: [
        { uri: userPreferencesResource.uri, name: userPreferencesResource.name, description: userPreferencesResource.description, mimeType: "text/markdown" },
        { uri: projectResource.uri, name: projectResource.name, description: projectResource.description, mimeType: "application/json" },
        { uri: repoResource.uri, name: repoResource.name, description: repoResource.description, mimeType: "application/json" }
      ]
    };
  });

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;
    if (uri === "memory://user/preferences") {
      const preferences = await api.userPreferences({ limit: env.MCP_DEFAULT_LIMIT });
      const lines = (preferences?.data?.preferences || []).map((x: string) => `- ${x}`).join("\n");
      return { contents: [{ uri, mimeType: "text/markdown", text: `# User Preferences\n\n${lines}` }] };
    }

    if (uri === "memory://projects") {
      const bootstrap = await api.bootstrapContext();
      return { contents: [{ uri, mimeType: "application/json", text: JSON.stringify(bootstrap?.data?.activeProjects || [], null, 2) }] };
    }

    return { contents: [{ uri, mimeType: "text/plain", text: "Resource not found" }] };
  });

  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    if (env.MCP_ENABLE_PROMPTS !== "true") return { prompts: [] };
    return {
      prompts: [
        { name: codexPlanPrompt.name, description: codexPlanPrompt.description },
        { name: debugWithMemoryPrompt.name, description: debugWithMemoryPrompt.description },
        { name: implementationContextPrompt.name, description: implementationContextPrompt.description }
      ]
    };
  });

  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const name = request.params.name;
    const map: Record<string, string> = {
      [codexPlanPrompt.name]: codexPlanPrompt.template,
      [debugWithMemoryPrompt.name]: debugWithMemoryPrompt.template,
      [implementationContextPrompt.name]: implementationContextPrompt.template
    };

    return {
      description: name,
      messages: [{ role: "user", content: { type: "text", text: map[name] || "Prompt not found" } }]
    };
  });

  return server;
}
