import fp from "fastify-plugin";
import { FastifyRequest } from "fastify";
import { prisma } from "../db";
import { createHash } from "crypto";
import { AppError } from "../utils/errors";

function hashKey(v: string) {
  return createHash("sha256").update(v).digest("hex");
}

async function resolveApiKey(request: FastifyRequest) {
  const apiKey = request.headers["x-api-key"] as string | undefined;
  if (!apiKey) return null;

  const record = await prisma.apiKey.findFirst({ where: { keyHash: hashKey(apiKey), revokedAt: null } });
  if (!record) return null;

  request.user = { sub: record.userId } as any;
  request.authApiKeyId = record.id;
  await prisma.apiKey.update({ where: { id: record.id }, data: { lastUsedAt: new Date() } });
  return record;
}

export const authPlugin = fp(async (app) => {
  app.decorate("authenticate", async (request: FastifyRequest) => {
    await request.jwtVerify();
  });

  app.decorate("authenticateApiKey", async (request: FastifyRequest) => {
    const record = await resolveApiKey(request);
    if (!record) throw new AppError("UNAUTHORIZED", "Valid API key is required", 401);
  });

  app.decorate("requireAuthOrApiKey", async (request: FastifyRequest) => {
    const record = await resolveApiKey(request);
    if (record) return;
    await request.jwtVerify();
  });
});
