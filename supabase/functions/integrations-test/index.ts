import { createClient } from "npm:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: CORS_HEADERS });

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }
  if (request.method !== "POST") {
    return json({ error: "Método não permitido." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const modernPublishableKeys = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
  let publishableKey: string | null = null;
  if (modernPublishableKeys) {
    try {
      const parsed = JSON.parse(modernPublishableKeys);
      if (typeof parsed?.default === "string") publishableKey = parsed.default;
    } catch {
      // Fall back to single-key variables for older project configurations.
    }
  }
  publishableKey ??=
    Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ??
    Deno.env.get("SUPABASE_ANON_KEY") ??
    null;
  const authorization = request.headers.get("Authorization");

  if (!supabaseUrl || !publishableKey || !authorization) {
    return json({ error: "Autenticação obrigatória." }, 401);
  }

  const supabase = createClient(supabaseUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: authorization } },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return json({ error: "Sessão inválida ou expirada." }, 401);
  }

  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError || isAdmin !== true) {
    return json({ error: "Acesso restrito à administração." }, 403);
  }

  let integrationId = "";
  try {
    const body = await request.json();
    integrationId = typeof body?.id === "string" ? body.id : "";
  } catch {
    return json({ error: "Corpo JSON inválido." }, 400);
  }

  if (integrationId !== "mercado-pago") {
    return json({ error: "Esta integração ainda não possui teste automático seguro." }, 400);
  }

  const accessToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
  if (!accessToken) {
    return json({
      ok: false,
      message: "Credencial MERCADO_PAGO_ACCESS_TOKEN não configurada no ambiente.",
      latencyMs: 0,
    });
  }

  const startedAt = Date.now();
  try {
    // GET /users/me validates the credential without creating a payment or
    // consuming a billable transaction.
    const response = await fetch("https://api.mercadopago.com/users/me", {
      method: "GET",
      headers: {
        Authorization: "Bearer " + accessToken,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(8000),
    });
    const latencyMs = Date.now() - startedAt;

    if (response.ok) {
      return json({
        ok: true,
        message: "Credencial validada pelo endpoint oficial do Mercado Pago.",
        latencyMs,
      });
    }

    return json({
      ok: false,
      message: response.status === 401 || response.status === 403
        ? "O Mercado Pago recusou a credencial configurada."
        : "O Mercado Pago respondeu com HTTP " + response.status + ".",
      latencyMs,
    });
  } catch {
    return json({
      ok: false,
      message: "Não foi possível contactar o Mercado Pago dentro do tempo limite.",
      latencyMs: Date.now() - startedAt,
    });
  }
});
