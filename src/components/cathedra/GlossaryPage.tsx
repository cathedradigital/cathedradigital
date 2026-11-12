/**
 * GlossaryPage — Índice editorial do Léxico Teológico (SEG-2 Onda 2).
 *
 * Rota: /glossario
 *
 * Enciclopédia católica viva no padrão Logos 2030:
 *  - Hero editorial
 *  - Busca instantânea (fuzzy pg_trgm + unaccent)
 *  - Índice A–Z sticky para navegação rápida
 *  - Filtro por categorias editoriais
 *  - Grid de verbetes como cartões que abrem a página definitiva
 *    do verbete (/glossario/:slug) — sem expansão inline.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from '@/lib/rr-compat';
import { Search } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import { supabase } from '@/lib/db';
import { useFuzzySearch } from '@/hooks/useFuzzySearch';
import {
  EditorialShell,
  EditorialHero,
  EditorialDivider,
} from '@/components/editorial';
import {
  EditorialKicker,
  EditorialEmptyState,
} from '@/components/editorial/primitives';
import {
  getRosaryReturn,
  clearRosaryReturn,
  formatElapsedShort,
  ROSARY_MODE_LABEL,
  type RosaryReturnContext,
} from '@/lib/rosaryReturnContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function slugifyTerm(term: string): string {
  return term
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

interface GlossaryTerm {
  id: string;
  slug: string | null;
  term: string;
  short_definition: string | null;
  definition: string;
  category: string | null;
  status: string | null;
  editorial_completeness: 'complete' | 'expanding' | 'reviewed_theologically' | null;
  similarityScore?: number;
}

const COMPLETENESS_DOT: Record<string, { color: string; label: string }> = {
  complete: { color: 'bg-emerald-500', label: 'Completo' },
  expanding: { color: 'bg-amber-500', label: 'Em expansão' },
  reviewed_theologically: { color: 'bg-sky-500', label: 'Revisado teologicamente' },
};

type CompletenessValue = Exclude<GlossaryTerm['editorial_completeness'], null>;
type CompletenessFilter = 'all' | CompletenessValue;

const COMPLETENESS_OPTIONS: Array<{ value: CompletenessValue; label: string }> = [
  { value: 'complete', label: 'Completo' },
  { value: 'expanding', label: 'Em expansão' },
  { value: 'reviewed_theologically', label: 'Revisado teologicamente' },
];

function isCompletenessValue(value: string | null): value is CompletenessValue {
  return value === 'complete' || value === 'expanding' || value === 'reviewed_theologically';
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function firstLetter(term: string): string {
  const clean = term.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const ch = (clean[0] ?? '').toUpperCase();
  return /[A-Z]/.test(ch) ? ch : '#';
}

const GlossaryPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const category = searchParams.get('category') || 'Todos';
  const searchQuery = searchParams.get('q') ?? '';
  const rawCompletenessFilter = searchParams.get('completeness');
  const completenessFilter: CompletenessFilter = isCompletenessValue(rawCompletenessFilter)
    ? rawCompletenessFilter
    : 'all';
  const [rosaryReturn, setRosaryReturn] = useState<RosaryReturnContext | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const updateSearchParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    const trimmed = value.trim();
    if (trimmed) next.set(key, trimmed);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  // Se a rota veio como /glossario/:slug (legado), redireciona para a página definitiva.
  useEffect(() => {
    if (slug) navigate(`/glossario/${slug}`, { replace: true });
  }, [slug, navigate]);

  useEffect(() => {
    setRosaryReturn(getRosaryReturn());
  }, []);

  const handleReturnToRosary = () => {
    clearRosaryReturn();
    setRosaryReturn(null);
    navigate('/rosary#preparation');
  };

  const {
    results: searchResults,
    isPending: isSearchPending,
    error: searchError,
    refetch: refetchSearch,
  } = useFuzzySearch<GlossaryTerm>({
    rpc: 'search_glossary_fuzzy',
    query: searchQuery,
    primaryField: 'term',
    secondaryField: 'definition',
    secondaryWeight: 0.5,
    fallbackRows: terms,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(false);
      let { data, error } = await (supabase as any)
        .from('glossary')
        .select('id, slug, term, short_definition, definition, category, status, editorial_completeness')
        .order('term', { ascending: true });
      // The legacy public schema has no editorial status column. Only retry
      // this specific projection mismatch; RLS and all other errors remain intact.
      if (error?.code === '42703' && /glossary\.status/.test(error.message ?? '')) {
        const response = await supabase.from('glossary')
          .select('id, slug, term, short_definition, definition, category, editorial_completeness')
          .order('term', { ascending: true });
        data = response.data?.map((row) => ({ ...row, status: null })) ?? null;
        error = response.error;
      }
      if (cancelled) return;
      if (error) console.error('Erro ao carregar glossário:', error);
      setLoadError(Boolean(error));
      setTerms((data as GlossaryTerm[]) || []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const categories = useMemo(() => {
    const cats = new Set(terms.map((t) => t.category).filter(Boolean) as string[]);
    return ['Todos', ...Array.from(cats).sort((a, b) => a.localeCompare(b, 'pt'))];
  }, [terms]);

  const isSearching = searchQuery.trim().length >= 2;

  const filtered = useMemo(() => {
    const base = isSearching
      ? isSearchPending || !searchResults
        ? []
        : searchResults
      : terms;
    return base.filter((term) =>
      (category === 'Todos' || term.category === category) &&
      (completenessFilter === 'all' || term.editorial_completeness === completenessFilter),
    );
  }, [terms, searchResults, isSearching, isSearchPending, category, completenessFilter]);

  // Agrupamento A–Z (só quando não há busca ativa)
  const grouped = useMemo(() => {
    const map = new Map<string, GlossaryTerm[]>();
    for (const t of filtered) {
      const letter = firstLetter(t.term);
      const arr = map.get(letter) ?? [];
      arr.push(t);
      map.set(letter, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b, 'pt'));
  }, [filtered]);

  const availableLetters = useMemo(() => new Set(grouped.map(([l]) => l)), [grouped]);

  return (
    <>
      <SEOHead
        title="Léxico Teológico"
        description="Enciclopédia católica viva: definições editoriais, contexto histórico, Escritura, Catecismo, Magistério, Santos e Liturgia interconectados no Nexus."
        path="/glossario"
        keywords="glossário teológico, léxico católico, enciclopédia teológica, definições católicas"
        breadcrumbs={[{ name: 'Início', path: '/' }, { name: 'Léxico', path: '/glossario' }]}
      />

      <EditorialShell>
        {/* Sessão do Rosário — retomar */}
        {rosaryReturn && (
          <div
            role="region"
            aria-label="Retomar sessão do Rosário"
            aria-live="polite"
            className="sticky top-2 z-30 mx-auto max-w-3xl my-6 rounded-[var(--stitch-radius-xl)] border border-stitch-secondary/40 bg-stitch-surface-container-lowest/95 backdrop-blur p-4 flex items-center gap-4"
          >
            <div className="flex-1 min-w-0">
              <p className="font-stitch-label text-stitch-label-sm uppercase tracking-[0.22em] text-stitch-secondary/80">
                Sessão em andamento
              </p>
              <p className="font-stitch-serif text-stitch-body-sm text-stitch-on-background truncate">
                {rosaryReturn.setName} · {rosaryReturn.mysteryLabel} · modo{' '}
                <strong>{ROSARY_MODE_LABEL[rosaryReturn.mode]}</strong> ·{' '}
                {formatElapsedShort(rosaryReturn.elapsedMs)}
              </p>
            </div>
            <button
              type="button"
              onClick={handleReturnToRosary}
              className="shrink-0 px-4 py-2 border border-stitch-secondary text-stitch-secondary uppercase tracking-[0.24em] font-stitch-label text-stitch-label-sm hover:bg-stitch-secondary/10 transition"
            >
              Voltar ao Rosário
            </button>
          </div>
        )}

        <EditorialHero
          meta="Enciclopédia católica viva"
          kicker="Lexicon Theologicum"
          title="Palavras que revelam"
          subtitle="Cada verbete é uma porta: Escritura, Tradição, Magistério, Liturgia e Santos se encontram em torno de um conceito para conduzir o estudo, a contemplação e a vida."
          size="lg"
          parchment
        />

        {/* Busca instantânea */}
        <div className="max-w-2xl mx-auto px-4 -mt-4 mb-10">
          <label htmlFor="glossary-search" className="sr-only">
            Buscar verbete
          </label>
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="glossary-search"
              type="search"
              value={searchQuery}
              onChange={(e) => updateSearchParam('q', e.target.value)}
              placeholder="Digite uma palavra ou conceito…"
              className={cn(
                'w-full pl-12 pr-12 py-4 rounded-full',
                'bg-card border border-border/60',
                'font-serif text-premium-base text-foreground',
                'placeholder:text-muted-foreground/70',
                'focus-visible:outline-none focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/30',
              )}
            />
            {isSearchPending && (
              <span className="absolute right-5 top-1/2 -translate-y-1/2 type-rubrica text-[color:var(--gold-text)]">
                buscando…
              </span>
            )}
          </div>
          {isSearching && !isSearchPending && searchError && (
            <div
              data-testid="glossary-search-fallback"
              role="status"
              aria-live="polite"
              className="mt-3 flex flex-col gap-3 rounded-lg border border-stitch-secondary/30 bg-stitch-surface-container-lowest p-3 text-sm text-stitch-on-surface-variant sm:flex-row sm:items-center sm:justify-between"
            >
              <p>Busca por aproximação indisponível. Exibindo correspondências locais simplificadas.</p>
              <Button type="button" variant="outline" size="sm" onClick={refetchSearch}>
                Tentar busca novamente
              </Button>
            </div>
          )}
        </div>

        {/* Categorias editoriais */}
        {!loading && categories.length > 1 && (
          <div className="max-w-5xl mx-auto px-4 mb-8">
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((cat) => {
                const active = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => updateSearchParam('category', cat === 'Todos' ? '' : cat)}
                    aria-pressed={active}
                    className={cn(
                      'px-4 py-2 rounded-full border font-stitch-label text-stitch-label-sm uppercase tracking-[0.22em] transition-colors',
                      active
                        ? 'border-stitch-secondary bg-stitch-secondary text-stitch-secondary-foreground font-semibold'
                        : 'border-stitch-outline-variant/50 text-stitch-on-surface-variant hover:border-stitch-secondary hover:text-[color:var(--gold-text-strong)]',
                    )}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!loading && terms.some((term) => term.editorial_completeness) && (
          <div className="max-w-5xl mx-auto px-4 mb-8">
            <p className="mb-2 text-center type-rubrica text-[color:var(--gold-text)]">Grau editorial</p>
            <div role="group" aria-label="Filtrar por grau editorial" className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => updateSearchParam('completeness', '')}
                aria-pressed={completenessFilter === 'all'}
                className={cn(
                  'px-4 py-2 rounded-full border font-stitch-label text-stitch-label-sm uppercase tracking-[0.18em] transition-colors',
                  completenessFilter === 'all'
                    ? 'border-stitch-secondary bg-stitch-secondary text-stitch-secondary-foreground font-semibold'
                    : 'border-stitch-outline-variant/50 text-stitch-on-surface-variant hover:border-stitch-secondary hover:text-[color:var(--gold-text-strong)]',
                )}
              >
                Todos os graus
              </button>
              {COMPLETENESS_OPTIONS.filter((option) =>
                terms.some((term) => term.editorial_completeness === option.value),
              ).map((option) => {
                const active = completenessFilter === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateSearchParam('completeness', option.value)}
                    aria-pressed={active}
                    className={cn(
                      'px-4 py-2 rounded-full border font-stitch-label text-stitch-label-sm uppercase tracking-[0.18em] transition-colors',
                      active
                        ? 'border-stitch-secondary bg-stitch-secondary text-stitch-secondary-foreground font-semibold'
                        : 'border-stitch-outline-variant/50 text-stitch-on-surface-variant hover:border-stitch-secondary hover:text-[color:var(--gold-text-strong)]',
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-center text-xs text-stitch-on-surface-variant">
              O grau editorial descreve o estado do verbete; não substitui as fontes indicadas.
            </p>
          </div>
        )}

        {/* Índice A–Z (só quando não há busca) */}
        {!isSearching && !loading && (
          <nav
            aria-label="Índice A–Z"
            className="sticky top-16 z-20 bg-stitch-background/90 backdrop-blur border-y border-stitch-outline-variant/30 py-3 mb-10"
          >
            <ol className="flex flex-wrap justify-center gap-x-2 gap-y-1 max-w-5xl mx-auto px-4">
              {ALPHABET.map((letter) => {
                const enabled = availableLetters.has(letter);
                return (
                  <li key={letter}>
                    {enabled ? (
                      <a
                        href={`#letra-${letter}`}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-full font-stitch-label text-stitch-label-sm uppercase text-stitch-secondary hover:bg-stitch-secondary/10 transition-colors"
                        aria-label={`Ir para letra ${letter}`}
                      >
                        {letter}
                      </a>
                    ) : (
                      <span
                        className="inline-flex items-center justify-center h-8 w-8 rounded-full font-stitch-label text-stitch-label-sm uppercase text-stitch-on-surface-variant/40"
                        aria-disabled="true"
                      >
                        {letter}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}

        {/* Estatísticas */}
        {!loading && (
          <div className="max-w-4xl mx-auto px-4 mb-10">
            <EditorialDivider variant="gold-fade" className="mb-6" />
            <dl className="grid grid-cols-3 gap-6 text-center font-stitch-label text-stitch-label-sm uppercase tracking-[0.22em] text-stitch-on-surface-variant">
              <div>
                <dt className="text-foreground/85">Verbetes</dt>
                <dd className="mt-1 font-stitch-display text-stitch-display-sm text-stitch-on-background">
                  {filtered.length}
                </dd>
              </div>
              <div>
                <dt className="text-foreground/85">Categorias</dt>
                <dd className="mt-1 font-stitch-display text-stitch-display-sm text-stitch-on-background">
                  {categories.length - 1}
                </dd>
              </div>
              <div>
                <dt className="text-foreground/85">Publicados</dt>
                <dd className="mt-1 font-stitch-display text-stitch-display-sm text-stitch-on-background">
                  {terms.some((t) => t.status != null) ? terms.filter((t) => t.status === 'published').length : '—'}
                </dd>
              </div>
            </dl>
          </div>
        )}

        {/* Conteúdo */}
        <div ref={listRef} className="max-w-5xl mx-auto px-4 pb-24">
          {loading ? (
            <div className="flex justify-center py-24">
              <div className="h-10 w-10 border-2 border-stitch-secondary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : loadError ? (
            <div role="alert" className="py-12 text-center">
              <p className="mb-4 text-muted-foreground">Não foi possível carregar o glossário.</p>
              <Button variant="outline" onClick={() => setReloadKey((value) => value + 1)}>Tentar novamente</Button>
            </div>
          ) : isSearching && isSearchPending ? (
            <div role="status" aria-live="polite" className="py-12 text-center text-muted-foreground">
              Buscando verbetes para “{searchQuery}”…
            </div>
          ) : filtered.length === 0 ? (
            <EditorialEmptyState
              kicker={isSearching ? 'Nenhum resultado' : 'Léxico vazio'}
              title={
                isSearching
                  ? `Nenhum verbete encontrado para "${searchQuery}".`
                  : 'Nenhum verbete disponível ainda.'
              }
              description={
                isSearching
                  ? 'Experimente outro termo ou remova o filtro de categoria.'
                  : 'Novos verbetes serão publicados em breve.'
              }
            />
          ) : isSearching ? (
            // Resultados de busca em lista contínua
            <ul className="grid gap-4 md:grid-cols-2">
              {filtered.map((t) => (
                <TermCard key={t.id} term={t} highlight={searchQuery} />
              ))}
            </ul>
          ) : (
            // Agrupamento A–Z
            <div className="space-y-16">
              {grouped.map(([letter, items]) => (
                <section key={letter} id={`letra-${letter}`} className="scroll-mt-32">
                  <header className="flex items-baseline gap-6 mb-8">
                    <span
                      aria-hidden="true"
                      className="font-display text-premium-3xl text-[color:var(--gold-text)] leading-none"
                    >
                      {letter}
                    </span>
                    <EditorialKicker>
                      {items.length} {items.length === 1 ? 'verbete' : 'verbetes'}
                    </EditorialKicker>
                    <div className="flex-1 h-px bg-border/40" />
                  </header>
                  <ul className="grid gap-4 md:grid-cols-2">
                    {items.map((t) => (
                      <TermCard key={t.id} term={t} />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      </EditorialShell>
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Card do verbete                                                     */
/* ------------------------------------------------------------------ */

const TermCard: React.FC<{ term: GlossaryTerm; highlight?: string }> = ({ term, highlight }) => {
  const to = term.slug ? `/glossario/${term.slug}` : `/glossario/${slugifyTerm(term.term)}`;
  const summary = term.short_definition?.trim() || term.definition.slice(0, 160);

  return (
    <li>
      <Link
        to={to}
        className={cn(
          'group block h-full p-6 rounded-premium',
          'bg-card border border-border/40',
          'hover:border-gold/60 focus-visible:border-gold',
          'focus-visible:outline-none transition-colors',
        )}
      >
        {(term.category || term.editorial_completeness) && (
          <div className="flex items-center gap-3 mb-2">
            {term.category && (
              <span className="type-rubrica text-[color:var(--gold-text)]">
                {term.category}
              </span>

            )}
            {term.editorial_completeness && COMPLETENESS_DOT[term.editorial_completeness] && (
              <span
                className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-stitch-on-surface-variant"
                title={`Grau editorial: ${COMPLETENESS_DOT[term.editorial_completeness].label}`}
                aria-label={`Grau editorial: ${COMPLETENESS_DOT[term.editorial_completeness].label}`}
              >
                <span
                  className={cn('h-1.5 w-1.5 rounded-full', COMPLETENESS_DOT[term.editorial_completeness].color)}
                  aria-hidden="true"
                />
                {COMPLETENESS_DOT[term.editorial_completeness].label}
              </span>
            )}
          </div>
        )}
        <h3 className="font-display text-premium-xl text-foreground group-hover:text-[color:var(--gold-text)] transition-colors">
          {highlight ? (
            <HighlightedText text={term.term} query={highlight} />
          ) : (
            term.term
          )}
        </h3>
        <p className="mt-3 font-stitch-serif text-stitch-body-sm text-stitch-on-surface-variant line-clamp-3">
          {summary}
        </p>
        <span
          aria-hidden="true"
          className="mt-4 inline-flex items-center gap-2 font-stitch-label text-stitch-label-sm uppercase tracking-[0.24em] text-stitch-secondary group-hover:tracking-[0.28em] transition-[letter-spacing]"
        >
          Abrir verbete →
        </span>
      </Link>
    </li>
  );
};

const HighlightedText: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-stitch-secondary/20 text-inherit rounded px-0.5">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
};

export default GlossaryPage;
