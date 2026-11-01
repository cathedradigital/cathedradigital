import fs from 'node:fs';

function readProductionValue(name) {
  const source = fs.readFileSync('.env.production', 'utf8');
  const match = source.match(new RegExp('^' + name + '=(.*)$', 'm'));
  return match?.[1]?.trim().replace(/^["']|["']$/g, '') || '';
}

export default async function globalSetup() {
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;

  // Public PR smoke tests intentionally run without authenticated secrets.
  if (!email && !password) return;
  if (!email || !password) {
    throw new Error('E2E_AUTH_PREFLIGHT_MISSING_SECRETS: both E2E secrets are required.');
  }

  const url = process.env.VITE_SUPABASE_URL || readProductionValue('VITE_SUPABASE_URL');
  const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || readProductionValue('VITE_SUPABASE_PUBLISHABLE_KEY');
  if (!url || !publishableKey) {
    throw new Error('E2E_AUTH_PREFLIGHT_MISSING_SUPABASE_CONFIG: the production URL and publishable key are required.');
  }

  let response;
  try {
    response = await fetch(`${url.replace(/\/$/, '')}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        apikey: publishableKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new Error('E2E_AUTH_PREFLIGHT_NETWORK_FAILURE: could not reach the configured Supabase Auth endpoint.');
  }

  if (response.ok) {
    await response.body?.cancel();
    return;
  }

  let errorCode = '';
  try {
    const payload = await response.json();
    errorCode = typeof payload?.error_code === 'string' ? payload.error_code : '';
  } catch {
    // Do not include raw response bodies in CI output.
  }

  if (errorCode === 'invalid_credentials') {
    throw new Error('E2E_AUTH_INVALID_CREDENTIALS: Supabase rejected the configured E2E account for this project. Secrets and response bodies were not logged.');
  }

  throw new Error(`E2E_AUTH_PREFLIGHT_FAILED: Supabase Auth returned HTTP ${response.status}. Secrets and response bodies were not logged.`);
}
