import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const root = resolve(process.cwd(), "src");
const forbiddenPatterns = [
  /(?:from|import)\s+['"][^'"]*client\.server(?:\.[^'"]+)?['"]/,
  /(?:process\.)?env\[['"]SUPABASE_SERVICE_ROLE_KEY['"]\]/,
  /(?:process\.)?env\.SUPABASE_SERVICE_ROLE_KEY/,
];

const serverOnlyFiles = new Set([
  "src/integrations/supabase/client.server.ts",
  "src/integrations/supabase/auth-middleware.ts",
]);

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) return walk(file);
    return /\.(ts|tsx|js|jsx)$/.test(entry.name) ? [file] : [];
  });
}

const violations = [];

const forbiddenPublicArtifacts = [
  "public/test-report.html",
  "public/test-report.md",
  "public/cathedra.zip",
  "public/indexing-report.json",
  "public/indexing-report.html",
  "public/security-audit.pdf",
  "public/security-audit.md",
  "public/audit-report.html",
];
for (const path of forbiddenPublicArtifacts) {
  if (existsSync(resolve(process.cwd(), path))) {
    violations.push(`${path}: internal report/archive must not be published from the public directory`);
  }
}
for (const file of walk(root)) {
  const rel = relative(process.cwd(), file).replaceAll("\\", "/");
  if (serverOnlyFiles.has(rel)) continue;
  const source = readFileSync(file, "utf8");
  if (forbiddenPatterns.some((pattern) => pattern.test(source))) {
    violations.push(`${rel}: server-only Supabase boundary detected in browser source`);
  }
}

const publicBibleTextPath = resolve(process.cwd(), "supabase/functions/bible-text/index.ts");
const publicBibleText = readFileSync(publicBibleTextPath, "utf8");
const forbiddenPublicBiblePatterns = [
  /SUPABASE_SERVICE_ROLE_KEY/,
  /\b(?:insert|upsert|update|delete)\s*\(/i,
  /persistBibleChapter/,
  /body\.persist/,
];
if (forbiddenPublicBiblePatterns.some((pattern) => pattern.test(publicBibleText))) {
  violations.push(
    "supabase/functions/bible-text/index.ts: public Bible endpoint must remain read-only",
  );
}
if (!/Deno\.env\.get\(["']SUPABASE_ANON_KEY["']\)/.test(publicBibleText)) {
  violations.push(
    "supabase/functions/bible-text/index.ts: public database reads must use the anon key and RLS",
  );
}


const publicCatechismTextPath = resolve(process.cwd(), "supabase/functions/catechism-text/index.ts");
const publicCatechismText = readFileSync(publicCatechismTextPath, "utf8");
const forbiddenPublicCatechismPatterns = [
  /SUPABASE_SERVICE_ROLE_KEY/,
  /\.from\([^)]+\)\.(?:insert|upsert|update|delete)\s*\(/i,
  /persistCatechismParagraph/,
];
if (forbiddenPublicCatechismPatterns.some((pattern) => pattern.test(publicCatechismText))) {
  violations.push(
    "supabase/functions/catechism-text/index.ts: public Catechism endpoint must remain read-only; persistence belongs to OIDC-protected source-sync",
  );
}

if (violations.length) {
  console.error("Security boundary validation FAILED");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log(`Security boundary validation OK: scanned ${walk(root).length} source files.`);
