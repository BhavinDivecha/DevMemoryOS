import { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  archiveMemory,
  bulkDeleteMemories,
  createMemory,
  deleteMemory,
  getMemory,
  listMemories,
  restoreMemory,
  searchMemories,
  updateMemory
} from "./memory.service";
import { createMemorySchema, listMemorySchema, searchMemorySchema } from "./memory.schema";

export async function memoryRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.requireAuthOrApiKey);

  app.post("/", async (request) => {
    const payload = createMemorySchema.parse(request.body);
    const memory = await createMemory((request.user as any).sub, payload);
    return { success: true, data: memory };
  });

  app.get("/", async (request) => {
    const query = listMemorySchema.parse(request.query);
    const data = await listMemories((request.user as any).sub, query);
    return { success: true, data };
  });

  app.get("/:id", async (request) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    return { success: true, data: await getMemory((request.user as any).sub, id) };
  });

  app.patch("/:id", async (request) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const payload = createMemorySchema.partial().parse(request.body);
    return { success: true, data: await updateMemory((request.user as any).sub, id, payload) };
  });

  app.delete("/:id", async (request) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    await deleteMemory((request.user as any).sub, id);
    return { success: true, data: { id } };
  });

  app.post("/search", async (request) => {
    const payload = searchMemorySchema.parse(request.body);
    return { success: true, data: await searchMemories((request.user as any).sub, payload) };
  });

  app.post("/bulk-delete", async (request) => {
    const payload = z.object({ ids: z.array(z.string().uuid()) }).parse(request.body);
    return { success: true, data: await bulkDeleteMemories((request.user as any).sub, payload.ids) };
  });

  app.post("/:id/archive", async (request) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    return { success: true, data: await archiveMemory((request.user as any).sub, id) };
  });

  app.post("/:id/restore", async (request) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    return { success: true, data: await restoreMemory((request.user as any).sub, id) };
  });
}
