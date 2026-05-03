import { Worker } from "bullmq";
import IORedis from "ioredis";
import { env } from "./config/env";
import { detectConflictsJob } from "./jobs/detect-conflicts.job";
import { detectDuplicatesJob } from "./jobs/detect-duplicates.job";
import { scoreMemoryJob } from "./jobs/score-memory.job";
import { buildMemoryRelationsJob } from "./jobs/build-memory-relations.job";

const connection = new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null });

new Worker(
  "smart-memory:analyze",
  async (job) => {
    const payload = job.data as { userId: string; memoryId: string };
    await scoreMemoryJob(payload);
    await detectDuplicatesJob(payload);
    await detectConflictsJob(payload);
    await buildMemoryRelationsJob(payload);
  },
  { connection }
);

console.log("Smart memory worker started.");
