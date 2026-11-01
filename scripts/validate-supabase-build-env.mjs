import fs from 'node:fs';

function fail(message) {
  console.error(`[supabase-build] BLOCKED: ${message}`);
  process.exit(1);
}

const projectId = process.env.VITE_SUPABASE_PROJECT_ID?.trim();
const url = process.env.VITE_SUPABASE_URL?.trim();
const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

if (!projectId || !url || !publishableKey) {
  fail('VITE_SUPABASE_PROJECT_ID, VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY must all be explicitly set before build.');
}

let parsedUrl;
try {
  parsedUrl = new URL(url);
} catch {
  fail('VITE_SUPABASE_URL is not a valid URL.');
}

if (parsedUrl.protocol !== 'https:' || parsedUrl.hostname !== `${projectId}.supabase.co` || parsedUrl.pathname !== '/') {
  fail('VITE_SUPABASE_URL does not match VITE_SUPABASE_PROJECT_ID.');
}

if (!publishableKey.startsWith('sb_publishable_') && !/^[A-Za-z0-9._-]{30,}$/.test(publishableKey)) {
  fail('VITE_SUPABASE_PUBLISHABLE_KEY is missing or has an unsupported format.');
}
if (publishableKey.startsWith('sb_secret_') || /service[_-]?role/i.test(publishableKey)) {
  fail('A privileged Supabase key must never be used in a browser build.');
}

const publicConfig = fs.readFileSync('src/integrations/supabase/publicConfig.ts', 'utf8');
const fallbackUrl = publicConfig.match(/PUBLIC_SUPABASE_URL\\s*=\\s*'([^']+)'/)?.[1];
const fallbackKey = publicConfig.match(/PUBLIC_SUPABASE_PUBLISHABLE_KEY\\s*=\\s*'([^']+)'/)?.[1];

if (fallbackUrl !== url || fallbackKey !== publishableKey) {
  fail('Explicit build environment does not match the checked-in public fallback. Resolve the project/key discrepancy before building.');
}

console.log(`[supabase-build] validated explicit Supabase target ${projectId}; publishable key present and not logged.`);
