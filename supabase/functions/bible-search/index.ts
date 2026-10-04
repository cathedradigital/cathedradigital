  if (!match) return null;
  const [, rawBook, chapterRaw, verseRaw] = match;
  const normalizedBook = normalize(rawBook);
  const compactBook = normalizedBook.replace(/\s+/g, "");

  // Abreviações são mais específicas que nomes normalizados. Sem essa
  // prioridade, "Jo 3:16" pode colidir com "Jó" antes de "João".
  const exactAbbrev = books.find((candidate) => {
    const abbrev = normalize(candidate.abbrev);
    return abbrev === normalizedBook || abbrev.replace(/\s+/g, "") === compactBook;
  });
  const book = exactAbbrev ?? books.find((candidate) => {
    const name = normalize(candidate.name);
    return name === normalizedBook || name.replace(/\s+/g, "") === compactBook;
  });
  if (!book) return null;
  return { book, chapter: Number(chapterRaw), verse: Number(verseRaw) };
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json; charset=utf-8" },
  });

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[.,;()[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

function parseReference(input: string, books: Array<{ id: string; name: string; abbrev: string }>) {
  const match = input.trim().match(/^(.*?)\s+(\d+)\s*[:.,]\s*(\d+)$/);
  if (!match) return null;
  const [, rawBook, chapterRaw, verseRaw] = match;
  const normalizedBook = normalize(rawBook);
  const book = books.find((candidate) => {
    const names = [candidate.abbrev, candidate.name].map(normalize);
    return names.some((name) => name === normalizedBook || name.replace(/\s+/g, "") === normalizedBook.replace(/\s+/g, ""));
  });
  if (!book) return null;
  return { book, chapter: Number(chapterRaw), verse: Number(verseRaw) };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método não permitido." }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "JSON inválido." }, 400);
  }

  const query = typeof body.query === "string" ? body.query.trim().slice(0, 160) : "";
  if (query.length < 2) return json({ results: [], query });

  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return json({ error: "Configuração de busca indisponível." }, 503);

  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: books, error: booksError } = await db
    .from("bible_books")
    .select("id,name,abbrev")
    .order("name");

  if (booksError || !books) return json({ error: "Índice bíblico indisponível." }, 503);

  const reference = parseReference(query, books);
  if (reference) {
    const { data: chapterRow } = await db
      .from("bible_chapters")
      .select("id,number")
      .eq("book_id", reference.book.id)
      .eq("number", reference.chapter)
      .maybeSingle();

    if (!chapterRow) return json({ results: [], query, mode: "reference" });

    const { data: verse } = await db
      .from("bible_verses")
      .select("number,text")
      .eq("chapter_id", chapterRow.id)
      .eq("number", reference.verse)
      .maybeSingle();

    return json({
      query,
      mode: "reference",
      results: verse
        ? [{
            bookId: reference.book.id,
            bookAbbrev: reference.book.abbrev,
            bookName: reference.book.name,
            chapter: chapterRow.number,
            verse: verse.number,
            text: verse.text,
            score: 100,
            relevance: "Referência exata",
            isBible: true,
          }]
        : [],
    });
  }

  const normalizedQuery = normalize(query);
  const like = `%${escapeLike(query)}%`;
  const { data: verseRows, error: verseError } = await db
    .from("bible_verses")
    .select("id,chapter_id,number,text")
    .ilike("text", like)
    .limit(60);

  if (verseError) return json({ error: "Busca bíblica indisponível." }, 503);

  const chapterIds = [...new Set((verseRows ?? []).map((row) => row.chapter_id))];
  if (!chapterIds.length) return json({ query, mode: "text", results: [] });

  const { data: chapters } = await db
    .from("bible_chapters")
    .select("id,book_id,number")
    .in("id", chapterIds);

  const bookIds = [...new Set((chapters ?? []).map((row) => row.book_id))];
  const { data: matchedBooks } = bookIds.length
    ? await db.from("bible_books").select("id,name,abbrev").in("id", bookIds)
    : { data: [] };

  const chapterMap = new Map((chapters ?? []).map((row) => [row.id, row]));
  const bookMap = new Map((matchedBooks ?? []).map((row) => [row.id, row]));

  const results = (verseRows ?? [])
    .map((row) => {
      const chapter = chapterMap.get(row.chapter_id);
      const book = chapter ? bookMap.get(chapter.book_id) : null;
      if (!chapter || !book) return null;
      const textNorm = normalize(String(row.text ?? ""));
      const exactPhrase = textNorm.includes(normalizedQuery);
      const words = normalizedQuery.split(" ").filter(Boolean);
      const allWords = words.length > 1 && words.every((word) => textNorm.includes(word));
      const score = exactPhrase ? 100 : allWords ? 90 : 80;
      return {
        bookId: book.id,
        bookAbbrev: book.abbrev,
        bookName: book.name,
        chapter: chapter.number,
        verse: row.number,
        text: row.text,
        score,
        relevance: exactPhrase ? "Frase encontrada" : allWords ? "Todos os termos encontrados" : "Termo encontrado",
        isBible: true,
      };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => (b.score - a.score) || a.bookName.localeCompare(b.bookName, "pt-BR") || a.chapter - b.chapter || a.verse - b.verse)
    .slice(0, 30);

  return json({ query, mode: "text", results });
});