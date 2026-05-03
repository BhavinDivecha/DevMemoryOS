import fs from 'node:fs';
import path from 'node:path';

const safeFiles = ['.env.example', '.env.sample', '.env.template'];

export function scanEnv(root: string) {
  const found = safeFiles.filter((f) => fs.existsSync(path.join(root, f)));
  const vars = new Set<string>();

  for (const f of found) {
    const content = fs.readFileSync(path.join(root, f), 'utf-8');
    for (const line of content.split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=/);
      if (m) vars.add(m[1]);
    }
  }

  return { files: found, variables: Array.from(vars) };
}
