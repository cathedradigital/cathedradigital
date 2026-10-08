import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: CORS });

const SUPPORTED = new Set(["pt", "en", "es", "it", "la", "fr", "de"]);

function normalizeForTranslation(text: string): string {
  return text
    .replace(/\u00a0/g, " ")
    .replace(/\r\n?/g, "\n")
    .split(/\n{2,}/)
    .map((block) => block.replace(/\s+/g, " ").replace(/\s+([,.;:!?])/g, "$1").trim())
    .filter(Boolean)
    .join("\n\n");
}

function splitChunks(text: string, max = 3500) {
  const paragraphs = normalizeForTranslation(text).split(/\n{2,}/).filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    if (paragraph.length > max) {
      if (current) chunks.push(current);
      current = "";
      for (let i = 0; i < paragraph.length; i += max) chunks.push(paragraph.slice(i, i + max));
      continue;
    }

    const candidate = current ? current + "\n\n" + paragraph : paragraph;
    if (current && candidate.length > max) {
      chunks.push(current);
      current = paragraph;
    } else {
      current = candidate;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

async function translateWithGoogle(chunk: string, sourceLang: string, targetLang: string): Promise<string> {
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", sourceLang);
  url.searchParams.set("tl", targetLang);
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", chunk);

  const response = await fetch(url, { headers: { "Accept": "application/json" } });
  if (!response.ok) throw new Error(`Google Translate HTTP ${response.status}`);

  const payload = await response.json();
  const translated = Array.isArray(payload?.[0])
    ? payload[0].map((item: unknown) => Array.isArray(item) ? String(item[0] ?? "") : "").join("")
    : "";

  if (!translated.trim()) throw new Error("Tradutor retornou conteúdo vazio.");
  return translated.trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Método não permitido." }, 405);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "JSON inválido." }, 400);
  }

  const sourceText = typeof body?.text === "string" ? body.text.trim() : "";
  const sourceLang = typeof body?.source_language === "string" ? body.source_language.toLowerCase() : "";
  const targetLang = typeof body?.target_language === "string" ? body.target_language.toLowerCase() : "";

  if (!sourceText || sourceText.length > 60000) {
    return json({ error: "Texto inválido ou grande demais para tradução." }, 400);
  }
  if (!SUPPORTED.has(sourceLang) || !SUPPORTED.has(targetLang) || sourceLang === targetLang) {
    return json({ error: "Idioma de origem ou destino não suportado." }, 400);
  }

  const translated: string[] = [];
  for (const chunk of splitChunks(sourceText)) {
    try {
      translated.push(await translateWithGoogle(chunk, sourceLang, targetLang));
    } catch (error) {
      console.error("document-translate failure", String(error));
      return json({ error: "Não foi possível concluir a tradução agora." }, 502);
    }
  }

  return json({
    text: normalizeForTranslation(translated.join("\n\n")),
    source_language: sourceLang,
    target_language: targetLang,
    support_translation: true,
  });
});
