export function detectDatabases(depNames: string[]) {
  const out: string[] = [];
  if (depNames.includes('mongoose') || depNames.includes('mongodb')) out.push('mongodb');
  if (depNames.includes('@prisma/client') || depNames.includes('prisma')) out.push('prisma');
  if (depNames.includes('drizzle-orm')) out.push('drizzle');
  if (depNames.includes('pg') || depNames.includes('postgres')) out.push('postgresql');
  if (depNames.includes('mysql2')) out.push('mysql');
  return out;
}
