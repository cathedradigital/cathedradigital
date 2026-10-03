import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const ORDINARIUM_BASE = "https://api.ordinarium.com.br/api/v1/bible";

const BOOK_MAP: Record<string, string> = {
  "Gn": "Gênesis", "Ex": "Êxodo", "Lv": "Levítico", "Nm": "Números", "Dt": "Deuteronômio",
  "Js": "Josué", "Jz": "Juízes", "Rt": "Rute", "1 Sm": "1 Samuel", "2 Sm": "2 Samuel",
  "1 Rs": "1 Reis", "2 Rs": "2 Reis", "1 Cr": "1 Crônicas", "2 Cr": "2 Crônicas",
  "Esd": "Esdras", "Ne": "Neemias", "Tb": "Tobias", "Jdt": "Judite", "Est": "Ester",
  "1 Mc": "1 Macabeus", "2 Mc": "2 Macabeus", "Jó": "Jó", "Sl": "Salmos",
  "Pr": "Provérbios", "Ecl": "Eclesiastes", "Ct": "Cântico dos Cânticos",
  "Sb": "Sabedoria", "Eclo": "Eclesiástico", "Is": "Isaías", "Jr": "Jeremias",
  "Lm": "Lamentações", "Br": "Baruc", "Ez": "Ezequiel", "Dn": "Daniel",
  "Os": "Oseias", "Jl": "Joel", "Am": "Amós", "Abd": "Abdias", "Jn": "Jonas",
  "Mq": "Miqueias", "Na": "Naum", "Hab": "Habacuc", "Sf": "Sofonias",
  "Ag": "Ageu", "Zc": "Zacarias", "Ml": "Malaquias",
  "Mt": "Mateus", "Mc": "Marcos", "Lc": "Lucas", "Jo": "João",
  "At": "Atos", "Rm": "Romanos", "1 Cor": "1 Coríntios", "2 Cor": "2 Coríntios",
  "Gl": "Gálatas", "Ef": "Efésios", "Fl": "Filipenses", "Cl": "Colossenses",
  "1 Ts": "1 Tessalonicenses", "2 Ts": "2 Tessalonicenses", "1 Tm": "1 Timóteo",
  "2 Tm": "2 Timóteo", "Tt": "Tito", "Fm": "Filemon", "Hb": "Hebreus",
  "Tg": "Tiago", "1 Pd": "1 Pedro", "2 Pd": "2 Pedro", "1 Jo": "1 João",
  "2 Jo": "2 João", "3 Jo": "3 João", "Jd": "Judas", "Ap": "Apocalipse",
};

// O Ordinarium documenta abreviações sem acentos como entrada estável.
// Mantemos o nome humano acima e usamos a abreviação para evitar falhas
// de URL com espaços/acentos; se a abreviação não existir, tentamos o nome.
const API_BOOK_MAP: Record<string, string> = {
  "Gn":"gn","Ex":"ex","Lv":"lv","Nm":"nm","Dt":"dt","Js":"js","Jz":"jz","Rt":"rt",
  "1 Sm":"1sm","2 Sm":"2sm","1 Rs":"1rs","2 Rs":"2rs","1 Cr":"1cr","2 Cr":"2cr",
  "Esd":"esd","Ne":"ne","Tb":"tb","Jdt":"jdt","Est":"est","1 Mc":"1mc","2 Mc":"2mc",
  "Jó":"jo","Sl":"sl","Pr":"pv","Ecl":"ecl","Ct":"ct","Sb":"sb","Eclo":"eclo","Is":"is",
  "Jr":"jr","Lm":"lm","Br":"br","Ez":"ez","Dn":"dn","Os":"os","Jl":"jl","Am":"am",
  "Abd":"abd","Jn":"jn","Mq":"mq","Na":"na","Hab":"hab","Sf":"sf","Ag":"ag","Zc":"zc","Ml":"ml",
  "Mt":"mt","Mc":"mc","Lc":"lc","Jo":"joao","At":"at","Rm":"rm","1 Cor":"1cor","2 Cor":"2cor",
  "Gl":"gl","Ef":"ef","Fl":"fl","Cl":"cl","1 Ts":"1ts","2 Ts":"2ts","1 Tm":"1tm","2 Tm":"2tm",
  "Tt":"tt","Fm":"fm","Hb":"hb","Tg":"tg","1 Pd":"1pd","2 Pd":"2pd","1 Jo":"1jo","2 Jo":"2jo",
  "3 Jo":"3jo","Jd":"jd","Ap":"ap",
};

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-correlation-id, if-none-match",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json; charset=utf-8", ...headers },
  });
}

function correlationId(req: Request) {
  return req.headers.get("x-correlation-id") || crypto.randomUUID();
}

