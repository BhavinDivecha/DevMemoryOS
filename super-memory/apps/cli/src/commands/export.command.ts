import fs from 'node:fs';
import path from 'node:path';

export async function exportCommand(cwd: string, format: 'json' | 'markdown') {
  const latest = path.join(cwd, '.supermemory', 'latest-scan.json');
  const context = path.join(cwd, '.supermemory', 'context.md');

  if (format === 'json' && fs.existsSync(latest)) {
    fs.copyFileSync(latest, path.join(cwd, 'super-memory-export.json'));
    return;
  }

  if (format === 'markdown' && fs.existsSync(context)) {
    fs.copyFileSync(context, path.join(cwd, 'super-memory-context.md'));
  }
}
