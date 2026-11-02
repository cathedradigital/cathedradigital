import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

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

  // Use the same Supabase SDK and signInWithPassword path as the real app.
  // This avoids maintaining a second, hand-written Auth HTTP implementation.
  const authClient = createClient(url, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  try {
    const { error } = await authClient.auth.signInWithPassword({ email, password });

    if (!error) return;

    if (error.code === 'invalid_credentials') {
      throw new Error('E2E_AUTH_INVALID_CREDENTIALS: Supabase rejected the configured E2E account for this project. Secrets and response bodies were not logged.');
    }

    throw new Error(`E2E_AUTH_PREFLIGHT_FAILED: Supabase Auth returned HTTP ${error.status ?? 'unknown'}. Secrets and response bodies were not logged.`);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('E2E_AUTH_')) throw error;
    throw new Error('E2E_AUTH_PREFLIGHT_NETWORK_FAILURE: could not complete authentication against the configured Supabase project.');
  }
}
