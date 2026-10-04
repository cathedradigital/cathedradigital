/**
 * AtriumBibleReader — Etapa 3 (reskin Stitch, tela 5 "Bíblia").
 *
 * Estratégia de não-substituição:
 *  - Sem params → landing editorial (hero + testamentos + livros) usando tokens stitch-*.
 *  - Com params (book/view) → delega ao leitor existente (BibleReadGate → Bible),
 *    preservando toda a lógica atual sem duplicação.
 */

import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Helmet } from '@/lib/helmet-compat';
import { Link, useNavigate, useSearchParams } from '@/lib/rr-compat';
import { BookOpen, Search as SearchIcon, ArrowRight, LayoutGrid, Bookmark, MoreHorizontal, List } from 'lucide-react';
import { BIBLE_DATA, type BibleBook } from '@/data/bible-books';
import { buildBibleUrl } from '@/lib/bibleUrl';
import { AppRoute } from '@/types';
import BibleReadGate from '@/components/cathedra/BibleReadGate';
import { BibleSkeleton } from '@/components/cathedra/RouteSkeletons';
import { ReaderToolbar } from '@/components/reader';
import { MobileTopBar } from '@/components/mobile/MobileTopBar';
import {
  BiblePickerSheet,
  getBibleLastRead,
  setBibleLastRead,
} from '@/components/mobile/BiblePickerSheet';
import { EditorialHero } from '@/components/editorial/harmony';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const Bible = lazy(() => import('@/components/cathedra/Bible'));

type Testament = 'Antigo Testamento' | 'Novo Testamento';



type BibleEditionStatus = 'católica' | 'estudo' | 'referência' | 'externa';

const BIBLE_EDITION_ROADMAP: Array<{ name: string; status: BibleEditionStatus; note: string }> = [
  { name: 'Edição católica principal', status: 'católica', note: 'Fonte editorial principal da Cátedra.' },
  { name: 'Vulgata Latina', status: 'referência', note: 'Preparada para comparação do texto latino e das tradições de tradução.' },
  { name: 'Ave Maria', status: 'externa', note: 'Consulta na fonte digital externa; o Cátedra não incorpora o texto sem licença.' },
  { name: 'CNBB', status: 'externa', note: 'Referência externa da tradução oficial; reprodução integral depende de autorização.' },
  { name: 'Peregrino', status: 'externa', note: 'Acesso externo; o Cátedra não extrai nem armazena conteúdo protegido.' },
  { name: 'Outras traduções', status: 'estudo', note: 'Espaço para traduções de estudo, sempre identificadas quanto à tradição e ao estatuto.' },
];

const TESTAMENT_META: Record<Testament, { kicker: string; blurb: string }> = {
  'Antigo Testamento': {
    kicker: 'Primeira Aliança',
    blurb: 'Da Criação à espera do Messias — a preparação divina para a plenitude dos tempos.',
  },
  'Novo Testamento': {
    kicker: 'Aliança em Cristo',
    blurb: 'Os Evangelhos, a vida da Igreja nascente e a consumação da promessa.',
  },
};

function findBookByAbbr(abbr: string | null): BibleBook | undefined {
  if (!abbr) return undefined;
  for (const t of Object.values(BIBLE_DATA)) {
    for (const cat of t) {
      const found = cat.books.find((b) => b.abbr.toLowerCase() === abbr.toLowerCase());
      if (found) return found;
    }
  }
  return undefined;
}

