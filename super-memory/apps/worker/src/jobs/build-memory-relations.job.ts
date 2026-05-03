export async function buildMemoryRelationsJob(payload: { userId: string; memoryId: string }) {
  return { ok: true, ...payload };
}
