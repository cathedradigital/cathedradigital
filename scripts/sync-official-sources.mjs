const endpoint = "https://isojguvcnfncokoxoauk.supabase.co/functions/v1/source-import";
const token = process.env.OIDC_TOKEN;
const bibleDatasetUrl = "https://raw.githubusercontent.com/bibliacatolica/biblia/main/biblia-matos-soares-completa.json";
if (!token) throw new Error("OIDC_TOKEN ausente");

async function post(body) {
  const r = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const t = await r.text();
  if (!r.ok) throw new Error("source-import HTTP " + r.status + ": " + t);
  return JSON.parse(t);
}

async function getJson(url) {
  const r = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "CathedraDigital/1.0" } });
  if (!r.ok) throw new Error("upstream HTTP " + r.status + ": " + url);
  return r.json();
}

function findBook(dataset, abbrev) {
  const books = Array.isArray(dataset?.books) ? dataset.books : [];
  const normalized = String(abbrev).trim().toLowerCase();
  return books.find(b => String(b.abbrev ?? "").trim().toLowerCase() === normalized);
}

const MAX_BATCHES_PER_RUN = 16;
let importedBatches = 0;
let lastResult = null;

for (let batch = 0; batch < MAX_BATCHES_PER_RUN; batch++) {
  const plan = await post({ mode: "plan", max_bible_chapters: 12, max_catechism_pages: 2 });
  if (!plan.bible?.length && !plan.catechism?.length) break;

  const bible = [];
  if (plan.bible?.length) {
    const dataset = await getJson(bibleDatasetUrl);
    for (const target of plan.bible) {
      const book = findBook(dataset, target.abbrev);
      if (!book) throw new Error("Livro não encontrado no dataset: " + target.abbrev);
      const chapters = book.chapters ?? {};
      const values = chapters[String(target.chapter)];
      if (!Array.isArray(values) || !values.length) {
        throw new Error("Capítulo não encontrado no dataset: " + target.abbrev + " " + target.chapter);
      }
      const verses = values
        .map(v => ({ number: Number(v.number ?? v.v), text: typeof v.text === "string" ? v.text.trim() : (typeof v.t === "string" ? v.t.trim() : "") }))
        .filter(v => Number.isInteger(v.number) && v.number > 0 && v.text.length > 0);
      if (!verses.length) throw new Error("Capítulo sem versículos: " + target.abbrev + " " + target.chapter);
      bible.push({ ...target, source_url: bibleDatasetUrl, verses });
    }
  }

  const catechism = [];

async function getText(url) {
  const r = await fetch(url, { headers: { Accept: "text/html", "User-Agent": "CathedraDigital/1.0" } });
  if (!r.ok) throw new Error("upstream HTTP " + r.status + ": " + url);
  return r.text();
}
function strip(html) {
  return html
    .replace(new RegExp("<script[\\s\\S]*?</script>", "gi"), " ")
    .replace(new RegExp("<style[\\s\\S]*?</style>", "gi"), " ")
    .replace(new RegExp("<br\\s*/?>", "gi"), " ")
    .replace(new RegExp("</p>|</div>|</li>", "gi"), " ")
    .replace(new RegExp("<[^>]+>", "g"), " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/\\s+/g, " ")
    .trim();
}
function parse(text, from, to) {
  const marker = new RegExp("(?:^|\\s)(\\d{1,4})(?:\\.)?\\s+", "g");
  const matches = [...text.matchAll(marker)];
  const out = [];
  for (let i = 0; i < matches.length; i++) {
    const n = Number(matches[i][1]);
    if (n < from || n > to) continue;
    const start = (matches[i].index ?? 0) + (matches[i][0].startsWith(" ") ? 1 : 0);
    const end = i + 1 < matches.length ? (matches[i + 1].index ?? text.length) : text.length;
    const content = text.slice(start, end).replace(new RegExp("^\\d{1,4}\\.\\s+"), "").trim();
    if (content.length >= 5) out.push({ paragraph: n, content });
  }
  const unique = new Map();
  for (const item of out) unique.set(item.paragraph, item);
  return [...unique.values()].sort((a, b) => a.paragraph - b.paragraph);
}

for (const target of plan.catechism) {
  const paragraphs = parse(strip(await getText(target.url)), target.from, target.to);
  if (!paragraphs.length) throw new Error("Catecismo sem parágrafos: " + target.from + "-" + target.to);
  catechism.push({ ...target, paragraphs });
}

  lastResult = await post({ mode: "import", bible, catechism });
  importedBatches++;
}

console.log(JSON.stringify({ ok: true, batches: importedBatches, lastResult }, null, 2));