function errorPayload(reason: string, abbrev: string, chapter: number, correlation: string, status: number) {
  return json({
    error: status === 400 ? "Parâmetros inválidos" : "Texto bíblico indisponível",
    reason,
    received_abbrev: abbrev,
    canonical_abbr: BOOK_MAP[abbrev] ? abbrev : null,
    book_name: BOOK_MAP[abbrev] ?? null,
    bollsId: null,
    chapter,
    correlationId: correlation,
  }, status);
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}



async function loadStoredBibleChapter(abbrev: string, chapter: number) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return null;
  const db = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: book, error: bookError } = await db.from("bible_books").select("id,name").eq("abbrev", abbrev).maybeSingle();
  if (bookError || !book?.id) return null;
  const { data: chapterRow, error: chapterError } = await db.from("bible_chapters").select("id,source_name,source_url").eq("book_id", book.id).eq("number", chapter).maybeSingle();
  if (chapterError || !chapterRow?.id) return null;
  const { data: rows, error: verseError } = await db.from("bible_verses").select("number,text").eq("chapter_id", chapterRow.id).order("number");
  if (verseError || !rows?.length) return null;
  const verses = rows.map((row) => ({ number: Number(row.number), text: String(row.text ?? "").trim() }))
    .filter((row) => Number.isInteger(row.number) && row.number > 0 && row.text.length > 0);
  if (!verses.length) return null;
  return { book: book.name, chapter, verses, source: chapterRow.source_name || "Cathedra Bible Recovery", sourceUrl: chapterRow.source_url || "https://github.com/bibliacatolica/biblia" };
}

async function persistBibleChapter(
  abbrev: string,
  chapter: number,
  verses: Array<{ number: number; text: string }>,
  sourceUrl: string,
) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    console.warn("[bible-text] persistence skipped: Supabase service configuration missing");
    return;
  }

  const db = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const retrievedAt = new Date().toISOString();

  const { data: book, error: bookError } = await db
    .from("bible_books")
    .select("id")
    .eq("abbrev", abbrev)
    .maybeSingle();

  if (bookError || !book?.id) {
    console.warn("[bible-text] persistence skipped: book not found", {
      abbrev,
      error: bookError?.message ?? "book_not_found",
    });
    return;
  }

  const { data: chapterRow, error: chapterError } = await db
    .from("bible_chapters")
    .upsert({
      book_id: book.id,
      number: chapter,
      source_name: "Ordinarium API",
      source_url: sourceUrl,
      source_retrieved_at: retrievedAt,
    }, { onConflict: "book_id,number" })
    .select("id")
    .single();

  if (chapterError || !chapterRow?.id) {
    console.warn("[bible-text] persistence failed at chapter", {
      abbrev,
      chapter,
      error: chapterError?.message ?? "chapter_not_persisted",
    });
    return;
  }

  const rows = verses.map((verse) => ({
    chapter_id: chapterRow.id,
    number: verse.number,
    text: verse.text,
    source_name: "Ordinarium API",
    source_url: sourceUrl,
    source_retrieved_at: retrievedAt,
  }));

  const { error: verseError } = await db
    .from("bible_verses")
    .upsert(rows, { onConflict: "chapter_id,number" });

  if (verseError) {
    console.warn("[bible-text] persistence failed at verses", {
      abbrev,
      chapter,
      error: verseError.message,
    });
  }
}

