export function generateRepoSummary(scan: any) {
  const f = scan.package.frameworks?.join(', ') || 'unknown framework';
  const db = scan.package.databases?.join(', ') || 'unknown db';
  return {
    scope: 'repo',
    title: 'Repo architecture summary',
    content: `This repo is a ${scan.detectedStack.language} ${scan.package.runtime} project using ${f}. Database layer appears to use ${db}. Route files detected: ${scan.routes.files.length}. Model files detected: ${scan.models.files.length}.`,
    tags: ['repo', 'architecture', scan.detectedStack.language],
    importance: 5,
    status: 'pending',
    source: 'repo_scan',
    metadata: { routeCount: scan.routes.routes.length, modelKinds: scan.models.modelTypes }
  };
}
