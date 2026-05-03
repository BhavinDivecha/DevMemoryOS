import { randomBytes, createHash } from "crypto";
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { env } from "../../config/env";
import { prisma } from "../../db";

function hashKey(v: string) {
  return createHash("sha256").update(v).digest("hex");
}

export async function apiKeyRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  app.post("/", async (req) => {
    const { name } = z.object({ name: z.string().min(2) }).parse(req.body);
    const raw = `${env.API_KEY_PREFIX}${randomBytes(24).toString("hex")}`;
    const prefix = raw.slice(0, 10);
    const created = await prisma.apiKey.create({ data: { userId: (req.user as any).sub, name, prefix, keyHash: hashKey(raw) } });
    return { success: true, data: { id: created.id, name: created.name, key: raw, prefix: created.prefix, createdAt: created.createdAt } };
  });

  app.get("/", async (req) => ({
    success: true,
    data: await prisma.apiKey.findMany({
      where: { userId: (req.user as any).sub, revokedAt: null },
      select: { id: true, name: true, prefix: true, lastUsedAt: true, createdAt: true }
    })
  }));

  app.delete("/:id", async (req) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    await prisma.apiKey.update({ where: { id }, data: { revokedAt: new Date() } });
    return { success: true, data: { id } };
  });
}
