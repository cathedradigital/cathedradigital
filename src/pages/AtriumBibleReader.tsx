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
import { Link, useSearchParams } from '@/lib/rr-compat';
import { BookOpen, Search as SearchIcon, ArrowRight, LayoutGrid } from 'lucide-react';
import { BIBLE_DATA, type BibleBook } from '@/data/bible-books';
import { buildBibleUrl } from '@/lib/bibleUrl';
import { AppRoute } from '@/types';
import BibleReadGate from '@/components/cathedra/BibleReadGate';
import { BibleSkeleton } from '@/components/cathedra/RouteSkeletons';
import { ReaderToolbar } from '@/components/reader';
import { MobileTopBar } from '@/components/mobile/MobileTopBar';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';
import {
  BiblePickerSheet,
  getBibleLastRead,
  setBibleLastRead,
} from '@/components/mobile/BiblePickerSheet';
import { EditorialHero } from '@/components/editorial/harmony';

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
\nconst TESTAMENT_META: Record<Testament, { kicker: string; blurb: string }> = {
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
  const hasReaderParams = sp.get('book') || sp.get('view');
  const [pickerOpen, setPickerOpen] = useState(false);

  const abbr = sp.get('book');
  const chapterStr = sp.get('chapter') ?? sp.get('c');

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
          actions={
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              aria-label="Escolher livro e capítulo"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full text-stitch-on-surface hover:bg-stitch-surface-container"
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
          }
        />
        <ReaderToolbar
          kicker="Cathedra · Lectio Divina"
          title={title}
          subtitle={subtitle}
          backHref={AppRoute.BIBLE}
        />
        <BibleReadGate>
          <Bible />
        </BibleReadGate>
        <BiblePickerSheet open={pickerOpen} onOpenChange={setPickerOpen} />
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
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            aria-label="Escolher livro e capítulo"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full text-stitch-on-surface hover:bg-stitch-surface-container"
          >
            <LayoutGrid className="h-5 w-5" />
          </button>
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
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-stitch-secondary/40 bg-stitch-surface-container-lowest px-4 py-2 font-stitch-body text-[12px] font-bold uppercase tracking-[0.15em] text-stitch-primary transition-colors hover:border-stitch-secondary hover:bg-stitch-secondary-container"
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


        <section className="mt-10 rounded-2xl border border-stitch-outline-variant/35 bg-stitch-surface-container-lowest p-5 shadow-sm">
          <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-stitch-body text-[10px] font-bold uppercase tracking-[0.18em] text-stitch-secondary">Estudo comparado</p>
              <h2 className="mt-1 font-stitch-display text-[22px] text-stitch-primary">Edições e traduções</h2>
              <p className="mt-1 max-w-2xl font-stitch-body text-[13px] leading-relaxed text-stitch-on-surface-variant">
                A estrutura já fica preparada para comparar futuras edições da Escritura, sem misturar tradução, tradição e estatuto editorial.
              </p>
            </div>
            <span className="font-stitch-body text-[10px] font-bold uppercase tracking-[0.14em] text-stitch-on-surface-variant">Em preparação</span>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {BIBLE_EDITION_ROADMAP.map((edition) => (
              <div key={edition.name} className="rounded-xl border border-stitch-outline-variant/30 bg-stitch-surface px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-stitch-body text-[13px] font-semibold text-stitch-on-surface">{edition.name}</span>
                  <span className="shrink-0 rounded-full bg-stitch-secondary-container px-2 py-1 font-stitch-body text-[9px] font-bold uppercase tracking-[0.1em] text-stitch-primary">{edition.status}</span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-stitch-on-surface-variant">{edition.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-stitch-outline-variant/30 bg-stitch-surface-container-lowest p-5">
          <p className="font-stitch-body text-[10px] font-bold uppercase tracking-[0.18em] text-stitch-secondary">Evangelhos sinóticos</p>
          <h2 className="mt-1 font-stitch-display text-[21px] text-stitch-primary">Mateus · Marcos · Lucas</h2>
          <p className="mt-1 max-w-2xl font-stitch-body text-[13px] leading-relaxed text-stitch-on-surface-variant">
            Área reservada para estudo comparado dos três Evangelhos sinóticos, com referências às fontes e distinção clara entre texto bíblico, tradição e material de apoio.
          </p>
        </section>
\n        {/* Categorias e livros */}
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

              <div className="estudar-bible-book-grid grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {cat.books.map((book: BibleBook, i: number) => (
                  <Link
                    key={book.abbr}
                    to={buildBibleUrl({ abbr: book.abbr, chapter: 1 })}
                    className="estudar-bible-book-card group relative flex aspect-[3/4] flex-col justify-between overflow-hidden border border-stitch-outline-variant/20 bg-stitch-surface-container-lowest p-4 transition-all hover:border-stitch-secondary hover:shadow-lg hover:shadow-black/[0.05]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-stitch-primary/[0.03] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="relative">
                      <span className="font-stitch-display text-[48px] italic leading-none text-stitch-secondary/75">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="relative">
                      <h3 className="font-stitch-display text-[18px] leading-tight text-stitch-primary transition-colors group-hover:text-stitch-secondary">
                        {book.name}
                      </h3>
                      <p className="mt-1 font-stitch-body text-[11px] font-bold uppercase tracking-[0.15em] text-stitch-on-surface-variant">
                        {book.abbr} · {book.chapters} cap.
                      </p>
                      <div className="mt-3 flex items-center justify-between text-stitch-secondary opacity-0 transition-opacity group-hover:opacity-100">
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

        {/* Rodapé contemplativo */}
        <section className="mt-16 flex items-center gap-4 border-t border-stitch-secondary/10 pt-8 text-stitch-on-surface-variant">
          <BookOpen className="h-5 w-5 text-stitch-secondary" />
          <p className="font-stitch-body text-[14px] italic">
            "Tua palavra é lâmpada para os meus pés, luz para o meu caminho." — Sl 119, 105
          </p>
        </section>
      </section>

      <MobileBottomNav />
      <BiblePickerSheet open={pickerOpen} onOpenChange={setPickerOpen} />
    </div>
  );
};

export default AtriumBibleReader;
