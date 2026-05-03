import fs from 'node:fs';
import { walkFiles } from '../utils/file-walker.js';

export function scanModels(root: string) {
  const files = walkFiles(root, [/schema\.prisma$/i, /model/i, /models?\/.*\.(ts|js|sql)$/i, /migrations?\/.*\.sql$/i]);
  const summary: string[] = [];

  for (const file of files.slice(0, 50)) {
    const c = fs.readFileSync(file, 'utf-8');
    if (/mongoose|Schema\(/i.test(c)) summary.push('mongoose');
    if (/model\s+\w+\s+\{/i.test(c)) summary.push('prisma');
    if (/drizzle/i.test(c)) summary.push('drizzle');
    if (/create table/i.test(c)) summary.push('sql');
  }

  return { files, modelTypes: Array.from(new Set(summary)) };
}
