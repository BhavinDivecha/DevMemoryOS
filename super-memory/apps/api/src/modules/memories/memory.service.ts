import { prisma } from "../../db";
import { getEmbeddingProvider } from "./embedding";
import { AppError } from "../../utils/errors";
import { runSmartAnalyze } from "../smart-memory/smart-memory.service";

const embeddingProvider = getEmbeddingProvider();

async function assertOwnership(userId: string, refs: { projectId?: string | null; clientId?: string | null; repoId?: string | null }) {
  if (refs.projectId) {
    const project = await prisma.project.findFirst({ where: { id: refs.projectId, userId } });
    if (!project) throw new AppError("PROJECT_NOT_FOUND", "Project not found", 404);
  }
  if (refs.clientId) {
    const client = await prisma.client.findFirst({ where: { id: refs.clientId, userId } });
    if (!client) throw new AppError("CLIENT_NOT_FOUND", "Client not found", 404);
  }
  if (refs.repoId) {
    const repo = await prisma.repo.findFirst({ where: { id: refs.repoId, userId } });
    if (!repo) throw new AppError("REPO_NOT_FOUND", "Repo not found", 404);
  }
}

export async function createMemory(userId: string, input: any) {
  await assertOwnership(userId, input);
  const embedding = embeddingProvider ? await embeddingProvider.generateEmbedding(`${input.title}\n${input.content}`) : null;

  const memory = await prisma.memory.create({
    data: {
      userId,
      ...input,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      ...(embedding ? { embedding: embedding as any } : {})
    }
  });

  if ((process.env.SMART_MEMORY_ENABLED || "true") === "true") {
    runSmartAnalyze(userId, memory.id).catch(() => undefined);
  }

  return memory;
}

export async function listMemories(userId: string, filters: any) {
  return prisma.memory.findMany({
    where: {
      userId,
      scope: filters.scope,
      projectId: filters.projectId,
      clientId: filters.clientId,
      repoId: filters.repoId,
      status: filters.status,
      tags: filters.tag ? { has: filters.tag } : undefined,
      OR: filters.search
        ? [
            { title: { contains: filters.search, mode: "insensitive" } },
            { content: { contains: filters.search, mode: "insensitive" } }
          ]
        : undefined
    },
    orderBy: { updatedAt: "desc" }
  });
}

export async function getMemory(userId: string, id: string) {
  const memory = await prisma.memory.findFirst({ where: { id, userId } });
  if (!memory) throw new AppError("MEMORY_NOT_FOUND", "Memory not found", 404);
  return memory;
}

export async function updateMemory(userId: string, id: string, input: any) {
  await getMemory(userId, id);
  await assertOwnership(userId, input);
  return prisma.memory.update({ where: { id }, data: { ...input, expiresAt: input.expiresAt ? new Date(input.expiresAt) : null } });
}

export async function deleteMemory(userId: string, id: string) {
  await getMemory(userId, id);
  return prisma.memory.update({ where: { id }, data: { status: "archived" } });
}

export async function archiveMemory(userId: string, id: string) {
  return deleteMemory(userId, id);
}

export async function restoreMemory(userId: string, id: string) {
  await getMemory(userId, id);
  return prisma.memory.update({ where: { id }, data: { status: "active" } });
}

export async function bulkDeleteMemories(userId: string, ids: string[]) {
  await prisma.memory.updateMany({ where: { userId, id: { in: ids } }, data: { status: "archived" } });
  return { count: ids.length };
}

export async function searchMemories(userId: string, input: any) {
  const memories = await prisma.memory.findMany({
    where: {
      userId,
      scope: input.scope,
      projectId: input.projectId,
      clientId: input.clientId,
      repoId: input.repoId,
      status: input.status,
      supersededBy: null,
      tags: input.tag ? { has: input.tag } : undefined,
      OR: [
        { title: { contains: input.query, mode: "insensitive" } },
        { content: { contains: input.query, mode: "insensitive" } }
      ]
    },
    take: input.limit,
    orderBy: [{ importance: "desc" }, { qualityScore: "desc" }, { freshnessScore: "desc" }, { updatedAt: "desc" }]
  });

  return {
    query: input.query,
    results: memories.map((m: any) => {
      const importanceScore = (m.importance || 0) / 5;
      const qualityScore = Number(m.qualityScore || 0.5);
      const freshnessScore = Number(m.freshnessScore || 1);
      const semanticScore = Math.min(1, 0.45 + m.importance / 10);
      const score = semanticScore * 0.45 + importanceScore * 0.2 + qualityScore * 0.15 + freshnessScore * 0.1 + 0.1;
      return { ...m, score: Number(Math.min(1, score).toFixed(3)) };
    })
  };
}
