import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../db";

export async function memoryReviewRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.requireAuthOrApiKey);

  app.get("/", async (request) => {
    const userId = (request.user as any).sub;
    const query = z.object({ status: z.string().optional(), type: z.string().optional(), severity: z.string().optional() }).parse(request.query);
    const data = await prisma.memoryReviewItem.findMany({
      where: { userId, status: query.status, type: query.type, severity: query.severity },
      orderBy: { createdAt: "desc" }
    });
    return { success: true, data };
  });

  app.get("/:id", async (request) => {
    const userId = (request.user as any).sub;
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const data = await prisma.memoryReviewItem.findFirst({ where: { id, userId } });
    return { success: true, data };
  });

  async function setStatus(request: any, status: "approved" | "rejected" | "ignored" | "resolved") {
    const userId = (request.user as any).sub;
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const payload = z.object({ action: z.string().optional() }).parse(request.body || {});
    const data = await prisma.memoryReviewItem.update({
      where: { id },
      data: { status, resolvedAction: payload.action || status, resolvedAt: new Date(), resolvedBy: userId }
    });
    return { success: true, data };
  }

  app.post("/:id/approve", async (request) => setStatus(request, "approved"));
  app.post("/:id/reject", async (request) => setStatus(request, "rejected"));
  app.post("/:id/ignore", async (request) => setStatus(request, "ignored"));
  app.post("/:id/resolve", async (request) => setStatus(request, "resolved"));
}
