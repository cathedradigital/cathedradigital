import { createClient } from "npm:@supabase/supabase-js@2";

type NexusRow = {
  id?: string;
  relation_type: string;
  source_kind: string;
  source_ref: Record<string, unknown> | null;
  target_kind: string;
  target_ref: Record<string, unknown> | null;
  note?: string | null;
  confidence?: number | null;
  attributed_to?: string | null;
};

type RetrievedSource = {
  kind: string;
  ref: string;
  title: string;
  excerpt?: string;
  relation?: string;
  note?: string | null;
  confidence?: number | null;
  href?: string;
};

const CORS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: CORS });

function secretKey(): string | null {
  const modern = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (modern) {
    try {
      const parsed = JSON.parse(modern);
      if (typeof parsed?.default === "string") return parsed.default;
    } catch {
      // Fall through to the legacy variable for older projects.
    }
  }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || null;
}

function publishableKey(): string | null {
  const modern = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
  if (modern) {
    try {
      const parsed = JSON.parse(modern);
      if (typeof parsed?.default === "string") return parsed.default;
    } catch {
      // Fall through to the legacy variable for older projects.
    }
  }
  return Deno.env.get("SUPABASE_ANON_KEY") || null;
}

function makeDbClient(req: Request) {
  const url = Deno.env.get("SUPABASE_URL");
  if (!url) return null;

  // Retrieval uses only published/public knowledge. Prefer the server secret so
  // a restrictive browser RLS policy cannot silently make Logos hallucinate.
  const key = secretKey() || publishableKey();
  if (!key) return null;

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function refId(ref: Record<string, unknown> | null): string | null {
  if (!ref) return null;
  for (const key of ["slug", "id", "ref"]) {
    const value = ref[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return null;
}

function refTitle(ref: Record<string, unknown> | null): string {
  const value = ref?.title;
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function escapeLike(value: string): string {
  return value.replace(/[%_]/g, (m) => "\\" + m);
}

function queryTerms(query: string): string[] {
  const stop = new Set([
    "para", "como", "isso", "essa", "esse", "sobre", "qual", "quais",
    "porque", "porquê", "uma", "umas", "uns", "dos", "das", "que",
    "com", "sem", "nas", "nos", "aos", "pela", "pelo", "entre", "mais",
    "onde", "quando", "pode", "posso", "quero", "explique", "significa",
  ]);
  return Array.from(new Set(
    query
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length >= 4 && !stop.has(t))
  )).slice(0, 4);
}

function likeAny(fields: string[], terms: string[]): string {
  const clauses: string[] = [];
  for (const term of terms) {
    const like = "%" + escapeLike(term) + "%";
    for (const field of fields) clauses.push(field + ".ilike." + like);
  }
  return clauses.join(",");
}

function contextNode(type: string | null, context: string, journeyId: string | null) {
  const explicit = /^([a-z_]+):(.+)$/.exec(context.trim());
  if (explicit) return { kind: explicit[1], ref: explicit[2].trim() };

  if (type === "catechism") {
    const match = context.match(/(?:§|par[aá]grafo)\s*(\d{1,4})/i);
    if (match) return { kind: "catechism_paragraph", ref: match[1] };
  }

  if (type === "journey" && journeyId) {
    return { kind: "journey", ref: journeyId.trim() };
  }

  return null;
}

async function searchBibleReference(
  db: ReturnType<typeof createClient>,
  input: string,
): Promise<RetrievedSource[]> {
  const match = input.match(/\b([1-3]?\s?[A-Za-zÀ-ÿ]+)\s+(\d+)\s*[,\:]\s*(\d+)(?:\s*[-–]\s*(\d+))?\b/);
  if (!match) return [];

  const book = match[1].replace(/\s+/g, "");
  const chapter = Number(match[2]);
  const verse = Number(match[3]);
  const verseEnd = Number(match[4] || match[3]);

  const { data: bookRow } = await db
    .from("bible_books")
    .select("id,name,abbrev,testament")
    .ilike("abbrev", book)
    .limit(1)
    .maybeSingle();
  if (!bookRow) return [];

  const { data: chapterRow } = await db
    .from("bible_chapters")
    .select("id,number")
    .eq("book_id", bookRow.id)
    .eq("number", chapter)
    .limit(1)
    .maybeSingle();
  if (!chapterRow) return [];

  const { data: verses } = await db
    .from("bible_verses")
    .select("number,text,translation_id")
    .eq("chapter_id", chapterRow.id)
    .gte("number", verse)
    .lte("number", Math.min(verseEnd, verse + 49))
    .order("number", { ascending: true });
  if (!verses?.length) return [];

  const translationId = verses[0].translation_id;
  const filtered = verses.filter((v) => v.translation_id === translationId);
  const refLabel = String(bookRow.abbrev) + " " + chapter + "," + verse +
    (verseEnd !== verse ? "-" + verseEnd : "");

  return [{
    kind: "bible_verse",
    ref: refLabel,
    title: refLabel + " — " + String(bookRow.name),
    excerpt: filtered.map((v) => String(v.number) + " " + String(v.text)).join(" ").slice(0, 1200),
    href: "/biblia/" + encodeURIComponent(String(bookRow.abbrev)) + "/" + chapter,
  }];
}

async function searchRealSources(db: ReturnType<typeof createClient>, query: string, limit = 8): Promise<RetrievedSource[]> {
  const bibleHits = await searchBibleReference(db, query);
  const terms = queryTerms(query);
  if (terms.length === 0) return [];

  const hits: RetrievedSource[] = [];

  const [catechism, glossary, saints, prayers, spiritual, journeys, collections] = await Promise.all([
    db.from("catechism_official")
      .select("paragraph, slug, texto_base")
      .eq("status", "published")
      .or(likeAny(["texto_base", "slug"], terms))
      .limit(limit),
    db.from("glossary")
      .select("slug, term, short_definition, category")
      .eq("status", "published")
      .or(likeAny(["term", "short_definition", "definition"], terms))
      .limit(limit),
    db.from("saints")
      .select("id, name, title, bio, category")
      .neq("status", "merged")
      .or(likeAny(["name", "title", "bio"], terms))
      .limit(limit),
    db.from("prayers")
      .select("id, slug, title, subtitle, category, kicker")
      .eq("is_published", true)
      .or(likeAny(["title", "subtitle", "kicker"], terms))
      .limit(limit),
    db.from("spiritual_contents")
      .select("id, title, content_text, type, reference_id")
      .in("type", ["magisterium", "patristics"])
      .or(likeAny(["title", "content_text"], terms))
      .limit(limit),
    db.from("journeys")
      .select("id, slug, title, subtitle, description, category")
      .eq("status", "published")
      .or(likeAny(["title", "subtitle", "description"], terms))
      .limit(limit),
    db.from("collections")
      .select("id, slug, title, subtitle, description, category")
      .eq("status", "published")
      .or(likeAny(["title", "subtitle", "description"], terms))
      .limit(limit),
  ]);

  for (const r of catechism.data ?? []) {
    hits.push({
      kind: "catechism_paragraph",
      ref: String(r.paragraph),
      title: "Catecismo §" + r.paragraph,
      excerpt: typeof r.texto_base === "string" ? r.texto_base.slice(0, 900) : undefined,
      href: "/catechism/" + r.paragraph,
    });
  }
  for (const r of glossary.data ?? []) {
    hits.push({
      kind: "glossary",
      ref: String(r.slug),
      title: String(r.term || r.slug),
      excerpt: typeof r.short_definition === "string" ? r.short_definition.slice(0, 700) : undefined,
      href: "/glossario/" + r.slug,
    });
  }
  for (const r of saints.data ?? []) {
    hits.push({
      kind: "saint",
      ref: String(r.id),
      title: String(r.name || r.id),
      excerpt: typeof r.bio === "string" ? r.bio.slice(0, 700) : undefined,
      href: "/santos/" + r.id,
    });
  }
  for (const r of prayers.data ?? []) {
    const ref = String(r.slug || r.id);
    hits.push({
      kind: "prayer",
      ref,
      title: String(r.title || ref),
      excerpt: String(r.subtitle || r.kicker || r.category || "").slice(0, 500) || undefined,
      href: "/oracao/" + ref,
    });
  }
  for (const r of spiritual.data ?? []) {
    const ref = String(r.reference_id || r.id);
    hits.push({
      kind: r.type === "magisterium" ? "magisterium_doc" : "patristic",
      ref,
      title: String(r.title || ref),
      excerpt: typeof r.content_text === "string" ? r.content_text.slice(0, 900) : undefined,
      href: r.type === "magisterium"
        ? "/magisterium/" + encodeURIComponent(ref)
        : "/biblioteca/padres/" + encodeURIComponent(ref),
    });
  }
  for (const r of journeys.data ?? []) {
    const ref = String(r.slug || r.id);
    hits.push({
      kind: "journey",
      ref,
      title: String(r.title || ref),
      excerpt: String(r.description || r.subtitle || "").slice(0, 700) || undefined,
      href: "/jornadas/" + ref,
    });
  }
  for (const r of collections.data ?? []) {
    const ref = String(r.slug || r.id);
    hits.push({
      kind: "collection",
      ref,
      title: String(r.title || ref),
      excerpt: String(r.description || r.subtitle || "").slice(0, 700) || undefined,
      href: "/colecoes/" + ref,
    });
  }

  return [...bibleHits, ...hits].slice(0, 18);
}

async function nexusForNode(
  db: ReturnType<typeof createClient>,
  kind: string,
  ref: string,
): Promise<NexusRow[]> {
  const [outId, outSlug, outRef, inId, inSlug, inRef] = await Promise.all([
    db.from("nexus_relations").select("id, relation_type, source_kind, source_ref, target_kind, target_ref, note, confidence, attributed_to")
      .eq("source_kind", kind).filter("source_ref->>id", "eq", ref).limit(40),
    db.from("nexus_relations").select("id, relation_type, source_kind, source_ref, target_kind, target_ref, note, confidence, attributed_to")
      .eq("source_kind", kind).filter("source_ref->>slug", "eq", ref).limit(40),
    db.from("nexus_relations").select("id, relation_type, source_kind, source_ref, target_kind, target_ref, note, confidence, attributed_to")
      .eq("source_kind", kind).filter("source_ref->>ref", "eq", ref).limit(40),
    db.from("nexus_relations").select("id, relation_type, source_kind, source_ref, target_kind, target_ref, note, confidence, attributed_to")
      .eq("target_kind", kind).filter("target_ref->>id", "eq", ref).limit(40),
    db.from("nexus_relations").select("id, relation_type, source_kind, source_ref, target_kind, target_ref, note, confidence, attributed_to")
      .eq("target_kind", kind).filter("target_ref->>slug", "eq", ref).limit(40),
    db.from("nexus_relations").select("id, relation_type, source_kind, source_ref, target_kind, target_ref, note, confidence, attributed_to")
      .eq("target_kind", kind).filter("target_ref->>ref", "eq", ref).limit(40),
  ]);

  return [
    ...(outId.data ?? []), ...(outSlug.data ?? []), ...(outRef.data ?? []),
    ...(inId.data ?? []), ...(inSlug.data ?? []), ...(inRef.data ?? []),
  ] as NexusRow[];
}

async function retrieveNexus(
  db: ReturnType<typeof createClient>,
  query: string,
  type: string | null,
  context: string,
  journeyId: string | null,
): Promise<{ sources: RetrievedSource[]; relations: NexusRow[] }> {
  const realSources = await searchRealSources(db, query, 6);
  const node = contextNode(type, context, journeyId);
  const seedNodes = [
    ...(node ? [node] : []),
    ...realSources.slice(0, 5).map((s) => ({ kind: s.kind, ref: s.ref })),
  ];

  const relationLists = await Promise.all(
    seedNodes.map((n) => nexusForNode(db, n.kind, n.ref).catch(() => [] as NexusRow[])),
  );

  const relationMap = new Map<string, NexusRow>();
  for (const rows of relationLists) {
    for (const row of rows) {
      const key = String(row.id || "") + "|" + row.relation_type + "|" + refId(row.source_ref) + "|" + refId(row.target_ref);
      relationMap.set(key, row);
    }
  }

  const relations = Array.from(relationMap.values()).slice(0, 60);
  const sourceMap = new Map(realSources.map((s) => [s.kind + ":" + s.ref, s]));

  for (const row of relations) {
    const source = refId(row.source_ref);
    const target = refId(row.target_ref);
    const sourceTitle = refTitle(row.source_ref);
    const targetTitle = refTitle(row.target_ref);

    if (source && !sourceMap.has(row.source_kind + ":" + source) && row.source_kind !== "other") {
      sourceMap.set(row.source_kind + ":" + source, {
        kind: row.source_kind,
        ref: source,
        title: sourceTitle || row.source_kind + " " + source,
        relation: row.relation_type,
        note: row.note,
        confidence: row.confidence,
      });
    }
    if (target && !sourceMap.has(row.target_kind + ":" + target) && row.target_kind !== "other") {
      sourceMap.set(row.target_kind + ":" + target, {
        kind: row.target_kind,
        ref: target,
        title: targetTitle || row.target_kind + " " + target,
        relation: row.relation_type,
        note: row.note,
        confidence: row.confidence,
      });
    }
  }

  return {
    sources: Array.from(sourceMap.values()).slice(0, 24),
    relations,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  if (req.method !== "POST") return json({ error: "Método não permitido." }, 405);

  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) return json({ error: "Gateway de IA não configurado." }, 503);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "JSON inválido." }, 400);
  }

  const query = typeof body?.query === "string" ? body.query.trim() : "";
  if (!query || query.length > 4000) return json({ error: "Pergunta inválida." }, 400);

  const type = typeof body?.type === "string" ? body.type.slice(0, 40) : null;
  const context = typeof body?.context === "string" ? body.context.slice(0, 500) : "global";
  const selectedText = typeof body?.selectedText === "string" ? body.selectedText.slice(0, 8000) : "";
  const journeyId = typeof body?.journeyId === "string" ? body.journeyId.slice(0, 120) : null;

  const history = Array.isArray(body?.history)
    ? body.history.slice(-6).filter((m: any) =>
        m && (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" && m.content.trim().length > 0 &&
        m.content.length <= 4000
      )
    : [];

  const db = makeDbClient(req);
  let retrieval = { sources: [] as RetrievedSource[], relations: [] as NexusRow[] };
  if (db) {
    retrieval = await retrieveNexus(
      db,
      [query, selectedText.slice(0, 1200)].filter(Boolean).join(" "),
      type,
      context,
      journeyId,
    );
  }

  const sourceContext = retrieval.sources.map((s, i) => ({
    n: i + 1,
    kind: s.kind,
    ref: s.ref,
    title: s.title,
    excerpt: s.excerpt,
    relation: s.relation,
    note: s.note,
    confidence: s.confidence,
    href: s.href,
  }));

  const relationContext = retrieval.relations.map((r) => ({
    relation: r.relation_type,
    from: { kind: r.source_kind, ref: refId(r.source_ref), title: refTitle(r.source_ref) },
    to: { kind: r.target_kind, ref: refId(r.target_ref), title: refTitle(r.target_ref) },
    note: r.note,
    confidence: r.confidence,
    attributed_to: r.attributed_to,
  }));

  const system = [
    "Você é Logos, assistente de estudo da Cathedra Digital.",
    "Use prioritariamente as fontes recuperadas do banco da Cathedra e as relações curadas do Nexus.",
    "Quando uma fonte recuperada sustentar a resposta, cite-a pelo título e referência, sem inventar dados.",
    "Use relações do Nexus para explicar por que dois conteúdos estão conectados.",
    "Não invente versículos, citações, documentos, números de parágrafo ou referências.",
    "Diferencie fonte, resumo, interpretação e inferência.",
    "Se o retrieval não trouxer uma fonte verificável para uma afirmação, diga isso e não preencha a lacuna com memória do modelo.",
    "Não apresente opinião do modelo como doutrina.",
    "Responda em português brasileiro, de forma clara e útil.",
  ].join("\n");

  const messages = [
    { role: "system", content: system },
    {
      role: "system",
      content: JSON.stringify({
        contexto_cathedra: context,
        tipo: type,
        jornada: journeyId,
        trecho_selecionado: selectedText || null,
        fontes_reais_recuperadas: sourceContext,
        relacoes_nexus: relationContext,
      }),
    },
    ...history,
    { role: "user", content: query },
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.7-flash",
        messages,
        temperature: 0.2,
        max_tokens: 1100,
      }),
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 429) {
        return json({ error: "Limite do serviço de IA atingido.", limit_reached: true }, 429);
      }
      console.error("Logos upstream error", response.status, payload?.error?.message);
      return json({ error: "Serviço de IA temporariamente indisponível." }, 502);
    }

    const text = payload?.choices?.[0]?.message?.content;
    if (typeof text !== "string" || !text.trim()) {
      return json({ error: "O serviço de IA respondeu sem conteúdo." }, 502);
    }

    return json({
      text: text.trim(),
      sources: sourceContext,
      nexus: relationContext,
      retrieval: {
        source_count: sourceContext.length,
        relation_count: relationContext.length,
        used_database: Boolean(db),
      },
    });
  } catch (error) {
    console.error("Logos gateway failure", String(error));
    return json({ error: "Não foi possível conectar ao serviço de IA." }, 502);
  } finally {
    clearTimeout(timeout);
  }
});
