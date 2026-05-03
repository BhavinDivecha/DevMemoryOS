import fs from "node:fs";
import path from "node:path";
import { shouldIgnore } from "./ignore.js";

export function walkFiles(root: string, includePatterns: RegExp[], exclude: string[] = []) {
  const out: string[] = [];

  const walk = (dir: string) => {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const full = path.join(dir, item.name);
      const rel = full.replace(root, "").replace(/^\//, "");
      if (shouldIgnore(rel, exclude)) continue;
      if (item.isDirectory()) walk(full);
      else if (includePatterns.some((p) => p.test(rel))) out.push(full);
    }
  };

  walk(root);
  return out;
}
