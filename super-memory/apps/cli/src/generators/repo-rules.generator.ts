export function generateRepoRules(scan: any) {
  const items: any[] = [];

  if (scan.package.frameworks.includes('fastify')) {
    items.push({
      scope: 'repo',
      title: 'Fastify version rule',
      content: 'This repo uses Fastify. Use plugins compatible with the installed Fastify major version.',
      tags: ['fastify', 'repo-rule', 'version'],
      importance: 5,
      status: 'pending',
      source: 'repo_scan',
      metadata: {}
    });
  }

  if (scan.package.packageManager && scan.package.packageManager !== 'unknown') {
    items.push({
      scope: 'repo',
      title: 'Package manager rule',
      content: `This repo uses ${scan.package.packageManager}. Use ${scan.package.packageManager} commands consistently for installs and scripts.`,
      tags: ['package-manager', scan.package.packageManager, 'repo-rule'],
      importance: 4,
      status: 'pending',
      source: 'repo_scan',
      metadata: {}
    });
  }

  return items;
}
