import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../db";

export async function memoryRelationsRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.requireAuthOrApiKey);

  app.get("/:id/relations", async (request) => {
    const userId = (request.user as any).sub;
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const data = await prisma.memoryRelation.findMany({
      where: { userId, OR: [{ sourceMemoryId: id }, { targetMemoryId: id }] },
      orderBy: { createdAt: "desc" }
    });
    return { success: true, data };
  });

  app.post("/:id/relations", async (request) => {
    const userId = (request.user as any).sub;
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const payload = z.object({ targetMemoryId: z.string().uuid(), relationType: z.string(), confidence: z.number().min(0).max(1).optional(), metadata: z.any().optional() }).parse(request.body);
    const data = await prisma.memoryRelation.create({
      data: {
        userId,
        sourceMemoryId: id,
        targetMemoryId: payload.targetMemoryId,
        relationType: payload.relationType,
        confidence: payload.confidence ?? 0.5,
        metadata: payload.metadata ?? {}
      }
    });
    return { success: true, data };
  });
}

export async function singleMemoryRelationRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.requireAuthOrApiKey);

  app.delete("/:id", async (request) => {
    const userId = (request.user as any).sub;
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    await prisma.memoryRelation.deleteMany({ where: { id, userId } });
    return { success: true, data: { id } };
  });
}
