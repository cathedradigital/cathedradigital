import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const root = process.cwd();
const srcRoot = resolve(root, 'src');
const appPath = resolve(srcRoot, 'App.tsx');

function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return files(path);
    return /\.(tsx?|jsx?)$/.test(entry.name) ? [path] : [];
  });
}

const app = readFileSync(appPath, 'utf8');
const routePaths = [
  ...app.matchAll(/<Route\s+path=["']([^"']+)["']/g),
  ...app.matchAll(/<Route\s+path=\{["']([^"']+)["']\}/g),
].map((m) => m[1]);
const redirects = [...app.matchAll(/<Navigate\s+to=["']([^"']+)["']/g)].map((m) => m[1]);
const declared = new Set([...routePaths, ...redirects]);

const ignored = [
  /^\/(?:assets|icons|images|fonts|favicon|manifest\.json|robots\.txt|sitemap\.xml)(?:\/|$)/,
  /^\/api(?:\/|$)/,
  /\.[a-z0-9]{2,8}$/i,
];

function matchesRoute(path) {
  if (declared.has(path)) return true;
  return [...declared].some((candidate) => {
    if (!candidate.startsWith('/')) return false;
    if (candidate.endsWith('/*')) return path.startsWith(candidate.slice(0, -1));
    const pattern = candidate
      .replace(/[.*+?^$()|[\]{}]/g, '\\$&')
      .replace(/:[^/]+/g, '[^/]+');
    return new RegExp(`^${pattern}/?$`).test(path);
  });
}

const errors = [];
const seen = new Map();

for (const file of files(srcRoot)) {
  const content = readFileSync(file, 'utf8');
  const rel = relative(root, file);
  const re = /(?:to|href)=["'](\/[^"'?#]*)["']/g;
  for (const match of content.matchAll(re)) {
    const path = match[1] || '/';
    if (ignored.some((rule) => rule.test(path))) continue;
    if (path.startsWith('//')) continue;
    const list = seen.get(path) ?? [];
    list.push(rel);
    seen.set(path, list);
    if (!matchesRoute(path)) {
      errors.push(`${rel}: internal link points to an unregistered route: ${path}`);
    }
  }
}

if (errors.length) {
  console.error('Internal route link validation FAILED');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Internal route link validation OK: scanned ${files(srcRoot).length} source files and ${seen.size} static internal paths.`);
