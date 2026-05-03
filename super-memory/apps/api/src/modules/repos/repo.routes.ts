import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../db";

const schema = z.object({ name: z.string().min(2), projectId: z.string().uuid().optional().nullable(), localPath: z.string().optional().nullable(), remoteUrl: z.string().url().optional().nullable(), defaultBranch: z.string().optional().nullable(), status: z.string().default("active") });

export async function repoRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.requireAuthOrApiKey);
  app.post("/", async (req) => ({ success: true, data: await prisma.repo.create({ data: { ...schema.parse(req.body), userId: (req.user as any).sub } }) }));
  app.get("/", async (req) => ({ success: true, data: await prisma.repo.findMany({ where: { userId: (req.user as any).sub }, include: { project: true }, orderBy: { updatedAt: "desc" } }) }));
  app.get("/:id", async (req) => ({ success: true, data: await prisma.repo.findFirst({ where: { ...z.object({ id: z.string().uuid() }).parse(req.params), userId: (req.user as any).sub } }) }));
  app.patch("/:id", async (req) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    await prisma.repo.findFirstOrThrow({ where: { id, userId: (req.user as any).sub } });
    return { success: true, data: await prisma.repo.update({ where: { id }, data: schema.partial().parse(req.body) }) };
  });
  app.delete("/:id", async (req) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    await prisma.repo.findFirstOrThrow({ where: { id, userId: (req.user as any).sub } });
    return { success: true, data: await prisma.repo.delete({ where: { id } }) };
  });
  app.get("/:id/memories", async (req) => ({ success: true, data: await prisma.memory.findMany({ where: { userId: (req.user as any).sub, repoId: z.object({ id: z.string().uuid() }).parse(req.params).id } }) }));
}
