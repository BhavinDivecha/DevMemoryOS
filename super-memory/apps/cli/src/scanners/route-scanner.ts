import fs from 'node:fs';
import { walkFiles } from '../utils/file-walker.js';

export function scanRoutes(root: string) {
  const files = walkFiles(root, [/(^|\/)routes?\/.*\.(ts|js)$/i, /\.routes?\.(ts|js)$/i]);
  const routeMatches: string[] = [];

  const routeRegex = /(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/gi;
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    let m: RegExpExecArray | null;
    while ((m = routeRegex.exec(content))) routeMatches.push(`${m[1].toUpperCase()} ${m[2]}`);
  }

  return { files, routes: Array.from(new Set(routeMatches)) };
}
