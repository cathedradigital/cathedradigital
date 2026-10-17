import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const moduleNavigation = readFileSync(resolve(root, 'src/config/moduleNavigation.ts'), 'utf8');
const sacredPalette = readFileSync(resolve(root, 'src/lib/sacredPalette.ts'), 'utf8');
const app = readFileSync(resolve(root, 'src/App.tsx'), 'utf8');

const navPaths = [...moduleNavigation.matchAll(/path:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
const routePaths = [
  ...app.matchAll(/<Route\s+path=["']([^"']+)["']/g),
  ...app.matchAll(/<Route\s+path=\{["']([^"']+)["']\}/g),
].map((m) => m[1]);

const routeTargets = [...app.matchAll(/<Navigate\s+to=["']([^"']+)["']/g)].map((m) => m[1]);
const declared = new Set([...routePaths, ...routeTargets]);

const matchesRoute = (path) => {
  if (declared.has(path)) return true;
  return [...declared].some((candidate) => {
    if (!candidate.startsWith('/')) return false;
    const pattern = candidate.replace(/:[^/]+/g, '[^/]+');
    return new RegExp(`^${pattern}(?:/)?$`).test(path);
  });
};

const errors = [];
const duplicate = (values, label) => {
  const seen = new Set();
  for (const value of values) {
    if (seen.has(value)) errors.push(`Duplicate ${label}: ${value}`);
    seen.add(value);
  }
};

if (navPaths.some((path) => !path.startsWith('/'))) {
  errors.push('Every module navigation path must start with /.');
}
duplicate(navPaths, 'module navigation path');

const ids = [...moduleNavigation.matchAll(/id:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
duplicate(ids, 'module navigation id');

for (const path of navPaths) {
  if (!matchesRoute(path)) errors.push(`Module navigation points to an unregistered route: ${path}`);
}

const groups = [...moduleNavigation.matchAll(/key:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
for (const required of ['estudar', 'rezar', 'formar-se', 'pesquisar', 'minha-jornada']) {
  if (!groups.includes(required)) errors.push(`Missing public module environment: ${required}`);
}

const modulePaletteKeys = {
  estudar: 'MODULE_PALETTES.estudar',
  rezar: 'MODULE_PALETTES.rezar',
  'formar-se': "MODULE_PALETTES['formar-se']",
  pesquisar: 'MODULE_PALETTES.pesquisar',
  'minha-jornada': "MODULE_PALETTES['minha-jornada']",
};
if (!sacredPalette.includes('export const MODULE_PALETTES')) {
  errors.push('Missing shared MODULE_PALETTES design-system tokens.');
}
for (const [environment, token] of Object.entries(modulePaletteKeys)) {
  if (!groups.includes(environment)) continue;
  if (!moduleNavigation.includes(`accent: ${token}.accent`)) {
    errors.push(`Module ${environment} must use its shared accent token.`);
  }
  if (!moduleNavigation.includes(`accentSoft: ${token}.accentSoft`)) {
    errors.push(`Module ${environment} must use its shared soft-accent token.`);
  }
}
if (/accent:\\s*['"]/.test(moduleNavigation) || /accentSoft:\\s*['"]/.test(moduleNavigation)) {
  errors.push('Module navigation must not define literal accent colors outside the design-system tokens.');
}

if (errors.length) {
  console.error('Module contract validation FAILED');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Module contract validation OK: ${navPaths.length} navigation paths, ${routePaths.length} route declarations, ${routeTargets.length} redirects.`);
