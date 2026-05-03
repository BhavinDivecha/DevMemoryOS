import dotenv from "dotenv";
dotenv.config();

export const env = {
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  DATABASE_URL: process.env.DATABASE_URL || "",
  SMART_MEMORY_ENABLED: (process.env.SMART_MEMORY_ENABLED || "true") === "true"
};
