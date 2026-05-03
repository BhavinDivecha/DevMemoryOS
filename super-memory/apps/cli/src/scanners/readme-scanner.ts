import fs from 'node:fs';
import path from 'node:path';

export function scanReadme(root: string) {
  const file = path.join(root, 'README.md');
  if (!fs.existsSync(file)) return { exists: false, summary: '' };
  const text = fs.readFileSync(file, 'utf-8');
  const summary = text.split(/\r?\n/).slice(0, 24).join('\n');
  return { exists: true, summary };
}
