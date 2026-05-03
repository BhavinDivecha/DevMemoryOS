import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../db";
import { mergeMemories, replaceMemory, runSmartAnalyze } from "./smart-memory.service";

const mergeSchema = z.object({
  memoryIds: z.array(z.string().uuid()).min(2),
  mergedTitle: z.string().min(2),
  mergedContent: z.string().min(2),
  archiveOriginals: z.boolean().default(false),
  reviewItemId: z.string().uuid().optional()
});

const replaceSchema = z.object({
  oldMemoryId: z.string().uuid(),
  newMemoryId: z.string().uuid(),
  reviewItemId: z.string().uuid().optional()
});

export async function smartMemoryRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.requireAuthOrApiKey);

  app.get("/health", async () => ({ success: true, data: { ok: true } }));

  app.post("/analyze/:memoryId", async (request) => {
    const { memoryId } = z.object({ memoryId: z.string().uuid() }).parse(request.params);
    const userId = (request.user as any).sub;
    return { success: true, data: await runSmartAnalyze(userId, memoryId) };
  });

  app.post("/detect-duplicates/:memoryId", async (request) => {
    const { memoryId } = z.object({ memoryId: z.string().uuid() }).parse(request.params);
    const userId = (request.user as any).sub;
    return { success: true, data: await runSmartAnalyze(userId, memoryId) };
  });

  app.post("/detect-conflicts/:memoryId", async (request) => {
    const { memoryId } = z.object({ memoryId: z.string().uuid() }).parse(request.params);
    const userId = (request.user as any).sub;
    return { success: true, data: await runSmartAnalyze(userId, memoryId) };
  });

  app.post("/score/:memoryId", async (request) => {
    const { memoryId } = z.object({ memoryId: z.string().uuid() }).parse(request.params);
    const userId = (request.user as any).sub;
    return { success: true, data: await runSmartAnalyze(userId, memoryId) };
  });

  app.post("/merge", async (request) => {
    const payload = mergeSchema.parse(request.body);
    const userId = (request.user as any).sub;
    return { success: true, data: await mergeMemories(userId, payload as any) };
  });

  app.post("/replace", async (request) => {
    const payload = replaceSchema.parse(request.body);
    const userId = (request.user as any).sub;
    return { success: true, data: await replaceMemory(userId, payload as any) };
  });

  app.get("/review-items", async (request) => {
    const userId = (request.user as any).sub;
    const query = z
      .object({
        status: z.string().optional(),
        type: z.string().optional(),
        severity: z.string().optional()
      })
      .parse(request.query);

    const items = await prisma.memoryReviewItem.findMany({
      where: {
        userId,
        status: query.status,
        type: query.type,
        severity: query.severity
      },
      orderBy: [{ createdAt: "desc" }],
      take: 200
    });

    return { success: true, data: items };
  });

  app.get("/review-items/:id", async (request) => {
    const userId = (request.user as any).sub;
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const item = await prisma.memoryReviewItem.findFirst({ where: { id, userId } });
    return { success: true, data: item };
  });

  async function setReviewStatus(request: any, status: "approved" | "rejected" | "ignored" | "resolved") {
    const userId = (request.user as any).sub;
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const payload = z.object({ action: z.string().optional() }).parse(request.body || {});
    const item = await prisma.memoryReviewItem.update({
      where: { id },
      data: { status, resolvedAction: payload.action || status, resolvedAt: new Date(), resolvedBy: userId }
    });
    return { success: true, data: item };
  }

  app.post("/review-items/:id/approve", async (request) => setReviewStatus(request, "approved"));
  app.post("/review-items/:id/reject", async (request) => setReviewStatus(request, "rejected"));
  app.post("/review-items/:id/ignore", async (request) => setReviewStatus(request, "ignored"));
  app.post("/review-items/:id/resolve", async (request) => setReviewStatus(request, "resolved"));

  app.get("/memories/:id/relations", async (request) => {
    const userId = (request.user as any).sub;
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const relations = await prisma.memoryRelation.findMany({
      where: {
        userId,
        OR: [{ sourceMemoryId: id }, { targetMemoryId: id }]
      },
      orderBy: { createdAt: "desc" }
    });
    return { success: true, data: relations };
  });

  app.post("/memories/:id/relations", async (request) => {
    const userId = (request.user as any).sub;
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const payload = z
      .object({
        targetMemoryId: z.string().uuid(),
        relationType: z.string(),
        confidence: z.number().min(0).max(1).optional(),
        metadata: z.any().optional()
      })
      .parse(request.body);

    const created = await prisma.memoryRelation.create({
      data: {
        userId,
        sourceMemoryId: id,
        targetMemoryId: payload.targetMemoryId,
        relationType: payload.relationType,
        confidence: payload.confidence ?? 0.5,
        metadata: payload.metadata ?? {}
      }
    });

    return { success: true, data: created };
  });

  app.delete("/memory-relations/:id", async (request) => {
    const userId = (request.user as any).sub;
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    await prisma.memoryRelation.deleteMany({ where: { id, userId } });
    return { success: true, data: { id } };
  });
}
