export async function detectDuplicatesJob(payload: { userId: string; memoryId: string }) {
  return { ok: true, ...payload };
}
