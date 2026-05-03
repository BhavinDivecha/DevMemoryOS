import { z } from "zod";
import { MemoryScopes, MemoryStatuses } from "../constants/memory";

export const memoryPayloadSchema = z.object({
  scope: z.enum(MemoryScopes),
  title: z.string().min(2),
  content: z.string().min(2),
  projectId: z.string().uuid().optional().nullable(),
  clientId: z.string().uuid().optional().nullable(),
  repoId: z.string().uuid().optional().nullable(),
  tags: z.array(z.string().min(1)).default([]),
  importance: z.number().int().min(1).max(5).default(3),
  status: z.enum(MemoryStatuses).default("active"),
  metadata: z.record(z.any()).default({}),
  expiresAt: z.string().datetime().optional().nullable()
});
