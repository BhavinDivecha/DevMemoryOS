import "dotenv/config";

export const env = {
  SUPER_MEMORY_API_URL: process.env.SUPER_MEMORY_API_URL || "http://localhost:4000",
  SUPER_MEMORY_API_KEY: process.env.SUPER_MEMORY_API_KEY || ""
};
