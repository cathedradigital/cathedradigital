import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const root = resolve(process.cwd(), 'src');
const forbiddenPatterns = [
  /(?:from|import)\s+['"][^'"]*client\.server(?:\.[^'"]+)?['"]/,
  /(?:process\.)?env\[['"]SUPABASE_SERVICE_ROLE_KEY['"]\]/,
  /(?:process\.)?env\.SUPABASE_SERVICE_ROLE_KEY/,
];

const serverOnlyFiles = new Set([
  'src/integrations/supabase/client.server.ts',
  'src/integrations/supabase/auth-middleware.ts',
]);

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) return walk(file);
    return /\.(ts|tsx|js|jsx)$/.test(entry.name) ? [file] : [];
  });
}

const violations = [];
for (const file of walk(root)) {
  const rel = relative(process.cwd(), file).replaceAll('\\', '/');
  if (serverOnlyFiles.has(rel)) continue;
  const source = readFileSync(file, 'utf8');
  if (forbiddenPatterns.some((pattern) => pattern.test(source))) {
    violations.push(`${rel}: server-only Supabase boundary detected in browser source`);
  }
}

if (violations.length) {
  console.error('Security boundary validation FAILED');
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log(`Security boundary validation OK: scanned ${walk(root).length} source files.`);
