export function generateCodexContext(scan: any) {
  return {
    scope: 'repo',
    title: 'Codex implementation context',
    content: `Before editing code, align with this stack: language=${scan.detectedStack.language}, frameworks=${(scan.package.frameworks || []).join(', ')}, packageManager=${scan.package.packageManager}, database=${(scan.package.databases || []).join(', ')}.`,
    tags: ['codex', 'implementation', 'context'],
    importance: 4,
    status: 'pending',
    source: 'repo_scan',
    metadata: { detectedStack: scan.detectedStack }
  };
}
