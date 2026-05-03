import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../db";
import { searchMemories, createMemory } from "../memories/memory.service";
import { AppError } from "../../utils/errors";

const scopeSchema = z.enum([
  "global_user",
  "project",
  "client",
  "repo",
  "decision",
  "prompt_rule",
  "architecture",
  "api_contract",
  "deployment",
  "bug_fix",
  "preference"
]);

const memoryWriteSchema = z.object({
  title: z.string().min(2),
  content: z.string().min(2),
  scope: scopeSchema,
  projectName: z.string().optional(),
  clientName: z.string().optional(),
  repoPath: z.string().optional(),
  remoteUrl: z.string().optional(),
  tags: z.array(z.string()).default([]),
  importance: z.number().int().min(1).max(5).default(3)
});

const mode = (process.env.MCP_WRITE_MODE || "suggest") as "readonly" | "suggest" | "direct";

function normalizeToolResponse(data: any, meta: any = {}) {
  return { success: true, data, meta: { source: "super-memory", ...meta } };
}

async function resolveRefs(userId: string, input: { projectName?: string; clientName?: string; repoPath?: string; remoteUrl?: string }) {
  const project = input.projectName
    ? await prisma.project.findFirst({ where: { userId, name: { equals: input.projectName, mode: "insensitive" } } })
    : null;

  const client = input.clientName
    ? await prisma.client.findFirst({ where: { userId, name: { equals: input.clientName, mode: "insensitive" } } })
    : null;

  const repo =
    input.repoPath || input.remoteUrl
      ? await prisma.repo.findFirst({
          where: {
            userId,
            OR: [input.repoPath ? { localPath: input.repoPath } : undefined, input.remoteUrl ? { remoteUrl: input.remoteUrl } : undefined].filter(Boolean) as any
          }
        })
      : null;

  return {
    projectId: project?.id,
    clientId: client?.id,
    repoId: repo?.id,
    project,
    client,
    repo
  };
}

async function audit(request: any, payload: { toolName: string; input: any; outputSummary?: string; status: string; errorMessage?: string }) {
  const userId = (request.user as any)?.sub;
  if (!userId) return;
  await prisma.mcpAuditLog.create({
    data: {
      userId,
      apiKeyId: request.authApiKeyId,
      toolName: payload.toolName,
      input: payload.input,
      outputSummary: payload.outputSummary,
      status: payload.status,
      errorMessage: payload.errorMessage
    }
  });
}

