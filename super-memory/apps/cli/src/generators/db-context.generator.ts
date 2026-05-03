export function generateDbContext(scan: any) {
  return {
    scope: 'repo',
    title: 'Database model structure',
    content: `Model scan suggests: ${scan.models.modelTypes.join(', ') || 'no explicit model framework detected'}. Keep existing model/schema conventions while adding new entities.`,
    tags: ['database', 'models', ...(scan.models.modelTypes || [])],
    importance: 4,
    status: 'pending',
    source: 'repo_scan',
    metadata: { files: scan.models.files.slice(0, 100) }
  };
}
