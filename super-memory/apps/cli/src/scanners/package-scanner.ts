import fs from 'node:fs';
import path from 'node:path';
import { detectPackageManager } from '../detectors/package-manager-detector.js';
import { detectFrameworks } from '../detectors/framework-detector.js';
import { detectDatabases } from '../detectors/db-detector.js';

export function scanPackage(root: string) {
  const pkgFile = path.join(root, 'package.json');
  if (!fs.existsSync(pkgFile)) {
    return { packageManager: detectPackageManager(root), runtime: 'unknown', language: 'unknown', frameworks: [], databases: [], dependencies: [], scripts: {} };
  }

  const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf-8'));
  const deps = Object.keys(pkg.dependencies || {});
  const devDeps = Object.keys(pkg.devDependencies || {});
  const all = [...deps, ...devDeps];

  return {
    packageManager: detectPackageManager(root),
    runtime: 'node',
    language: all.includes('typescript') ? 'typescript' : 'javascript',
    frameworks: detectFrameworks(all),
    databases: detectDatabases(all),
    dependencies: all,
    scripts: pkg.scripts || {}
  };
}
