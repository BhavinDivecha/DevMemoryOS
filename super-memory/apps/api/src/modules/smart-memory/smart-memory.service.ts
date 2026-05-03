import { prisma } from "../../db";
import { AppError } from "../../utils/errors";

function jaccard(a: string[], b: string[]) {
  const as = new Set(a.map((x) => x.toLowerCase()));
  const bs = new Set(b.map((x) => x.toLowerCase()));
  if (!as.size && !bs.size) return 0;
  const inter = [...as].filter((x) => bs.has(x)).length;
  const union = new Set([...as, ...bs]).size;
  return union ? inter / union : 0;
}

function textSim(a: string, b: string) {
  const ta = a.toLowerCase().split(/\W+/).filter(Boolean);
  const tb = b.toLowerCase().split(/\W+/).filter(Boolean);
  return jaccard(ta, tb);
}

export function scoreMemoryQuality(memory: { title: string; content: string; tags: string[]; source: string; usageCount: number }) {
  const clarity = Math.min(1, memory.content.length / 300);
  const specificity = Math.min(1, (memory.tags.length + (memory.title.length > 10 ? 1 : 0)) / 6);
  const usefulness = Math.min(1, memory.content.split(/\s+/).length / 60);
  const sourceTrust = ["manual", "dashboard", "repo_scan"].includes(memory.source) ? 0.9 : 0.7;
  const usage = Math.min(1, memory.usageCount / 20);
  const score = clarity * 0.3 + specificity * 0.25 + usefulness * 0.25 + sourceTrust * 0.1 + usage * 0.1;
  return Number(score.toFixed(2));
}

export async function runSmartAnalyze(userId: string, memoryId: string) {
  const memory = await prisma.memory.findFirst({ where: { id: memoryId, userId } });
  if (!memory) throw new AppError("MEMORY_NOT_FOUND", "Memory not found", 404);

  const qualityScore = scoreMemoryQuality({
    title: memory.title,
    content: memory.content,
    tags: memory.tags,
    source: memory.source,
    usageCount: memory.usageCount
  });

  await prisma.memory.update({ where: { id: memory.id }, data: { qualityScore } });

  if (qualityScore < 0.4) {
    await prisma.memoryReviewItem.create({
      data: {
        userId,
        type: "low_quality",
        primaryMemoryId: memory.id,
        relatedMemoryIds: [],
        title: "Low quality memory",
        description: "Memory content is too generic or low detail.",
        suggestedAction: "edit_memory",
        availableActions: ["edit_memory", "archive_old", "ignore"],
        confidence: 0.8,
        severity: "medium"
      }
    });
  }

  const candidates = await prisma.memory.findMany({
    where: {
      userId,
      id: { not: memory.id },
      scope: memory.scope,
      status: { in: ["active", "pending"] }
    },
    take: 50,
    orderBy: { updatedAt: "desc" }
  });

  for (const candidate of candidates) {
    const sim = Math.max(textSim(memory.title, candidate.title), textSim(memory.content, candidate.content));
    const tagOverlap = jaccard(memory.tags, candidate.tags);

    if (sim >= 0.9 || (sim >= 0.85 && tagOverlap >= 0.5)) {
      await prisma.memoryReviewItem.create({
        data: {
          userId,
          type: "duplicate",
          primaryMemoryId: memory.id,
          relatedMemoryIds: [candidate.id],
          title: "Possible duplicate memory",
          description: `Similar to existing memory: ${candidate.title}`,
          suggestedAction: "merge",
          availableActions: ["merge", "keep_both", "reject_new", "archive_old"],
          confidence: Number(Math.min(0.99, Math.max(sim, tagOverlap)).toFixed(2)),
          severity: "medium"
        }
      });

      await prisma.memoryRelation.upsert({
        where: {
          sourceMemoryId_targetMemoryId_relationType: {
            sourceMemoryId: memory.id,
            targetMemoryId: candidate.id,
            relationType: "duplicates"
          }
        },
        create: {
          userId,
          sourceMemoryId: memory.id,
          targetMemoryId: candidate.id,
          relationType: "duplicates",
          confidence: Number(Math.min(0.99, Math.max(sim, tagOverlap)).toFixed(2))
        },
        update: { confidence: Number(Math.min(0.99, Math.max(sim, tagOverlap)).toFixed(2)) }
      });
    }

    const hasNegationA = /\b(not|avoid|never|do not)\b/i.test(memory.content);
    const hasNegationB = /\b(not|avoid|never|do not)\b/i.test(candidate.content);
    if (sim >= 0.5 && hasNegationA !== hasNegationB) {
      await prisma.memoryReviewItem.create({
        data: {
          userId,
          type: "conflict",
          primaryMemoryId: memory.id,
          relatedMemoryIds: [candidate.id],
          title: "Potential conflicting memory",
          description: `Potential conflict with: ${candidate.title}`,
          suggestedAction: "replace_old",
          availableActions: ["replace_old", "keep_both", "scope_new_to_project", "reject_new"],
          confidence: Number(Math.min(0.95, sim + 0.2).toFixed(2)),
          severity: "high"
        }
      });

      await prisma.memoryRelation.upsert({
        where: {
          sourceMemoryId_targetMemoryId_relationType: {
            sourceMemoryId: memory.id,
            targetMemoryId: candidate.id,
            relationType: "conflicts_with"
          }
        },
        create: {
          userId,
          sourceMemoryId: memory.id,
          targetMemoryId: candidate.id,
          relationType: "conflicts_with",
          confidence: Number(Math.min(0.95, sim + 0.2).toFixed(2))
        },
        update: { confidence: Number(Math.min(0.95, sim + 0.2).toFixed(2)) }
      });
    }
  }

  return { qualityScore, analyzed: true };
}

