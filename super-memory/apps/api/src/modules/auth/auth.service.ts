import bcrypt from "bcryptjs";
import { prisma } from "../../db";
import { AppError } from "../../utils/errors";

export async function registerUser(input: { name: string; email: string; password: string }) {
  const exists = await prisma.user.findUnique({ where: { email: input.email } });
  if (exists) throw new AppError("VALIDATION_ERROR", "Email already exists", 409);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash: await bcrypt.hash(input.password, 10)
    }
  });

  return { id: user.id, name: user.name, email: user.email };
}

export async function loginUser(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new AppError("UNAUTHORIZED", "Invalid credentials", 401);

  const match = await bcrypt.compare(input.password, user.passwordHash);
  if (!match) throw new AppError("UNAUTHORIZED", "Invalid credentials", 401);

  return user;
}