const AtriumBibleReader: React.FC = () => {
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const hasReaderParams = Boolean(sp.get('book') || sp.get('view') || sp.get('ref'));
  const [pickerOpen, setPickerOpen] = useState(false);

  const abbr = sp.get('book');
  // `ch` is the canonical Cátedra Bible URL parameter. Accept the legacy
  // `chapter`/`c` aliases at the boundary so every entry point lands on the
  // same reader state and the picker always reflects the current passage.
  const chapterStr = sp.get('ch') ?? sp.get('chapter') ?? sp.get('c');
  const currentChapter = chapterStr ? Number(chapterStr) : null;
  const currentSelection = abbr && Number.isInteger(currentChapter) && currentChapter > 0
    ? { abbr, chapter: currentChapter }
    : null;

  // Persistência: sempre que abrir com book+chapter, salvar como "último lido".
  useEffect(() => {
    if (!abbr || !chapterStr) return;
    const n = Number(chapterStr);
    if (!Number.isFinite(n)) return;
    setBibleLastRead({ abbr, chapter: n });
  }, [abbr, chapterStr]);

  if (hasReaderParams) {
    const book = findBookByAbbr(abbr);
    const title = book ? book.name : 'Sagrada Escritura';
    const subtitle = chapterStr ? `Capítulo ${chapterStr}` : undefined;
    return (
      <div data-catedra-module="bible">
        <Suspense fallback={<BibleSkeleton />}>
        <MobileTopBar
          kicker="Cathedra · Bíblia"
          title={book ? `${book.name} ${chapterStr ?? ''}`.trim() : 'Bíblia'}
          showBack
          onBack={() => navigate(AppRoute.BIBLE)}
          actions={
            <>
              <Link to={buildBibleUrl({ abbr: abbr ?? '', chapter: chapterStr ?? '1', extra: { view: 'search' } })} aria-label="Pesquisar na Bíblia" data-testid="bible-toolbar-search-mobile"><SearchIcon className="h-5 w-5" /></Link>
              <button type="button" onClick={() => setPickerOpen(true)} aria-label="Escolher livro e capítulo" className="inline-flex h-12 w-12 items-center justify-center rounded-full text-stitch-on-surface hover:bg-stitch-surface-container"><LayoutGrid className="h-5 w-5" /></button>
            </>
          }
        />
        <ReaderToolbar className="hidden md:block" kicker="Cathedra · Lectio Divina" title={title} subtitle={subtitle} backHref={AppRoute.BIBLE}
          actions={<>
            <Link to={buildBibleUrl({ abbr: abbr ?? '', chapter: chapterStr ?? '1', extra: { view: 'search' } })} aria-label="Pesquisar na Bíblia" data-testid="bible-toolbar-search"><SearchIcon className="h-4 w-4" /></Link>
            <Link to={buildBibleUrl({ abbr: abbr ?? '', chapter: chapterStr ?? '1', extra: { view: 'bookmarks' } })} aria-label="Abrir marcadores" data-testid="bible-toolbar-bookmarks"><Bookmark className="h-4 w-4" /></Link>
            <DropdownMenu><DropdownMenuTrigger asChild><button type="button" aria-label="Mais opções da Bíblia" data-testid="bible-toolbar-more"><MoreHorizontal className="h-4 w-4" /></button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => setPickerOpen(true)}><LayoutGrid className="mr-2 h-4 w-4" />Escolher livro e capítulo</DropdownMenuItem><DropdownMenuItem asChild><Link to={buildBibleUrl({ abbr: abbr ?? '', chapter: chapterStr ?? '1', extra: { view: 'notes' } })}><List className="mr-2 h-4 w-4" />Anotações</Link></DropdownMenuItem></DropdownMenuContent></DropdownMenu>
          </>}
        />
        <BibleReadGate>
          <Bible />
        </BibleReadGate>
        <BiblePickerSheet
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          initialSelection={currentSelection}
        />
        </Suspense>
      </div>
    );
  }

  return <BibleLanding />;
};


