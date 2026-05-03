export async function detectConflictsJob(payload: { userId: string; memoryId: string }) {
  return { ok: true, ...payload };
}
