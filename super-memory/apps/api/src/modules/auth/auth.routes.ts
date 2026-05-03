import { FastifyInstance } from "fastify";
import { loginSchema, registerSchema } from "./auth.schema";
import { loginUser, registerUser } from "./auth.service";
import { prisma } from "../../db";

export async function authRoutes(app: FastifyInstance) {
  app.post("/register", async (request, reply) => {
    const payload = registerSchema.parse(request.body) as { name: string; email: string; password: string };
    const user = await registerUser(payload);
    const token = app.jwt.sign({ sub: user.id, email: user.email });
    return reply.send({ success: true, data: { user, token } });
  });

  app.post("/login", async (request) => {
    const payload = loginSchema.parse(request.body) as { email: string; password: string };
    const user = await loginUser(payload);
    const token = app.jwt.sign({ sub: user.id, email: user.email });
    return { success: true, data: { user: { id: user.id, name: user.name, email: user.email }, token } };
  });

  app.get("/me", { preHandler: [app.authenticate] }, async (request) => {
    const user = await prisma.user.findUnique({ where: { id: (request.user as any).sub } });
    return { success: true, data: user ? { id: user.id, name: user.name, email: user.email } : null };
  });

  app.post("/logout", { preHandler: [app.authenticate] }, async () => {
    return { success: true, data: { loggedOut: true } };
  });
}
