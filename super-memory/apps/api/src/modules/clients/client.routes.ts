import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../db";

const schema = z.object({ name: z.string().min(2), description: z.string().optional(), status: z.string().default("active") });

export async function clientRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);
  app.post("/", async (req) => ({ success: true, data: await prisma.client.create({ data: { ...schema.parse(req.body), userId: (req.user as any).sub } }) }));
  app.get("/", async (req) => ({ success: true, data: await prisma.client.findMany({ where: { userId: (req.user as any).sub }, orderBy: { updatedAt: "desc" } }) }));
  app.get("/:id", async (req) => ({ success: true, data: await prisma.client.findFirst({ where: { ...z.object({ id: z.string().uuid() }).parse(req.params), userId: (req.user as any).sub } }) }));
  app.patch("/:id", async (req) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    await prisma.client.findFirstOrThrow({ where: { id, userId: (req.user as any).sub } });
    return { success: true, data: await prisma.client.update({ where: { id }, data: schema.partial().parse(req.body) }) };
  });
  app.delete("/:id", async (req) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    await prisma.client.findFirstOrThrow({ where: { id, userId: (req.user as any).sub } });
    return { success: true, data: await prisma.client.delete({ where: { id } }) };
  });
  app.get("/:id/memories", async (req) => ({ success: true, data: await prisma.memory.findMany({ where: { userId: (req.user as any).sub, clientId: z.object({ id: z.string().uuid() }).parse(req.params).id } }) }));
}
