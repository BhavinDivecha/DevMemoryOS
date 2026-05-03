import { z } from "zod";

const MemoryScopes = [
  "global_user",
  "project",
  "client",
  "repo",
  "decision",
  "prompt_rule",
  "architecture",
  "api_contract",
  "deployment",
  "bug_fix",
  "preference"
] as const;

const MemoryStatuses = ["active", "pending", "archived", "rejected"] as const;

export const createMemorySchema = z.object({
  scope: z.enum(MemoryScopes),
  projectId: z.string().uuid().nullable().optional(),
  clientId: z.string().uuid().nullable().optional(),
  repoId: z.string().uuid().nullable().optional(),
  title: z.string().min(2),
  content: z.string().min(2),
  tags: z.array(z.string()).default([]),
  source: z.string().default("manual"),
  status: z.enum(MemoryStatuses).default("active"),
  importance: z.number().int().min(1).max(5).default(3),
  confidence: z.number().min(0).max(1).default(1),
  metadata: z.record(z.any()).default({}),
  expiresAt: z.string().datetime().nullable().optional()
});

export const searchMemorySchema = z.object({
  query: z.string().min(1),
  scope: z.enum(MemoryScopes).optional(),
  projectId: z.string().uuid().nullable().optional(),
  clientId: z.string().uuid().nullable().optional(),
  repoId: z.string().uuid().nullable().optional(),
  status: z.enum(MemoryStatuses).optional(),
  tag: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(10)
});

export const listMemorySchema = z.object({
  search: z.string().optional(),
  scope: z.enum(MemoryScopes).optional(),
  projectId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
  repoId: z.string().uuid().optional(),
  status: z.enum(MemoryStatuses).optional(),
  tag: z.string().optional()
});
