export async function scoreMemoryJob(payload: { userId: string; memoryId: string }) {
  return { ok: true, ...payload };
}
