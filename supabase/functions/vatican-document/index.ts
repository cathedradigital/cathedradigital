import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ALLOWED_HOSTS = new Set(["www.vatican.va", "vatican.va"]);
const MAX_HTML_BYTES = 4_000_000;
const MIN_TEXT_LENGTH = 400;
const FETCH_TIMEOUT_MS = 15_000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

function normalizeUrl(raw: unknown): URL | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "https:" || !ALLOWED_HOSTS.has(url.hostname)) return null;
    return url;
  } catch {
    return null;
  }
}

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

function extractTitle(html: string, fallback: string): string {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = match?.[1]
    ? decodeEntities(match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
    : "";
  return title || fallback;
}

function extractText(html: string): string {
  const mainMatch =
    html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ??
    html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ??
    html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

  const source = mainMatch?.[1] ?? html;
  return decodeEntities(
    source
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
      .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>|<\/div>|<\/section>|<\/h[1-6]>|<\/li>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/\r/g, "")
      .replace(/[ \t]+/g, " ")
      .replace(/\n[ \t]+/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
  );
}

async function fetchDocument(url: URL) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.5",
        "User-Agent": "CathedraDigital/1.0 (magisterium reader)",
      },
    });

    const contentType = response.headers.get("content-type") ?? "";
    const body = await response.text();
    const bytes = new TextEncoder().encode(body).byteLength;

    if (!response.ok) {
      return { ok: false, status: response.status, reason: `HTTP ${response.status}` };
    }
    if (bytes > MAX_HTML_BYTES) {
      return { ok: false, status: 413, reason: "Documento excede o limite de leitura." };
    }
    if (!contentType.includes("html")) {
      return { ok: false, status: 415, reason: `Formato não suportado: ${contentType || "desconhecido"}` };
    }

    const text = extractText(body);
    if (text.length < MIN_TEXT_LENGTH) {
      return { ok: false, status: 422, reason: `Conteúdo legível insuficiente (${text.length} caracteres).` };
    }

    return {
      ok: true,
      status: response.status,
      title: extractTitle(body, url.pathname.split("/").pop() || "Documento do Magistério"),
      text,
    };
  } finally {
    clearTimeout(timeout);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método não permitido." }, 405);

  const correlation = crypto.randomUUID();

  try {
    const body = await req.json().catch(() => null);
    const url = normalizeUrl(body?.url);

    if (!url) {
      return json({
        error: "URL inválida.",
        details: { message: "Apenas URLs HTTPS do domínio vatican.va são aceitas.", correlation },
      }, 400);
    }

    const attempts: Array<{ url: string; status: number; reason: string }> = [];
    const candidates = [url.toString()];

    for (const candidate of candidates) {
      try {
        const result = await fetchDocument(new URL(candidate));
        if (result.ok) {
          return json({
            title: result.title,
            text: result.text,
            meta: {
              step: "fetch_ok",
              content_length: result.text.length,
              winning_url: candidate,
              attempts,
              correlation,
            },
          });
        }
        attempts.push({ url: candidate, status: result.status, reason: result.reason });
      } catch (error) {
        attempts.push({
          url: candidate,
          status: 502,
          reason: error instanceof Error && error.name === "AbortError"
            ? "Tempo limite excedido."
            : error instanceof Error ? error.message : String(error),
        });
      }
    }

    return json({
      error: "Não foi possível carregar o documento do Vaticano.",
      details: {
        message: "A fonte oficial não retornou conteúdo legível neste momento.",
        attempts,
        correlation,
      },
    }, 502);
  } catch (error) {
    console.error("[vatican-document] unexpected error", {
      correlation,
      error: error instanceof Error ? error.message : String(error),
    });
    return json({
      error: "Erro interno ao consultar o documento.",
      details: { correlation },
    }, 500);
  }
});
