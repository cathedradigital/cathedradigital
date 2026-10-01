import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: CORS });

function serviceKey(): string | null {
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || null;
}

function allowedHost(url: URL): boolean {
  return [
    "vatican.va",
    "www.vatican.va",
    "newadvent.org",
    "www.newadvent.org",
    "archive.org",
    "www.archive.org",
    "wikisource.org",
    "en.wikisource.org",
    "pt.wikisource.org",
  ].includes(url.hostname);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Método não permitido." }, 405);

  const key = serviceKey();
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  if (!key || !supabaseUrl) return json({ error: "Configuração segura do Supabase ausente." }, 503);

  let body: any;
  try { body = await req.json(); } catch { return json({ error: "JSON inválido." }, 400); }

  const sourceSlug = typeof body?.source_slug === "string" ? body.source_slug.trim() : "";
  const document = body?.document;
  if (!sourceSlug || !document?.slug || !document?.title || !document?.canonical_url) {
    return json({ error: "source_slug e metadados do documento são obrigatórios." }, 400);
  }

  let sourceUrl: URL;
  try { sourceUrl = new URL(String(document.canonical_url)); }
  catch { return json({ error: "URL canônica inválida." }, 400); }

  if (!allowedHost(sourceUrl)) {
    return json({ error: "Domínio não autorizado para ingestão. Cadastre a fonte primeiro." }, 403);
  }

  const db = createClient(supabaseUrl, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: source, error: sourceError } = await db
    .from("corpus_sources")
    .select("id,rights_status,status")
    .eq("slug", sourceSlug)
    .maybeSingle();

  if (sourceError || !source) return json({ error: "Fonte não cadastrada." }, 404);
  if (source.status !== "active") return json({ error: "Fonte pausada ou bloqueada." }, 403);

  const rights = String(document.rights_status || source.rights_status);
  const reusable = rights === "public_domain" || rights === "open_license";
  if (!reusable) {
    const { data, error } = await db.from("corpus_documents").upsert({
      source_id: source.id,
      slug: String(document.slug),
      title: String(document.title),
      document_kind: String(document.document_kind || "other"),
      author_name: document.author_name ? String(document.author_name) : null,
      original_language: document.original_language ? String(document.original_language) : null,
      publication_year: Number.isFinite(document.publication_year) ? document.publication_year : null,
      canonical_url: sourceUrl.toString(),
      rights_status: rights,
      rights_note: String(document.rights_note || "Referência registrada sem reprodução integral."),
      excerpt: document.excerpt ? String(document.excerpt).slice(0, 5000) : null,
      ingestion_status: "verified",
      status: "published",
    }, { onConflict: "slug" }).select("id,slug,title,ingestion_status").single();
    if (error) return json({ error: error.message }, 500);
    return json({ mode: "reference_only", document: data });
  }

  const response = await fetch(sourceUrl, { headers: { "User-Agent": "CathedraCorpusBot/1.0 (+https://cathedradigital.vercel.app)" } });
  if (!response.ok) return json({ error: "A fonte não permitiu a recuperação do documento.", status: response.status }, 502);
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/") && !contentType.includes("json") && !contentType.includes("xml")) {
    return json({ error: "Formato não textual: registre a referência ou processe o arquivo por um importador específico." }, 415);
  }

  const text = (await response.text()).slice(0, 2_000_000);
  const { data, error } = await db.from("corpus_documents").upsert({
    source_id: source.id,
    slug: String(document.slug),
    title: String(document.title),
    document_kind: String(document.document_kind || "other"),
    author_name: document.author_name ? String(document.author_name) : null,
    original_language: document.original_language ? String(document.original_language) : null,
    publication_year: Number.isFinite(document.publication_year) ? document.publication_year : null,
    canonical_url: sourceUrl.toString(),
    rights_status: rights,
    rights_note: String(document.rights_note || "Reprodução autorizada pelo status de direitos cadastrado."),
    full_text: text,
    excerpt: String(document.excerpt || text.slice(0, 5000)),
    ingestion_status: "ingested",
    status: "published",
  }, { onConflict: "slug" }).select("id,slug,title,ingestion_status").single();

  if (error) return json({ error: error.message }, 500);
  return json({ mode: "full_text", bytes: text.length, document: data });
});
