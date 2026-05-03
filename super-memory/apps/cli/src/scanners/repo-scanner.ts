import path from 'node:path';
import { walkFiles } from '../utils/file-walker.js';
import { detectLanguage } from '../detectors/language-detector.js';
import { scanPackage } from './package-scanner.js';
import { scanRoutes } from './route-scanner.js';
import { scanModels } from './model-scanner.js';
import { scanEnv } from './env-scanner.js';
import { scanDocker } from './docker-scanner.js';
import { scanReadme } from './readme-scanner.js';
import { getGitMeta } from '../utils/git.js';

export function scanRepo(root: string) {
  const abs = path.resolve(root);
  const files = walkFiles(abs, [/\.(ts|tsx|js|jsx|py|go|rs)$/, /package\.json$/, /docker-compose\.yml$/, /Dockerfile$/, /README\.md$/, /\.env\.(example|sample|template)$/]);
  const pkg = scanPackage(abs);
  const routes = scanRoutes(abs);
  const models = scanModels(abs);
  const env = scanEnv(abs);
  const docker = scanDocker(abs);
  const readme = scanReadme(abs);
  const git = getGitMeta(abs);

  return {
    root: abs,
    filesCount: files.length,
    language: detectLanguage(files),
    package: pkg,
    routes,
    models,
    env,
    docker,
    readme,
    git,
    detectedStack: {
      language: detectLanguage(files),
      runtime: pkg.runtime,
      framework: pkg.frameworks,
      packageManager: pkg.packageManager,
      database: pkg.databases,
      docker: docker.hasCompose || docker.hasDockerfile,
      routeCount: routes.routes.length,
      modelKinds: models.modelTypes
    }
  };
}