export async function mergeMemories(userId: string, input: { memoryIds: string[]; mergedTitle: string; mergedContent: string; archiveOriginals?: boolean; reviewItemId?: string }) {
  const memories = await prisma.memory.findMany({ where: { userId, id: { in: input.memoryIds } } });
  if (memories.length < 2) throw new AppError("VALIDATION_ERROR", "At least two memories are required to merge", 400);

  const first = memories[0];
  const merged = await prisma.memory.create({
    data: {
      userId,
      scope: first.scope,
      projectId: first.projectId,
      clientId: first.clientId,
      repoId: first.repoId,
      title: input.mergedTitle,
      content: input.mergedContent,
      tags: Array.from(new Set(memories.flatMap((m) => m.tags))),
      source: "manual",
      status: "active",
      importance: Math.max(...memories.map((m) => m.importance)),
      confidence: 1,
      metadata: { mergedFrom: memories.map((m) => m.id) }
    }
  });

  for (const m of memories) {
    await prisma.memoryRelation.create({
      data: {
        userId,
        sourceMemoryId: m.id,
        targetMemoryId: merged.id,
        relationType: "supersedes",
        confidence: 0.95
      }
    }).catch(() => undefined);
  }

  if (input.archiveOriginals) {
    await prisma.memory.updateMany({ where: { userId, id: { in: memories.map((m) => m.id) } }, data: { status: "archived", supersededBy: merged.id } });
  }

  if (input.reviewItemId) {
    await prisma.memoryReviewItem.update({
      where: { id: input.reviewItemId },
      data: { status: "resolved", resolvedAction: "merge", resolvedAt: new Date(), resolvedBy: userId }
    }).catch(() => undefined);
  }

  return merged;
}

export async function replaceMemory(userId: string, input: { oldMemoryId: string; newMemoryId: string; reviewItemId?: string }) {
  const [oldMemory, newMemory] = await Promise.all([
    prisma.memory.findFirst({ where: { id: input.oldMemoryId, userId } }),
    prisma.memory.findFirst({ where: { id: input.newMemoryId, userId } })
  ]);
  if (!oldMemory || !newMemory) throw new AppError("MEMORY_NOT_FOUND", "Memory not found", 404);

  await prisma.memory.update({ where: { id: oldMemory.id }, data: { status: "archived", supersededBy: newMemory.id } });
  await prisma.memory.update({ where: { id: newMemory.id }, data: { status: "active" } });

  await prisma.memoryRelation.create({
    data: {
      userId,
      sourceMemoryId: newMemory.id,
      targetMemoryId: oldMemory.id,
      relationType: "replaces",
      confidence: 0.95
    }
  }).catch(() => undefined);

  if (input.reviewItemId) {
    await prisma.memoryReviewItem.update({
      where: { id: input.reviewItemId },
      data: { status: "resolved", resolvedAction: "replace_old", resolvedAt: new Date(), resolvedBy: userId }
    }).catch(() => undefined);
  }

  return { oldMemoryId: oldMemory.id, newMemoryId: newMemory.id };
}
