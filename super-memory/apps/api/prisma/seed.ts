import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@supermemory.local";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return;

  const user = await prisma.user.create({
    data: {
      name: "Admin",
      email,
      passwordHash: await bcrypt.hash("admin12345", 10)
    }
  });

  await prisma.memory.createMany({
    data: [
      {
        userId: user.id,
        scope: "global_user",
        title: "User prefers Codex-ready implementation plans",
        content:
          "When user asks for planning, provide a Codex-ready implementation plan with file structure, APIs, models, env vars, error handling, test plan, and deployment notes.",
        tags: ["preference", "codex", "planning"],
        importance: 5
      },
      {
        userId: user.id,
        scope: "global_user",
        title: "Preferred frontend stack",
        content:
          "User commonly prefers Vite, React, TypeScript, Tailwind CSS, shadcn/ui, Zustand, React Query, React Hook Form, Zod, and Axios for frontend dashboards.",
        tags: ["frontend", "stack", "preference"],
        importance: 5
      },
      {
        userId: user.id,
        scope: "global_user",
        title: "Preferred backend stack",
        content:
          "User commonly works with Node.js, MongoDB, Redis, RabbitMQ, Docker, AWS S3, Fastify/NestJS style services, and scalable microservice architecture.",
        tags: ["backend", "stack", "preference"],
        importance: 5
      }
    ]
  });
}

main().finally(() => prisma.$disconnect());
