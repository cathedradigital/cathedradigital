#!/usr/bin/env node

import fs from 'node:fs';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';

function readProductionValue(name) {
  const source = fs.readFileSync('.env.production', 'utf8');
  const match = source.match(new RegExp(`^${name}=(.*)$`, 'm'));
  return match?.[1]?.trim().replace(/^['"]|['"]$/g, '') || '';
}

function envOrProduction(name) {
  return process.env[name]?.trim() || readProductionValue(name);
}

function createSupabaseFetch(publishableKey) {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== 'undefined' && input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    // Publishable keys use `apikey`; they are not JWT bearer tokens.
    if (
      publishableKey.startsWith('sb_publishable_') &&
      headers.get('Authorization') === `Bearer ${publishableKey}`
    ) {
      headers.delete('Authorization');
    }

    headers.set('apikey', publishableKey);
    return fetch(input, { ...init, headers });
  };
}

function fail(message, code = 1) {
  console.error(`[supabase-auth] FAIL: ${message}`);
  process.exitCode = code;
}

const email = process.env.E2E_TEST_EMAIL?.trim() || '';
const password = process.env.E2E_TEST_PASSWORD || '';
const url = envOrProduction('VITE_SUPABASE_URL');
const publishableKey = envOrProduction('VITE_SUPABASE_PUBLISHABLE_KEY');

if (!email || !password) {
  fail('E2E_TEST_EMAIL e E2E_TEST_PASSWORD são obrigatórios.');
} else if (!url || !publishableKey) {
  fail('VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY são obrigatórios.');
} else {
  const supabase = createClient(url, publishableKey, {
    global: { fetch: createSupabaseFetch(publishableKey) },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.code === 'invalid_credentials') {
        fail('o Supabase rejeitou o e-mail ou a senha para o projeto configurado.');
      } else {
        fail(`o Supabase retornou ${error.code || 'erro de autenticação'} (HTTP ${error.status ?? 'desconhecido'}).`);
      }
    } else if (!data.user) {
      fail('o login não retornou um usuário.');
    } else {
      console.log(`[supabase-auth] OK: autenticação aceita para o projeto ${new URL(url).hostname}.`);
      console.log(`[supabase-auth] user_id=${data.user.id}`);
    }
  } catch {
    fail('não foi possível completar a requisição ao Supabase.');
  }
}
