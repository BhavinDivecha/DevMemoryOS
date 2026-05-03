import { Queue } from "bullmq";
import IORedis from "ioredis";
import { env } from "../config/env";

const connection = new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null });

export const smartMemoryAnalyzeQueue = new Queue("smart-memory:analyze", { connection });
export const smartMemoryDedupeQueue = new Queue("smart-memory:dedupe", { connection });
export const smartMemoryConflictQueue = new Queue("smart-memory:conflict", { connection });
export const smartMemoryExpiryQueue = new Queue("smart-memory:expiry", { connection });
export const smartMemoryScoreQueue = new Queue("smart-memory:score", { connection });
export const smartMemoryRelationsQueue = new Queue("smart-memory:relations", { connection });

export async function enqueueMemoryAnalyze(userId: string, memoryId: string) {
  await smartMemoryAnalyzeQueue.add("memory.created", { userId, memoryId }, { removeOnComplete: true, removeOnFail: 50 });
}
