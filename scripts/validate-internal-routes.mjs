import { readFileSync, readdirSync } from 'node:fs';
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

// Rotas filhas do shell /conta são declaradas como paths relativos no JSX.
const contaStart = app.indexOf('<Route path="/conta"');
const contaEnd = app.indexOf('/* Biblioteca */', contaStart);
if (contaStart >= 0 && contaEnd > contaStart) {
  const contaBlock = app.slice(contaStart, contaEnd);
  for (const match of contaBlock.matchAll(/<Route\s+path=["']([^/"'][^"']*)["']/g)) {
    declared.add(`/conta/${match[1]}`);
  }
}

const ignored = [
  /^\/(?:assets|icons|images|fonts|favicon|manifest\.json|robots\.txt|sitemap\.xml)(?:\/|$)/,
  /^\/api(?:\/|$)/,
  /\.[a-z0-9]{2,8}$/i,
];

function matchesRoute(path) {
  if (declared.has(path)) return true;
  return [...declared].some((candidate) => {
    if (!candidate.startsWith('/')) return false;
    if (candidate.endsWith('/*')) {
      const base = candidate.slice(0, -1);
      return path === base.slice(0, -1) || path.startsWith(base);
    }
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

  const patterns = [
    /(?:to|href)=["'](\/[^"'?#]*)["']/g,
    /\bnavigate\(\s*["'](\/[^"'?#]*)["']/g,
    /\bwindow\.location\.(?:href|assign|replace)\s*(?:=|\()\s*["'](\/[^"'?#]*)["']/g,
  ];

  for (const re of patterns) {
    for (const match of content.matchAll(re)) {
      const path = match[1] || '/';
      if (ignored.some((rule) => rule.test(path))) continue;
      if (path.startsWith('//')) continue;

      const list = seen.get(path) ?? [];
      list.push(rel);
      seen.set(path, list);

      if (!matchesRoute(path)) {
        errors.push(`${rel}: internal navigation points to an unregistered route: ${path}`);
      }
    }
  }
}

// Valida também o sitemap publicado para impedir URLs duplicadas ou host canônico divergente.
const sitemapPath = resolve(root, 'public/sitemap.xml');
const robotsPath = resolve(root, 'public/robots.txt');

try {
  const sitemap = readFileSync(sitemapPath, 'utf8');
  const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].trim());
  const uniqueSitemapUrls = new Set(sitemapUrls);
  if (!/<urlset\b/.test(sitemap) || sitemapUrls.length === 0) {
    errors.push('public/sitemap.xml: missing urlset or loc entries');
  }
  if (uniqueSitemapUrls.size !== sitemapUrls.length) {
    const duplicates = sitemapUrls.filter((url, index) => sitemapUrls.indexOf(url) !== index);
    errors.push(`public/sitemap.xml: duplicate loc URLs: ${[...new Set(duplicates)].join(', ')}`);
  }
  for (const url of sitemapUrls) {
    if (!url.startsWith('https://www.cathedradigital.com.br/')) {
      errors.push(`public/sitemap.xml: URL does not use the canonical HTTPS host: ${url}`);
    }
  }
} catch (error) {
  errors.push(`public/sitemap.xml: unable to read sitemap (${error.message})`);
}

try {
  const robots = readFileSync(robotsPath, 'utf8');
  if (!/^User-agent:\s*\*/m.test(robots)) {
    errors.push('public/robots.txt: missing wildcard User-agent directive');
  }
  if (!/^Sitemap:\s*https:\/\/www\.cathedradigital\.com\.br\/sitemap\.xml\s*$/m.test(robots)) {
    errors.push('public/robots.txt: Sitemap directive does not match the canonical sitemap URL');
  }
} catch (error) {
  errors.push(`public/robots.txt: unable to read robots file (${error.message})`);
}

if (errors.length) {
  console.error('Internal route link validation FAILED');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Internal route link validation OK: scanned ${files(srcRoot).length} source files and ${seen.size} static internal paths.`);