export async function mcpRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticateApiKey);

  app.post("/tools/user-preferences", async (request) => {
    const input = z.object({ limit: z.number().int().min(1).max(20).default(8) }).parse(request.body || {});
    const userId = (request.user as any).sub;
    const preferences = await prisma.memory.findMany({
      where: { userId, scope: "global_user", status: "active", supersededBy: null },
      take: input.limit,
      orderBy: [{ importance: "desc" }, { qualityScore: "desc" }, { updatedAt: "desc" }]
    });
    await audit(request, { toolName: "user_preferences", input, outputSummary: `results=${preferences.length}`, status: "success" });
    return normalizeToolResponse({ preferences: preferences.map((p) => p.content), memories: preferences }, { resultCount: preferences.length, writeMode: mode });
  });

  app.get("/context/bootstrap", async (request) => {
    const userId = (request.user as any).sub;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const [topPreferences, activeProjects] = await Promise.all([
      prisma.memory.findMany({ where: { userId, scope: "global_user", status: "active", supersededBy: null }, take: 5, orderBy: [{ importance: "desc" }, { qualityScore: "desc" }] }),
      prisma.project.findMany({ where: { userId, status: "active" }, select: { id: true, name: true }, take: 10, orderBy: { updatedAt: "desc" } })
    ]);

    const data = {
      user: { name: user?.name || "User", defaultStyle: "codex-ready technical planning" },
      topPreferences: topPreferences.map((m) => m.content),
      activeProjects
    };
    await audit(request, { toolName: "context_bootstrap", input: {}, outputSummary: `preferences=${data.topPreferences.length}`, status: "success" });
    return normalizeToolResponse(data);
  });

  app.post("/tools/memory-search", async (request, reply) => {
    const schema = z.object({
      query: z.string().min(1),
      scope: scopeSchema.optional(),
      projectName: z.string().optional(),
      clientName: z.string().optional(),
      repoPath: z.string().optional(),
      remoteUrl: z.string().optional(),
      limit: z.number().int().min(1).max(20).default(8)
    });

    try {
      const input = schema.parse(request.body);
      const userId = (request.user as any).sub;
      const refs = await resolveRefs(userId, input);
      const result = await searchMemories(userId, {
        query: input.query,
        scope: input.scope,
        projectId: refs.projectId,
        clientId: refs.clientId,
        repoId: refs.repoId,
        status: "active",
        limit: input.limit
      });

      if (result.results.length) {
        await prisma.memory.updateMany({
          where: { id: { in: result.results.map((x: any) => x.id) }, userId },
          data: { lastUsedAt: new Date(), usageCount: { increment: 1 } as any }
        });
      }

      await audit(request, { toolName: "memory_search", input, outputSummary: `results=${result.results.length}`, status: "success" });
      return normalizeToolResponse({ memories: result.results }, { resultCount: result.results.length, writeMode: mode });
    } catch (error: any) {
      await audit(request, { toolName: "memory_search", input: request.body, status: "error", errorMessage: error?.message });
      return reply.status(400).send({ success: false, error: { code: "VALIDATION_ERROR", message: error?.message || "Invalid input" } });
    }
  });

  app.post("/tools/project-context", async (request) => {
    const input = z.object({ projectName: z.string().min(1), limit: z.number().int().min(1).max(20).default(8) }).parse(request.body);
    const userId = (request.user as any).sub;
    const project = await prisma.project.findFirst({ where: { userId, name: { equals: input.projectName, mode: "insensitive" } } });
    if (!project) throw new AppError("PROJECT_NOT_FOUND", "Project not found", 404);

    const memories = await prisma.memory.findMany({ where: { userId, projectId: project.id, status: "active", supersededBy: null }, take: input.limit, orderBy: [{ importance: "desc" }, { qualityScore: "desc" }, { updatedAt: "desc" }] });
    await audit(request, { toolName: "project_context", input, outputSummary: `results=${memories.length}`, status: "success" });
    return normalizeToolResponse({ project: { id: project.id, name: project.name, summary: project.description || "", memories } }, { resultCount: memories.length, writeMode: mode });
  });

  app.post("/tools/repo-rules", async (request) => {
    const input = z.object({ repoPath: z.string().optional(), remoteUrl: z.string().optional(), projectName: z.string().optional(), limit: z.number().int().min(1).max(20).default(8) }).parse(request.body);
    const userId = (request.user as any).sub;
    const refs = await resolveRefs(userId, input);

    const rules = await prisma.memory.findMany({
      where: {
        userId,
        status: "active",
        supersededBy: null,
        OR: [
          { scope: "repo", repoId: refs.repoId || undefined },
          { scope: "prompt_rule", repoId: refs.repoId || undefined },
          { scope: "repo", projectId: refs.projectId || undefined }
        ]
      },
      take: input.limit,
      orderBy: [{ importance: "desc" }, { qualityScore: "desc" }, { updatedAt: "desc" }]
    });

    await audit(request, { toolName: "repo_rules", input, outputSummary: `results=${rules.length}`, status: "success" });
    return normalizeToolResponse({ rules: rules.map((r) => r.content), memories: rules }, { resultCount: rules.length, writeMode: mode });
  });

  app.post("/tools/decision-history", async (request) => {
    const input = z.object({ projectName: z.string().optional(), topic: z.string().optional(), limit: z.number().int().min(1).max(20).default(8) }).parse(request.body);
    const userId = (request.user as any).sub;
    const refs = await resolveRefs(userId, { projectName: input.projectName });

    const decisions = await prisma.memory.findMany({
      where: {
        userId,
        scope: "decision",
        projectId: refs.projectId,
        status: "active",
        supersededBy: null,
        OR: input.topic ? [{ title: { contains: input.topic, mode: "insensitive" } }, { content: { contains: input.topic, mode: "insensitive" } }] : undefined
      },
      take: input.limit,
      orderBy: [{ qualityScore: "desc" }, { updatedAt: "desc" }]
    });

    await audit(request, { toolName: "decision_history", input, outputSummary: `results=${decisions.length}`, status: "success" });
    return normalizeToolResponse({ decisions }, { resultCount: decisions.length, writeMode: mode });
  });

  app.post("/tools/memory-suggest", async (request) => {
    if (mode === "readonly") throw new AppError("FORBIDDEN", "Suggest mode disabled in readonly", 403);

    const input = memoryWriteSchema.parse(request.body);
    const userId = (request.user as any).sub;
    const refs = await resolveRefs(userId, input);

    const saved = await createMemory(userId, {
      scope: input.scope,
      title: input.title,
      content: input.content,
      tags: input.tags,
      importance: input.importance,
      status: "pending",
      source: "api",
      projectId: refs.projectId,
      clientId: refs.clientId,
      repoId: refs.repoId
    });

    await audit(request, { toolName: "memory_suggest", input, outputSummary: `memoryId=${saved.id}`, status: "success" });
    return normalizeToolResponse({ status: "pending", message: "Memory suggestion saved for approval.", id: saved.id }, { writeMode: mode });
  });

  app.post("/tools/memory-save", async (request) => {
    if (mode !== "direct") throw new AppError("FORBIDDEN", "Direct memory save is disabled", 403);

    const input = memoryWriteSchema.parse(request.body);
    const userId = (request.user as any).sub;
    const refs = await resolveRefs(userId, input);

    const saved = await createMemory(userId, {
      scope: input.scope,
      title: input.title,
      content: input.content,
      tags: input.tags,
      importance: input.importance,
      status: "active",
      source: "api",
      projectId: refs.projectId,
      clientId: refs.clientId,
      repoId: refs.repoId
    });

    await audit(request, { toolName: "memory_save", input, outputSummary: `memoryId=${saved.id}`, status: "success" });
    return normalizeToolResponse({ status: "active", message: "Memory saved.", id: saved.id }, { writeMode: mode });
  });

  app.post("/audit-log", async (request) => {
    const input = z.object({ toolName: z.string(), input: z.any().default({}), outputSummary: z.string().optional(), status: z.string(), errorMessage: z.string().optional() }).parse(request.body) as {
      toolName: string;
      input: any;
      outputSummary?: string;
      status: string;
      errorMessage?: string;
    };
    await audit(request, input);
    return normalizeToolResponse({ logged: true });
  });
}
