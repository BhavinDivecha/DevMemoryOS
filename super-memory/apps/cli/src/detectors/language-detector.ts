export function detectLanguage(files: string[]) {
  if (files.some((f) => f.endsWith('.py'))) return 'python';
  if (files.some((f) => f.endsWith('.ts') || f.endsWith('.tsx'))) return 'typescript';
  if (files.some((f) => f.endsWith('.js') || f.endsWith('.jsx'))) return 'javascript';
  return 'unknown';
}
