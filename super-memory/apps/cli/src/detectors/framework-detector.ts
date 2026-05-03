export function detectFrameworks(depNames: string[]) {
  const set = new Set<string>();
  if (depNames.includes('fastify')) set.add('fastify');
  if (depNames.includes('express')) set.add('express');
  if (depNames.includes('@nestjs/core')) set.add('nestjs');
  if (depNames.includes('next')) set.add('nextjs');
  if (depNames.includes('vite')) set.add('vite');
  return Array.from(set);
}
