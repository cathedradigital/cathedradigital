import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const VATICAN_BASE = "https://www.vatican.va/archive/cathechism_po/index_new/";

const PAGES: Array<[number, number, string]> = [
  [1,25,"prologo 1-25_po.html"], [26,49,"p1s1c1_26-49_po.html"], [50,141,"p1s1c2_50-141_po.html"],
  [142,184,"p1s1c3_142-184_po.html"], [185,197,"p1s2_185-197_po.html"], [198,421,"p1s2c1_198-421_po.html"],
  [422,682,"p1s2cap2_422-682_po.html"], [683,1065,"p1s2cap3_683-1065_po.html"],
  [1066,1075,"p2s1cap1_1066-1075_po.html"], [1076,1134,"p2s1cap1_1076-1134_po.html"],
  [1135,1209,"p2s1cap2_1135-1209_po.html"], [1210,1419,"p2s2cap1_1210-1419_po.html"],
  [1420,1532,"p2s2cap1_1420-1532_po.html"], [1533,1666,"p2s2cap3_1533-1666_po.html"],
  [1667,1690,"p2s2cap4_1667-1690_po.html"], [1691,1698,"p3-intr_1691-1698_po.html"],
  [1699,1876,"p3s1cap1_1699-1876_po.html"], [1877,1948,"p3s1cap2_1877-1948_po.html"],
  [1949,2051,"p3s1cap3_1949-2051_po.html"], [2052,2082,"p3s2-intr_2052-2082_po.html"],
  [2083,2195,"p3s2cap1_2083-2195_po.html"], [2196,2557,"p3s2cap2_2196-2557_po.html"],
  [2558,2565,"p4-intr_2558-2565_po.html"], [2566,2649,"p4s1cap1_2566-2649_po.html"],
  [2650,2696,"p4s1cap2_2650-2696_po.html"], [2697,2758,"p4s1cap3_2697-2758_po.html"],
  [2759,2865,"p4s2_2759-2865_po.html"],
];

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-correlation-id",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json; charset=utf-8" },
  });
}


async function persistCatechismParagraph(paragraph: number, content: string, sourceUrl: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    console.warn("[catechism-text] persistence skipped: Supabase service configuration missing");
    return;
  }

  const db = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await db.from("catechism_official").upsert({
    paragraph,
    content,
    source_name: "Santa Sé · vatican.va",
    source_url: sourceUrl,
    source_retrieved_at: new Date().toISOString(),
  }, { onConflict: "paragraph" });

  if (error) {
    console.warn("[catechism-text] persistence failed", {
      paragraph,
      error: error.message,
    });
  }
}

function pageFor(paragraph: number) {
  return PAGES.find(([from, to]) => paragraph >= from && paragraph <= to);
}

function extractParagraph(html: string, paragraph: number, nextParagraph: number) {
  // Preserve enough block boundaries for the static Vatican HTML, then strip tags.
  const withBreaks = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n");
  const text = withBreaks
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();

  const startRe = new RegExp(`(?:^|\\s)${paragraph}\\.\\s+`);
  const start = text.search(startRe);
  if (start < 0) return null;

  const from = start === 0 ? 0 : start + 1;
  const nextRe = new RegExp(`\\s${nextParagraph}\\.\\s+`);
  const tail = text.slice(from);
  const next = tail.search(nextRe);
  const raw = next >= 0 ? tail.slice(0, next) : tail;
  const cleaned = raw.replace(new RegExp(`^${paragraph}\\.\\s*`), "").trim();
  if (!cleaned || cleaned.length < 5) return null;
  return cleaned;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método não permitido." }, 405);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: "JSON inválido." }, 400); }

  const paragraph = Number(body.paragraph);
  if (!Number.isInteger(paragraph) || paragraph < 1 || paragraph > 2865) {
    return json({ error: "Parágrafo inválido.", code: "paragraph_out_of_range" }, 400);
  }

  const page = pageFor(paragraph);
  if (!page) return json({ error: "Página do Catecismo não encontrada.", code: "not_found" }, 404);

  const [from, to, filename] = page;
  const url = VATICAN_BASE + encodeURI(filename);

  try {
    const response = await fetch(url, { headers: { "Accept": "text/html", "User-Agent": "CathedraDigital/1.0" } });
    if (!response.ok) return json({ error: "Fonte oficial indisponível.", code: "upstream_error", status: response.status }, 502);

    const html = await response.text();
    const content = extractParagraph(html, paragraph, paragraph < to ? paragraph + 1 : paragraph + 1);
    if (!content) {
      return json({ error: "Parágrafo não localizado na fonte oficial.", code: "not_found", paragraph }, 404);
    }

    await persistCatechismParagraph(paragraph, content, url);

    return json({
      paragraph,
      content,
      textoBase: content,
      language: "pt",
      status: "official",
      source: "Santa Sé · vatican.va",
      sourceUrl: url,
      range: [from, to],
    });
  } catch (error) {
    console.error("[catechism-text] upstream failure", { paragraph, error: error instanceof Error ? error.message : String(error) });
    return json({ error: "Não foi possível consultar o Catecismo oficial agora.", code: "network" }, 502);
  }
});