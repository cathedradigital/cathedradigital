import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DATA_URL = 'https://raw.githubusercontent.com/bibliacatolica/biblia/cf1545c87d61a0c246985cf8c8ee1699fd74f1bd/biblia-matos-soares-completa.json';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios.');
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const response = await fetch(DATA_URL, { headers: { Accept: 'application/json' } });
if (!response.ok) throw new Error(`Falha ao baixar corpus bíblico: HTTP ${response.status}`);
const corpus = await response.json();

if (corpus.totalBooks !== 73 || corpus.totalChapters !== 1334 || corpus.totalVerses !== 35816) {
  throw new Error(`Corpus inesperado: livros=${corpus.totalBooks}, capítulos=${corpus.totalChapters}, versículos=${corpus.totalVerses}`);
}

const normalizeAbbrev = (abbrev) => ({
  Ab: 'Abd',
  Jt: 'Jdt',
  '1Cor': '1 Cor',
  '2Cor': '2 Cor',
  '1Pd': '1 Pd',
  '2Pd': '2 Pd',
  '1Jo': '1 Jo',
  '2Jo': '2 Jo',
  '3Jo': '3 Jo',
}[abbrev] ?? abbrev);

const { data: books, error: booksError } = await supabase
  .from('bible_books')
  .select('id,abbrev');

if (booksError) throw booksError;

const byAbbrev = new Map(books.map((book) => [book.abbrev, book]));

await supabase.from('bible_verses').delete().not('id', 'is', null);
await supabase.from('bible_chapters').delete().not('id', 'is', null);

for (const sourceBook of corpus.books) {
  const abbrev = normalizeAbbrev(sourceBook.abbrev);
  const book = byAbbrev.get(abbrev);
  if (!book) throw new Error(`Livro não encontrado no catálogo Supabase: ${sourceBook.name} (${abbrev})`);

  const chapters = Object.entries(sourceBook.chapters).map(([number]) => ({
    book_id: book.id,
    number: Number(number),
    source_name: 'Bíblia Católica — Pe. Manuel de Matos Soares',
    source_url: 'https://github.com/bibliacatolica/biblia',
    source_retrieved_at: new Date().toISOString(),
  }));

  const { error: chapterError } = await supabase.from('bible_chapters').insert(chapters);
  if (chapterError) throw chapterError;
}

const { data: loadedChapters, error: loadedError } = await supabase
  .from('bible_chapters')
  .select('id,number,book_id');

if (loadedError) throw loadedError;

const chapterKey = new Map(loadedChapters.map((row) => [`${row.book_id}:${row.number}`, row.id]));

for (const sourceBook of corpus.books) {
  const book = byAbbrev.get(normalizeAbbrev(sourceBook.abbrev));
  for (const [chapter, verses] of Object.entries(sourceBook.chapters)) {
    const chapterId = chapterKey.get(`${book.id}:${chapter}`);
    const rows = verses.map((verse) => ({
      chapter_id: chapterId,
      number: Number(verse.v),
      text: String(verse.t),
      source_name: 'Bíblia Católica — Pe. Manuel de Matos Soares',
      source_url: 'https://github.com/bibliacatolica/biblia',
      source_retrieved_at: new Date().toISOString(),
    }));
    for (let i = 0; i < rows.length; i += 500) {
      const { error } = await supabase.from('bible_verses').insert(rows.slice(i, i + 500));
      if (error) throw error;
    }
  }
}

console.log('Bíblia restaurada:', corpus.totalBooks, 'livros,', corpus.totalChapters, 'capítulos,', corpus.totalVerses, 'versículos.');
