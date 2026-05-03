export function generateApiContext(scan: any) {
  const preview = scan.routes.routes.slice(0, 20).join(', ');
  return {
    scope: 'repo',
    title: 'API route structure',
    content: `Route files are located in patterns like routes/* or *.routes.ts. Detected routes: ${preview || 'none detected'}.`,
    tags: ['api', 'routes', 'backend'],
    importance: 4,
    status: 'pending',
    source: 'repo_scan',
    metadata: { routes: scan.routes.routes.slice(0, 100) }
  };
}
