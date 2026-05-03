import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../db";

const schema = z.object({ name: z.string().min(2), description: z.string().optional(), slug: z.string().min(2), status: z.string().default("active") });

export async function projectRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.requireAuthOrApiKey);

  app.post("/", async (req) => ({ success: true, data: await prisma.project.create({ data: { ...schema.parse(req.body), userId: (req.user as any).sub } }) }));
  app.get("/", async (req) => ({ success: true, data: await prisma.project.findMany({ where: { userId: (req.user as any).sub }, orderBy: { updatedAt: "desc" } }) }));
  app.get("/:id", async (req) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    return { success: true, data: await prisma.project.findFirst({ where: { id, userId: (req.user as any).sub } }) };
  });
  app.patch("/:id", async (req) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    await prisma.project.findFirstOrThrow({ where: { id, userId: (req.user as any).sub } });
    return { success: true, data: await prisma.project.update({ where: { id }, data: schema.partial().parse(req.body) }) };
  });
  app.delete("/:id", async (req) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    await prisma.project.findFirstOrThrow({ where: { id, userId: (req.user as any).sub } });
    await prisma.project.delete({ where: { id } });
    return { success: true, data: { id } };
  });
  app.get("/:id/memories", async (req) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    return { success: true, data: await prisma.memory.findMany({ where: { userId: (req.user as any).sub, projectId: id } }) };
  });
}
