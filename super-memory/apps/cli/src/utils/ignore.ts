export const defaultIgnore = [
  "node_modules",
  "dist",
  "build",
  ".next",
  ".git",
  "coverage",
  ".env",
  ".env.local",
  ".env.production"
];

export function shouldIgnore(path: string, extra: string[] = []) {
  const all = [...defaultIgnore, ...extra];
  return all.some((p) => path.includes(`/${p}`) || path.endsWith(`/${p}`) || path.endsWith(p));
}