const BibleLanding: React.FC = () => {
  const [testament, setTestament] = useState<Testament>('Antigo Testamento');
  const [pickerOpen, setPickerOpen] = useState(false);
  const last = getBibleLastRead();
  const lastBook = last ? findBookByAbbr(last.abbr) : undefined;

  const categories = useMemo(() => BIBLE_DATA[testament] ?? [], [testament]);
  const bookCount = useMemo(
    () => categories.reduce((acc, c) => acc + c.books.length, 0),
    [categories],
  );

  return (
    <div
      className="min-h-screen w-full bg-stitch-background text-stitch-on-background" data-catedra-module="bible"
      style={{
        backgroundImage: 'url("https://www.transparenttextures.com/patterns/p6.png")',
      }}
    >
      <Helmet>
        <title>Cathedra — Sagrada Escritura</title>
        <meta
          name="description"
          content="Bíblia católica com notas, cruzamentos e Lectio Divina. Antigo e Novo Testamento em leitura contemplativa."
        />
        <link rel="canonical" href="https://www.cathedradigital.com.br/bible" />
        <meta property="og:title" content="Cathedra — Sagrada Escritura" />
        <meta property="og:url" content="https://www.cathedradigital.com.br/bible" />
        <meta property="og:type" content="website" />
      </Helmet>

      <MobileTopBar
        kicker="Cathedra"
        title="Bíblia"
        transparent
        actions={
          <>
            <Link to="/bible?view=search" aria-label="Pesquisar na Bíblia" data-testid="bible-toolbar-search-mobile"><SearchIcon className="h-5 w-5" /></Link>
            <button type="button" onClick={() => setPickerOpen(true)} aria-label="Escolher livro e capítulo" className="inline-flex h-12 w-12 items-center justify-center rounded-full text-stitch-on-surface hover:bg-stitch-surface-container"><LayoutGrid className="h-5 w-5" /></button>
          </>
        }
      />

      <section className="estudar-module-landing mx-auto w-full max-w-[1120px] px-5 pb-[calc(var(--stitch-mobile-bottomnav-h)+var(--stitch-mobile-safe-bottom)+2rem)] pt-6 md:px-16 md:pt-14 md:pb-16 animate-fade-in">
        {/* CAT-SP4 · Onda B.1 — Hero universal (Harmony) — irmão do Catecismo */}
        <EditorialHero density="balanced" rule={false}>
          <EditorialHero.Eyebrow>Sacra Scriptura</EditorialHero.Eyebrow>
          <EditorialHero.Title>Sagrada Escritura</EditorialHero.Title>
          <EditorialHero.Subtitle>
            Setenta e três livros, uma só Palavra. Percorra a narrativa da Aliança,
            do Gênesis ao Apocalipse, iluminada pela Tradição.
          </EditorialHero.Subtitle>
          <EditorialHero.Context>
            <Link
              to={AppRoute.BUSCAR}
              className="group relative flex w-full items-center gap-3 rounded-lg border border-stitch-outline-variant/40 bg-stitch-surface-container-low px-4 py-2.5 text-[14px] font-medium text-stitch-on-surface-variant transition-all hover:border-stitch-secondary md:w-64"
            >
              <SearchIcon className="h-5 w-5 shrink-0" />
              <span className="font-stitch-body">Buscar passagem…</span>
            </Link>
          </EditorialHero.Context>
          <EditorialHero.Actions>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="hidden md:inline-flex min-h-[44px] items-center gap-2 rounded-full border border-stitch-secondary/40 bg-stitch-surface-container-lowest px-4 py-2 font-stitch-body text-[12px] font-bold uppercase tracking-[0.15em] text-stitch-primary transition-colors hover:border-stitch-secondary hover:bg-stitch-secondary-container"
            >
              <LayoutGrid className="h-4 w-4 text-stitch-secondary" />
              Escolher livro
            </button>
            {last && lastBook && (
              <Link
                to={buildBibleUrl({ abbr: last.abbr, chapter: last.chapter })}
                className="inline-flex items-center gap-2 rounded-full border border-stitch-outline-variant/40 bg-stitch-surface-container-low px-4 py-2 font-stitch-body text-[12px] font-bold uppercase tracking-[0.15em] text-stitch-on-surface-variant transition-colors hover:border-stitch-secondary hover:text-stitch-primary"
              >
                Continuar em {lastBook.name} {last.chapter}
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </EditorialHero.Actions>
        </EditorialHero>


        {/* Testament switcher */}
        <section className="pt-10">
          <div className="flex flex-wrap items-center gap-2 border-b border-stitch-outline-variant/30">
            {(Object.keys(TESTAMENT_META) as Testament[]).map((t) => {
              const active = t === testament;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTestament(t)}
                  className={[
                    'relative -mb-px px-4 py-3 font-stitch-body text-[13px] font-bold uppercase tracking-[0.18em] transition-colors',
                    active
                      ? 'text-stitch-primary'
                      : 'text-stitch-on-surface-variant hover:text-stitch-primary',
                  ].join(' ')}
                  aria-pressed={active}
                >
                  {t}
                  {active && (
                    <span className="absolute inset-x-0 -bottom-px h-[2px] bg-stitch-secondary" />
                  )}
                </button>
              );
            })}
            <div className="ml-auto hidden font-stitch-body text-[12px] font-bold uppercase tracking-[0.15em] text-stitch-on-surface-variant md:inline">
              {String(bookCount).padStart(2, '0')} Livros
            </div>
          </div>

          <div className="mt-4 max-w-2xl font-stitch-body text-[15px] italic text-stitch-on-surface-variant">
            <span className="mr-2 font-bold not-italic uppercase tracking-[0.15em] text-stitch-secondary">
              {TESTAMENT_META[testament].kicker}.
            </span>
            {TESTAMENT_META[testament].blurb}
          </div>
        </section>


        <section className="mt-8 rounded-2xl border border-stitch-outline-variant/30 bg-stitch-surface-container-lowest p-4 md:p-5">
          <p className="font-stitch-body text-[9px] font-bold uppercase tracking-[0.16em] text-stitch-secondary">Evangelhos sinóticos</p>
          <h2 className="mt-1 font-stitch-display text-[21px] text-stitch-primary">Mateus · Marcos · Lucas</h2>
          <p className="mt-1 max-w-2xl font-stitch-body text-[13px] leading-relaxed text-stitch-on-surface-variant">
            Três testemunhos do mesmo mistério de Cristo. A Cátedra poderá ligar episódios paralelos, referências e diferenças de redação sem misturar o texto bíblico com comentários.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-1.5">
            {[
              { abbr: 'Mt', name: 'Mateus', note: 'Evangelho segundo Mateus' },
              { abbr: 'Mc', name: 'Marcos', note: 'Evangelho segundo Marcos' },
              { abbr: 'Lc', name: 'Lucas', note: 'Evangelho segundo Lucas' },
            ].map((gospel) => (
              <Link key={gospel.abbr} to={buildBibleUrl({ abbr: gospel.abbr, chapter: 1 })}
                className="group rounded-lg border border-stitch-outline-variant/30 bg-stitch-surface p-2 transition-colors hover:border-stitch-secondary">
                <span className="font-stitch-display text-[22px] text-stitch-secondary">{gospel.abbr}</span>
                <span className="mt-1 block font-stitch-body text-[13px] font-semibold text-stitch-primary">{gospel.name}</span>
                <span className="mt-0.5 block text-[10px] leading-snug text-stitch-on-surface-variant">{gospel.note}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Categorias e livros */}
        <section className="pt-10 space-y-14">
          {categories.map((cat) => (
            <div key={cat.name}>
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <h2 className="font-stitch-display text-[24px] leading-[32px] text-stitch-primary">
                    {cat.name}
                  </h2>
                  {cat.description && (
                    <p className="mt-1 max-w-xl font-stitch-body text-[14px] text-stitch-on-surface-variant">
                      {cat.description}
                    </p>
                  )}
                </div>
                <div className="hidden h-px flex-1 bg-stitch-secondary/20 md:mx-6 md:block" />
                <span className="shrink-0 font-stitch-body text-[12px] font-bold uppercase tracking-[0.15em] text-stitch-on-surface-variant">
                  {String(cat.books.length).padStart(2, '0')} Livros
                </span>
              </div>

              <div className="estudar-bible-book-grid grid grid-cols-2 gap-1.5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                {cat.books.map((book: BibleBook, i: number) => (
                  <Link
                    key={book.abbr}
                    to={buildBibleUrl({ abbr: book.abbr, chapter: 1 })}
                    className="estudar-bible-book-card group relative flex min-h-[62px] sm:min-h-[72px] flex-col justify-between overflow-hidden rounded-lg border border-stitch-outline-variant/20 bg-stitch-surface-container-lowest p-2 transition-all hover:border-stitch-secondary hover:shadow-lg hover:shadow-black/[0.05] md:min-h-[82px] md:p-2.5"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-stitch-primary/[0.03] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="relative">
                      <span className="font-stitch-display text-[18px] italic leading-none text-stitch-secondary/75 sm:text-[22px] md:text-[28px]">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="relative">
                      <h3 className="font-stitch-display text-[12px] leading-tight text-stitch-primary sm:text-[14px] transition-colors group-hover:text-stitch-secondary md:text-[15px]">
                        {book.name}
                      </h3>
                      <p className="mt-0.5 font-stitch-body text-[9px] font-bold uppercase tracking-[0.08em] text-stitch-on-surface-variant md:text-[10px]">
                        {book.abbr} · {book.chapters} cap.
                      </p>
                      <div className="mt-1 flex items-center justify-between text-stitch-secondary opacity-100 transition-opacity">
                        <span className="font-stitch-body text-[11px] uppercase tracking-[0.15em]">
                          Abrir
                        </span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="mt-12 rounded-2xl border border-stitch-outline-variant/30 bg-stitch-surface-container-lowest p-4 md:p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="font-stitch-body text-[9px] font-bold uppercase tracking-[0.16em] text-stitch-secondary">Edições e traduções</p>
              <h2 className="mt-1 font-stitch-display text-[20px] text-stitch-primary">Escolha a tradição de leitura</h2>
            </div>
            <span className="hidden text-[9px] font-bold uppercase tracking-[0.12em] text-stitch-on-surface-variant sm:block">Em preparação</span>
          </div>
          <div className="-mx-4 mt-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 scrollbar-none md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
            {BIBLE_EDITION_ROADMAP.map((edition) => (
              <div key={edition.name} className="min-w-[220px] snap-start rounded-xl border border-stitch-outline-variant/25 bg-stitch-surface p-3 md:min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-stitch-body text-[12px] font-semibold leading-snug text-stitch-on-surface">{edition.name}</span>
                  <span className="shrink-0 rounded-full bg-stitch-secondary-container px-2 py-1 text-[8px] font-bold uppercase tracking-[0.08em] text-stitch-primary">{edition.status}</span>
                </div>
                <p className="mt-1 text-[10px] leading-relaxed text-stitch-on-surface-variant">{edition.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Rodapé contemplativo */}
        <section className="mt-16 flex items-center gap-4 border-t border-stitch-secondary/10 pt-8 text-stitch-on-surface-variant">
          <BookOpen className="h-5 w-5 text-stitch-secondary" />
          <p className="font-stitch-body text-[14px] italic">
            "Tua palavra é lâmpada para os meus pés, luz para o meu caminho." — Sl 119, 105
          </p>
        </section>
      </section>

      <BiblePickerSheet open={pickerOpen} onOpenChange={setPickerOpen} />
    </div>
  );
};

export default AtriumBibleReader;
