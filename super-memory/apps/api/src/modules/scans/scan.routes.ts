import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../db";
import { createMemory } from "../memories/memory.service";

const createScanSchema = z.object({
  projectId: z.string().uuid().optional().nullable(),
  repoId: z.string().uuid().optional().nullable(),
  repoPath: z.string().optional().nullable(),
  remoteUrl: z.string().optional().nullable(),
  commitSha: z.string().optional().nullable(),
  branchName: z.string().optional().nullable(),
  detectedStack: z.record(z.any()).default({}),
  generatedMemories: z.array(z.any()).default([]),
  status: z.enum(["pending", "applied", "rejected", "archived"]).default("pending")
});

export async function scanRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.requireAuthOrApiKey);

  app.post("/", async (request) => {
    const payload = createScanSchema.parse(request.body);
    const userId = (request.user as any).sub;
    const created = await prisma.scanResult.create({ data: { ...payload, userId } });
    return { success: true, data: created };
  });

  app.get("/", async (request) => {
    const userId = (request.user as any).sub;
    const scans = await prisma.scanResult.findMany({
      where: { userId },
      include: { project: { select: { id: true, name: true } }, repo: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" }
    });
    return { success: true, data: scans };
  });

  app.get("/:id", async (request) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const userId = (request.user as any).sub;
    const scan = await prisma.scanResult.findFirst({ where: { id, userId } });
    return { success: true, data: scan };
  });

  app.post("/:id/apply", async (request) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const body = z.object({ memoryIndexes: z.array(z.number().int().min(0)).optional() }).parse(request.body || {});
    const userId = (request.user as any).sub;
    const scan = await prisma.scanResult.findFirst({ where: { id, userId } });
    if (!scan) return { success: false, error: { code: "SCAN_NOT_FOUND", message: "Scan not found" } };

    const generated = Array.isArray(scan.generatedMemories) ? (scan.generatedMemories as any[]) : [];
    const selected = body.memoryIndexes?.length ? generated.filter((_, i) => body.memoryIndexes!.includes(i)) : generated;

    let applied = 0;
    for (const m of selected) {
      const appliedStatus = !m.status || m.status === "pending" ? "active" : m.status;
      await createMemory(userId, {
        scope: m.scope || "repo",
        title: m.title,
        content: m.content,
        tags: Array.isArray(m.tags) ? m.tags : [],
        importance: m.importance || 3,
        status: appliedStatus,
        source: "repo_scan",
        projectId: scan.projectId,
        repoId: scan.repoId,
        metadata: m.metadata || {}
      });
      applied += 1;
    }

    await prisma.scanResult.update({ where: { id }, data: { status: "applied" } });
    return { success: true, data: { applied } };
  });

  app.delete("/:id", async (request) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const userId = (request.user as any).sub;
    await prisma.scanResult.updateMany({ where: { id, userId }, data: { status: "archived" } });
    return { success: true, data: { id } };
  });
}
