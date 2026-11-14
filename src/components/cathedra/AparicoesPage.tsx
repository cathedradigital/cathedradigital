import { Button } from '@/components/ui/button';
import React, { useMemo, useState } from 'react';
import { Icons } from '../../constants';
import { APPARITIONS, Apparition } from '@/data/apparitions';
import { useFavorites } from '@/hooks/useFavorites';
import { useSearchParams } from '@/lib/rr-compat';
import DeepContentSection from './DeepContentSection';
import { parseTheologicalReferences } from '@/lib/theologicalRefParser';
import BibleVersePopover from './BibleVersePopover';
import CatechismPopover from './CatechismPopover';
import { ReaderShell, EditorialHero } from '@/components/reader';
import EditorialClosure from '@/components/reader/EditorialClosure';
import ReaderContinuation from '@/components/shared/ReaderContinuation';
import { cn } from '@/lib/utils';

const AparicoesPage: React.FC = () => {
  const [selectedApparition, setSelectedApparition] = useState<Apparition | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const kindFilter = searchParams.get('tipo') || 'Todos';
  const countryFilter = searchParams.get('pais') || 'Todos';
  const normalizeSearch = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
  const updateFilter = (key: 'q' | 'tipo' | 'pais', value: string) => {
    const next = new URLSearchParams(searchParams);
    const trimmed = value.trim();
    if (trimmed && !((key === 'tipo' || key === 'pais') && trimmed === 'Todos')) next.set(key, trimmed);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };
  const clearFilters = () => setSearchParams({}, { replace: true });
  const filteredApparitions = useMemo(() => {
    const query = normalizeSearch(searchQuery);
    return APPARITIONS.filter(apparition => {
      const matchesKind = kindFilter === 'Todos' || (kindFilter === 'Aparições' && apparition.kind === 'apparition') || (kindFilter === 'Devoções' && apparition.kind === 'image-devotion');
      const matchesCountry = countryFilter === 'Todos' || apparition.country === countryFilter;
      const searchableFields = [
        apparition.title,
        apparition.location,
        apparition.country,
        apparition.year.toString(),
        apparition.date,
        apparition.seer,
        apparition.seerStory,
        apparition.summary,
        apparition.fullStory,
        apparition.message,
        apparition.liturgicalFeast,
        apparition.ecclesialAssessment.label,
        apparition.ecclesialAssessment.detail,
        apparition.ecclesialAssessment.authority,
        apparition.ecclesialAssessment.date,
        apparition.ecclesialAssessment.sourceLabel,
      ];
      const matchesQuery = !query || searchableFields.some(value => normalizeSearch(value).includes(query));
      return matchesKind && matchesCountry && matchesQuery;
    });
  }, [countryFilter, kindFilter, searchQuery]);

  const handleToggleFavorite = (apparition: Apparition, e?: React.MouseEvent) => {
    e?.stopPropagation();
    toggleFavorite({
      type: 'aparicao',
      title: apparition.title,
      content: apparition.summary,
    });
  };

  if (selectedApparition) {
    const isFav = isFavorite('aparicao', selectedApparition.title);
    
    return (
      <ReaderShell
        ariaLabel={`Registro mariano — ${selectedApparition.title}`}
        hero={
          <EditorialHero
            kicker={`${selectedApparition.country} · ${selectedApparition.year}`}
            title={selectedApparition.title}
            subtitle={selectedApparition.location}
            meta={selectedApparition.ecclesialAssessment.label}
            rule
          />
        }
        continuation={
          <div className="space-y-spacing-xl">
            <EditorialClosure
              reflection={selectedApparition.reflexaoFinal}
              application={selectedApparition.aplicacaoPratica}
              prayer={selectedApparition.message}
              next={{
                label: "Voltar às Aparições",
                href: "/aparicoes",
                kicker: "Catálogo"
              }}
            />
            <ReaderContinuation
              context={{
                kind: 'glossary-term', // Usando glossário como fallback de estilo
                id: selectedApparition.id,
              }}
            />
          </div>
        }
      >
        <div className="w-full space-y-spacing-2xl">
          {/* Ações Rápidas */}
          <div className="flex items-center justify-between border-b border-border pb-spacing-md">
            <Button 
              variant="ghost"
              onClick={() => setSelectedApparition(null)} 
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <Icons.ChevronLeft className="w-4 h-4" />
              <span>Voltar</span>
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleFavorite(selectedApparition)}
                className={cn(isFav && "text-primary border-primary/30 bg-primary/5")}
              >
                <Icons.Heart className={cn("w-4 h-4 mr-2", isFav && "fill-primary")} />
                {isFav ? "Favorito" : "Salvar"}
              </Button>
            </div>
          </div>

          {/* Seção 1: A História */}
          <section className="space-y-spacing-md">
            <header className="flex items-center gap-3 text-secondary/80">
              <Icons.Book className="w-4 h-4" />
              <span className="text-xs uppercase tracking-[0.2em] font-bold">A Aparição</span>
            </header>
            <div className="font-serif text-foreground/90 leading-[1.8] text-premium-base space-y-4">
              {parseTheologicalReferences(selectedApparition.fullStory).map((seg, i) => {
                if (seg.type === 'bibleRef') return <BibleVersePopover key={i} abbr={seg.abbr!} chapter={seg.chapter!} verse={seg.verse} label={seg.value} />;
                if (seg.type === 'catechismRef') return <CatechismPopover key={i} paragraph={seg.paragraph!} />;
                return <span key={i}>{seg.value}</span>;
              })}
            </div>
          </section>

          {/* Seção 2: O Vidente */}
          <section className="space-y-spacing-md">
            <header className="flex items-center gap-3 text-secondary/80">
              <Icons.Users className="w-4 h-4" />
              <span className="text-xs uppercase tracking-[0.2em] font-bold">Testemunho</span>
            </header>
            <h3 className="text-xl font-bold font-serif">{selectedApparition.seer}</h3>
            <div className="font-serif text-foreground/90 leading-[1.8] text-premium-base">
              {parseTheologicalReferences(selectedApparition.seerStory).map((seg, i) => {
                if (seg.type === 'bibleRef') return <BibleVersePopover key={i} abbr={seg.abbr!} chapter={seg.chapter!} verse={seg.verse} label={seg.value} />;
                if (seg.type === 'catechismRef') return <CatechismPopover key={i} paragraph={seg.paragraph!} />;
                return <span key={i}>{seg.value}</span>;
              })}
            </div>
          </section>

          {/* Seção 3: A Mensagem (Destaque) */}
          <section className="bg-primary/5 border border-primary/10 rounded-premium p-spacing-xl space-y-spacing-md">
             <header className="flex items-center gap-3 text-primary">
              <Icons.Flame className="w-4 h-4" />
              <span className="text-xs uppercase tracking-[0.2em] font-bold">A Mensagem</span>
            </header>
            <blockquote className="font-serif italic text-foreground leading-[1.8] text-premium-lg border-l-2 border-primary/30 pl-6">
              {parseTheologicalReferences(selectedApparition.message).map((seg, i) => {
                if (seg.type === 'bibleRef') return <BibleVersePopover key={i} abbr={seg.abbr!} chapter={seg.chapter!} verse={seg.verse} label={seg.value} />;
                if (seg.type === 'catechismRef') return <CatechismPopover key={i} paragraph={seg.paragraph!} />;
                return <span key={i}>{seg.value}</span>;
              })}
            </blockquote>
          </section>

          {/* Avaliação eclesial e fonte documental */}
          <section className="rounded-premium border border-border bg-card p-spacing-lg space-y-3">
            <h3 className="font-serif text-lg font-bold text-foreground">Avaliação eclesial e documentação</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{selectedApparition.ecclesialAssessment.detail}</p>
            <div className="text-xs text-muted-foreground">
              <p><strong>Autoridade:</strong> {selectedApparition.ecclesialAssessment.authority}</p>
              <p><strong>Data:</strong> {selectedApparition.ecclesialAssessment.date}</p>
            </div>
            <a href={selectedApparition.ecclesialAssessment.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex text-sm font-semibold text-primary underline underline-offset-4">
              {selectedApparition.ecclesialAssessment.sourceLabel}
            </a>
          </section>


          {/* Aprofundamento documental */}
          <section className="rounded-premium border border-border bg-card p-spacing-lg space-y-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-foreground">Aprofundamento</h3>
              <p className="text-sm leading-relaxed text-muted-foreground mt-1">Fontes selecionadas para continuar a leitura deste registro.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedApparition.recommendedSources.map((source) => (
                <a
                  key={source.url}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-premium border border-border/70 p-4 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">{source.sourceType || 'Fonte'}</span>
                  <span className="mt-1 block font-serif font-bold text-foreground group-hover:text-primary">{source.label}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{source.why}</span>
                </a>
              ))}
            </div>
          </section>

          {/* Seção 4: Profundidade Teológica */}
          {selectedApparition.textoBase && (
            <section className="pt-spacing-lg border-t border-border">
              <DeepContentSection 
                content={{
                  textoBase: selectedApparition.textoBase,
                  explicacao: selectedApparition.explicacao || '',
                  interpretacaoProfunda: selectedApparition.interpretacaoProfunda || '',
                  aplicacaoPratica: selectedApparition.aplicacaoPratica || '',
                  reflexaoFinal: selectedApparition.reflexaoFinal || '',
                  exercicio: selectedApparition.exercicio || ''
                }} 
                contentType="apparition"
                title="Mistério e Significado" 
              />
            </section>
          )}
        </div>
      </ReaderShell>
    );
  }

  // Overview
  return (
    <ReaderShell
      ariaLabel="Aparições e devoções marianas"
      hero={
        <EditorialHero
          kicker="Patrimônio da Fé"
          title="Aparições e devoções marianas"
          subtitle="Relatos de aparições, devoções a imagens e fenômenos associados, com avaliação eclesial e fontes apresentadas individualmente."
          rule
        />
      }
    >
      <div className="w-full space-y-spacing-2xl">
        {/* Timeline intro */}
        <div className="flex items-center justify-center gap-spacing-md md:gap-spacing-xl flex-wrap py-spacing-md border-y border-border/50">
          {APPARITIONS.map((a) => (
            <button 
              key={a.id}
              onClick={() => setSelectedApparition(a)}
              className="flex flex-col items-center gap-spacing-2xs group transition-all"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-all">
                <img src={a.imageSrc} alt={a.title} className="w-full h-full object-cover" />
              </div>
              <span className="text-[10px] font-black text-primary uppercase tracking-tighter">{a.year}</span>
            </button>
          ))}
        </div>

        {/* Search and filters */}
        <div className="space-y-spacing-sm" aria-label="Filtros de aparições e devoções">
          <div className="max-w-spacing-md mx-auto relative">
            <Icons.Search className="absolute left-spacing-md top-1/2 -translate-y-1/2 w-spacing-md h-spacing-md text-muted-foreground" aria-hidden="true" />
            <label htmlFor="apparitions-search" className="sr-only">Buscar nas aparições e devoções</label>
            <input
              id="apparitions-search"
              type="search"
              value={searchQuery}
              onChange={event => updateFilter('q', event.target.value)}
              placeholder="Buscar por nome, lugar, vidente ou mensagem..."
              aria-describedby="apparitions-search-help"
              className="w-full pl-spacing-xl pr-spacing-md py-spacing-sm rounded-premium-full border border-border bg-card text-foreground text-premium-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <p id="apparitions-search-help" className="sr-only">A busca considera nome, lugar, país, datas, vidente, relatos, mensagem e documentação da avaliação eclesial.</p>
          </div>
          <div className="flex items-center justify-center gap-spacing-xs flex-wrap">
            {['Todos', 'Aparições', 'Devoções'].map(option => (
              <Button key={option} type="button" variant={kindFilter === option ? 'default' : 'outline'} aria-pressed={kindFilter === option} onClick={() => updateFilter('tipo', option)} className="rounded-premium-full text-premium-xs">
                {option}
              </Button>
            ))}
            <label className="sr-only" htmlFor="apparitions-country">Filtrar por país</label>
            <select id="apparitions-country" value={countryFilter} onChange={event => updateFilter('pais', event.target.value)} className="rounded-premium-full border border-border bg-card px-spacing-sm py-spacing-xs text-premium-xs text-foreground">
              {['Todos', ...Array.from(new Set(APPARITIONS.map(apparition => apparition.country)))].map(country => <option key={country}>{country}</option>)}
            </select>
            {(searchQuery || kindFilter !== 'Todos' || countryFilter !== 'Todos') && <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>Limpar filtros</Button>}
          </div>
          <p className="text-center text-premium-xs uppercase tracking-widest text-muted-foreground" aria-live="polite">{filteredApparitions.length} {filteredApparitions.length === 1 ? 'registro' : 'registros'}</p>
        </div>

        {/* Grid de Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-spacing-lg">
          {filteredApparitions.map((apparition) => {
            const isFav = isFavorite('aparicao', apparition.title);
            return (
              <div
                key={apparition.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedApparition(apparition)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedApparition(apparition); } }}
                className="group relative flex flex-col bg-card border border-border rounded-premium overflow-hidden hover:border-primary/40 transition-all cursor-pointer shadow-sm hover:shadow-md"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img src={apparition.imageSrc} alt={apparition.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                  <div className="absolute bottom-4 left-4 right-4">
                     <span className="text-[10px] font-black text-white/90 uppercase tracking-[0.2em]">{apparition.country} · {apparition.year} · {apparition.kind === "image-devotion" ? "Devoção à imagem" : apparition.kind === "associated-phenomenon" ? "Fenômeno associado" : "Aparição"}</span>
                     <h3 className="text-xl font-serif font-bold text-white mt-1 leading-tight">{apparition.title}</h3>
                  </div>
                </div>
                
                <div className="p-spacing-lg flex flex-col flex-1 gap-spacing-md">
                  <p className="text-premium-sm text-muted-foreground line-clamp-2 leading-relaxed italic">
                    {apparition.summary}
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between pt-spacing-sm border-t border-border/50">
                    <div className="flex items-center gap-2 text-primary">
                      <Icons.Flame className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Aprofundar</span>
                    </div>
                    {isFav && <Icons.Heart className="w-4 h-4 text-primary fill-primary" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {filteredApparitions.length === 0 && (
          <div role="status" className="rounded-premium border border-dashed border-border bg-card px-spacing-lg py-spacing-xl text-center">
            <Icons.Search className="mx-auto mb-spacing-sm h-spacing-lg w-spacing-lg text-muted-foreground" aria-hidden="true" />
            <h2 className="text-premium-lg font-serif font-bold text-foreground">Nenhum registro encontrado</h2>
            <p className="mt-spacing-xs text-premium-sm text-muted-foreground">Tente outro termo ou remova os filtros para ver o acervo completo.</p>
            <Button type="button" variant="outline" size="sm" className="mt-spacing-md" onClick={clearFilters}>Limpar filtros</Button>
          </div>
        )}

        {/* Fundamentação Doutrinária */}
        <div className="mt-spacing-2xl p-spacing-xl bg-card border border-border rounded-premium space-y-4 text-center">
          <Icons.Shield className="w-6 h-6 text-secondary mx-auto" />
          <h3 className="text-lg font-serif font-bold text-foreground">Revelação Privada e Fé Pública</h3>
          <p className="text-premium-sm text-muted-foreground leading-[1.8] max-w-2xl mx-auto italic">
            "A função delas não é completar a Revelação definitiva de Cristo, mas ajudar a vivê-la mais plenamente em determinada época da história" (CIC §67). Os registros distinguem aparições, tradições e devoções, com a documentação e a avaliação eclesial indicadas caso a caso. Revelações privadas não pertencem ao depósito da fé.
          </p>
        </div>
        <p className="mx-auto max-w-3xl text-center text-xs leading-relaxed text-muted-foreground">As Normas do Dicastério para a Doutrina da Fé, em vigor desde 19 de maio de 2024, esclarecem que um <em>Nihil obstat</em> não declara a autenticidade sobrenatural do fenômeno. <a href="https://press.vatican.va/content/salastampa/en/bollettino/pubblico/2024/05/17/240517h.html" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Consultar as Normas de 2024</a>.</p>
      </div>
    </ReaderShell>
  );
};

export default AparicoesPage;
