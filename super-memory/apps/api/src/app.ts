import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import sensible from "@fastify/sensible";
import { env } from "./config/env";
import { errorPlugin } from "./plugins/error.plugin";
import { authPlugin } from "./plugins/auth.plugin";
import { authRoutes } from "./modules/auth/auth.routes";
import { memoryRoutes } from "./modules/memories/memory.routes";
import { projectRoutes } from "./modules/projects/project.routes";
import { clientRoutes } from "./modules/clients/client.routes";
import { repoRoutes } from "./modules/repos/repo.routes";
import { apiKeyRoutes } from "./modules/api-keys/api-key.routes";
import { exportRoutes } from "./modules/exports/export.routes";
import { mcpRoutes } from "./modules/mcp/mcp.routes";
import { scanRoutes } from "./modules/scans/scan.routes";
import { smartMemoryRoutes } from "./modules/smart-memory/smart-memory.routes";
import { memoryReviewRoutes } from "./modules/smart-memory/memory-review.routes";
import { memoryRelationsRoutes, singleMemoryRelationRoutes } from "./modules/smart-memory/memory-relations.routes";

export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(cors, { origin: env.CORS_ORIGIN, credentials: true });
  app.register(sensible);
  app.register(jwt, { secret: env.JWT_SECRET });
  app.register(authPlugin);
  app.register(errorPlugin);

  app.get("/health", async () => ({ ok: true }));

  app.register(authRoutes, { prefix: "/api/v1/auth" });
  app.register(memoryRoutes, { prefix: "/api/v1/memories" });
  app.register(projectRoutes, { prefix: "/api/v1/projects" });
  app.register(clientRoutes, { prefix: "/api/v1/clients" });
  app.register(repoRoutes, { prefix: "/api/v1/repos" });
  app.register(apiKeyRoutes, { prefix: "/api/v1/api-keys" });
  app.register(exportRoutes, { prefix: "/api/v1" });
  app.register(mcpRoutes, { prefix: "/api/v1/mcp" });
  app.register(scanRoutes, { prefix: "/api/v1/scan-results" });
  app.register(smartMemoryRoutes, { prefix: "/api/v1/smart-memory" });
  app.register(memoryReviewRoutes, { prefix: "/api/v1/memory-review-items" });
  app.register(memoryRelationsRoutes, { prefix: "/api/v1/memories" });
  app.register(singleMemoryRelationRoutes, { prefix: "/api/v1/memory-relations" });

  return app;
}