async function fetchUpstream(url: string, correlation: string) {
  const maxAttempts = 3;
  let lastStatus = 502;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "Accept": "application/json", "User-Agent": "CathedraDigital/1.0" },
      });

      if (response.ok || response.status === 404) return response;
      lastStatus = response.status;

      if (response.status < 500 || attempt === maxAttempts) return response;
      await new Promise((resolve) => setTimeout(resolve, 150 * attempt));
    } catch (error) {
      lastStatus = 502;
      console.warn("[bible-text] upstream attempt failed", {
        correlation,
        attempt,
        url,
        error: error instanceof Error ? error.message : String(error),
      });
      if (attempt === maxAttempts) break;
      await new Promise((resolve) => setTimeout(resolve, 150 * attempt));
    }
  }

  return new Response(null, { status: lastStatus });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const correlation = correlationId(req);
  if (req.method !== "POST") return errorPayload("Método não permitido.", "", 1, correlation, 405);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return errorPayload("Parâmetros inválidos: JSON inválido.", "", 1, correlation, 400);
  }

  const abbrev = typeof body.abbrev === "string" ? body.abbrev.trim() : "";
  const chapter = typeof body.chapter === "number" ? body.chapter : Number(body.chapter);
  const translationId = typeof body.translation_id === "string" ? body.translation_id : null;
  const modernize = body.modernize === true;
  const persist = body.persist !== false;

  if (!abbrev || !Number.isInteger(chapter) || chapter <= 0) {
    return errorPayload("Parâmetros inválidos: abbrev e chapter são obrigatórios.", abbrev, Number.isFinite(chapter) ? chapter : 1, correlation, 400);
  }

  const bookName = BOOK_MAP[abbrev];
  if (!bookName) return errorPayload("Abreviação não reconhecida.", abbrev, chapter, correlation, 404);

  const candidates = [API_BOOK_MAP[abbrev], bookName].filter(Boolean) as string[];
  let upstream: Response | null = null;
  let lastStatus = 502;

  try {
    const stored = await loadStoredBibleChapter(abbrev, chapter);
    if (stored) {
      const contentHash = await sha256Hex(JSON.stringify({ book: stored.book, chapter, verses: stored.verses }));
      const etag = `"${contentHash}"`;
      if (req.headers.get("if-none-match") === etag) {
        return new Response(null, { status: 304, headers: { ...cors, ETag: etag, "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } });
      }
      return json({
        book: stored.book,
        chapter,
        verses: stored.verses,
        metadata: {
          source: stored.source,
          source_url: stored.sourceUrl,
          source_mode: "database-recovery",
          correlationId: correlation,
          cache_version: contentHash.slice(0, 12),
          logic_version: 3,
          current_version: 3,
          contentHash,
          ttl_hours: 24,
          stale: false,
          received_abbrev: abbrev,
          canonical_abbr: abbrev,
          bollsId: null,
          translation_id: translationId,
          translation_code: null,
          modernized: modernize,
        },
      }, 200, { ETag: etag, "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400", "X-Cathedra-Correlation-Id": correlation });
    }

    for (const candidate of candidates) {
      const url = `${ORDINARIUM_BASE}/${encodeURIComponent(candidate)}/${chapter}`;
      const response = await fetchUpstream(url, correlation);
      if (response.ok) { upstream = response; break; }
      lastStatus = response.status;
      if (response.status !== 404) break;
    }

    if (!upstream) {
      const reason = lastStatus === 404
        ? `O capítulo ${abbrev} ${chapter} não foi encontrado na fonte bíblica.`
        : `A fonte bíblica retornou HTTP ${lastStatus}.`;
      return errorPayload(reason, abbrev, chapter, correlation, lastStatus === 404 ? 404 : 502);
    }

    const raw = await upstream.json();
    const rawVerses = Array.isArray(raw) ? raw : raw?.verses;
    if (!Array.isArray(rawVerses) || rawVerses.length === 0) {
      return errorPayload(`O capítulo ${abbrev} ${chapter} não retornou versículos.`, abbrev, chapter, correlation, 404);
    }

    const verses = rawVerses
      .map((v: unknown) => {
        const item = v as Record<string, unknown>;
        return {
          number: Number(item.number ?? item.verse),
          text: typeof item.text === "string" ? item.text.trim() : "",
          ...(typeof item.comment === "string" ? { comment: item.comment } : {}),
        };
      })
      .filter((v: { number: number; text: string }) => Number.isInteger(v.number) && v.number > 0 && v.text.length > 0)
      .sort((a: { number: number }, b: { number: number }) => a.number - b.number);

    if (!verses.length) return errorPayload(`O capítulo ${abbrev} ${chapter} não retornou versículos válidos.`, abbrev, chapter, correlation, 404);

    const contentHash = await sha256Hex(JSON.stringify({ book: bookName, chapter, verses }));
    if (persist) {
      await persistBibleChapter(
        abbrev,
        chapter,
        verses,
        upstream.url || `${ORDINARIUM_BASE}/${encodeURIComponent(API_BOOK_MAP[abbrev] ?? bookName)}/${chapter}`,
      );
    }
    const etag = `"${contentHash}"`;
    if (req.headers.get("if-none-match") === etag) {
      return new Response(null, { status: 304, headers: { ...cors, ETag: etag, "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } });
    }

    return json({
      book: bookName,
      chapter,
      verses,
      metadata: {
        source: "Ordinarium API",
        correlationId: correlation,
        cache_version: contentHash.slice(0, 12),
        logic_version: 2,
        current_version: 2,
        contentHash,
        ttl_hours: 24,
        shouldInvalidateL1: false,
        stale: false,
        received_abbrev: abbrev,
        canonical_abbr: abbrev,
        bollsId: null,
        translation_id: translationId,
        translation_code: null,
        modernized: modernize,
      },
    }, 200, {
      ETag: etag,
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "X-Cathedra-Correlation-Id": correlation,
    });
  } catch (error) {
    console.error("[bible-text] upstream failure", { correlation, abbrev, chapter, error: error instanceof Error ? error.message : String(error) });
    return errorPayload("Não foi possível consultar a fonte bíblica no momento.", abbrev, chapter, correlation, 502);
  }
});