import fs from 'node:fs';
import path from 'node:path';

export function scanDocker(root: string) {
  const dockerfile = path.join(root, 'Dockerfile');
  const compose = path.join(root, 'docker-compose.yml');
  const result = { hasDockerfile: fs.existsSync(dockerfile), hasCompose: fs.existsSync(compose), services: [] as string[] };

  if (result.hasCompose) {
    const content = fs.readFileSync(compose, 'utf-8');
    for (const line of content.split(/\r?\n/)) {
      const m = line.match(/^\s{2}([a-zA-Z0-9_-]+):\s*$/);
      if (m) result.services.push(m[1]);
    }
  }

  return result;
}
