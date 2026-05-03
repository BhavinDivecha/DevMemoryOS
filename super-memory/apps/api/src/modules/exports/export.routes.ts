import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../db";

export async function exportRoutes(app: FastifyInstance) {
  app.get("/export/json", { preHandler: [app.authenticate] }, async (req) => {
    const userId = (req.user as any).sub;
    const [projects, clients, repos, memories] = await Promise.all([
      prisma.project.findMany({ where: { userId } }),
      prisma.client.findMany({ where: { userId } }),
      prisma.repo.findMany({ where: { userId } }),
      prisma.memory.findMany({ where: { userId } })
    ]);
    return { success: true, data: { projects, clients, repos, memories } };
  });

  app.post("/import/json", { preHandler: [app.authenticate] }, async (req) => {
    const payload = z.object({ memories: z.array(z.any()).default([]) }).parse(req.body);
    const userId = (req.user as any).sub;
    const data = payload.memories.map((m) => ({ ...m, userId, id: undefined }));
    const result = await prisma.memory.createMany({ data, skipDuplicates: true });
    return { success: true, data: { imported: result.count } };
  });
}
