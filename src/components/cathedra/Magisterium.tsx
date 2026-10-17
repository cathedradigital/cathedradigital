import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '@/constants';
import SEOHead from '@/components/SEOHead';
import { supabase } from '@/lib/db';
import { useAuth } from '@/hooks/useAuth';
import SacredImage from './SacredImage';
import DeepContentSection from './DeepContentSection';
import { toast } from 'sonner';
import { parseTheologicalReferences } from '@/lib/theologicalRefParser';
import Relatio from './Relatio';
import BibleVersePopover from './BibleVersePopover';
import CatechismPopover from './CatechismPopover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

/**
 * Bolha ancorada no clique — reproduz o comportamento anterior das “bolhas”:
 * abre no elemento clicado, fecha ao clicar fora ou após 1.6s (feedback rápido).
 * Mantém a ação original do trigger intacta (Radix não bloqueia o onClick do filho).
 */
const BubbleHint: React.FC<{
  children: React.ReactElement;
  label: React.ReactNode;
  kind: string;
}> = ({ children, label, kind }) => {
  const [open, setOpen] = React.useState(false);
  const timerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!open) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setOpen(false), 1600);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [open, label]);

  // Fecha ao mover o foco para fora do trigger (Tab / Shift+Tab)
  // sem deixar conteúdo órfão no DOM.
  const childOnBlur = (children.props as { onBlur?: React.FocusEventHandler }).onBlur;
  const enhancedChild = React.cloneElement(children as React.ReactElement<{ onBlur?: React.FocusEventHandler }>, {
    onBlur: (e: React.FocusEvent) => {
      childOnBlur?.(e);
      setOpen(false);
    },
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{enhancedChild}</PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        role="status"
        data-tip-kind={kind}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-auto max-w-xs rounded-premium-lg px-spacing-sm py-spacing-2xs text-premium-xs font-medium"
      >
        {label}
      </PopoverContent>
    </Popover>
  );
};
import AudioButton from './AudioButton';
import { useNavigate, useSearchParams, Link } from '@/lib/rr-compat';
import { getTabProps, getTabPanelProps, useTabNavigation } from './TabUtils';
import { useReadingMarks } from '@/hooks/useReadingMarks';
import ReadingControlPanel from './ReadingControlPanel';
import { useAutoFocus } from '@/hooks/useAutoFocus';
import { useRenderPerf } from '@/hooks/useRenderPerf';
import ContemplativeLayout from './ContemplativeLayout';
import { EditorialHero } from '@/components/editorial';
import ReadingMark from './ReadingMark';
import { CathedraCard } from './CathedraCard';
import { cn } from '@/lib/utils';
import { MobileTopBar } from '@/components/mobile/MobileTopBar';
import {
  MAGISTERIUM_DOCUMENTS,
  MAGISTERIUM_CATEGORIES,
  MAGISTERIUM_THEMES,
  MAGISTERIUM_TYPES,
  type MagisteriumDocument,
} from '@/data/magisterium-urls';
import {
  filterAndSortDocuments,
  highlightSegments,
  mergeFilterParams,
  paginate,
  searchParamsToState,
  MAGISTERIUM_PAGE_SIZE,
  MAGISTERIUM_PERIODS,
  type MagisteriumSort,
} from '@/lib/magisteriumFilters';

const SPIRITUAL_GUIDANCE = [
  {
    id: 'ansiedade',
    theme: 'Ansiedade',
    icon: <Icons.Activity className="w-spacing-md h-spacing-md" />,
    question: 'O que a Igreja diz sobre a ansiedade?',
    magisteriumAnswer: 'A confiança em Deus é o caminho da paz interior. "Não andeis ansiosos" não é um comando vazio — é um convite a entregar o peso ao único que pode carregá-lo.',
    sourceDoc: 'Gaudete et Exsultate §112',
    textoBase: 'Lançai sobre Ele todas as vossas preocupações, porque Ele cuida de vós. (1 Pe 5,7)',
    explicacao: 'A Igreja nos ensina que a ansiedade muitas vezes nasce da ilusão de que temos o controle total sobre nossas vidas. Confiar em Deus não é passividade, mas a sabedoria de fazer a nossa parte e deixar o resultado nas mãos de quem nos ama infinitamente.',
    interpretacaoProfunda: 'No Magistério, a paz não é apenas ausência de problemas, mas a presença de uma Certeza. O Papa Francisco em Gaudete et Exsultate nos lembra que a alegria cristã é acompanhada pelo senso de humor e pela confiança absoluta na Providência Divina.',
    aplicacaoPratica: 'Quando a ansiedade bater, pare por 30 segundos. Respire fundo e diga: "Jesus, eu confio em Vós". Repita isso até que seu coração sinta que o peso não é mais só seu.',
    reflexaoFinal: 'O que aconteceria se eu realmente acreditasse que Deus cuida de mim mais do que eu mesmo?',
    exercicio: 'Escreva em um papel tudo o que te preocupa hoje. Dobre o papel e coloque-o sob um crucifixo ou uma imagem de Maria, simbolizando que você entregou essas questões a Deus.',
    padh: '"Ansiedade é tentar prever…\no que só pode ser vivido."',
    innerQuestion: 'O que você está tentando resolver sem confiar?',
    relatedDocs: ['ge', 'ss', 'gs'],
  },
  {
    id: 'medo',
    theme: 'Medo',
    icon: <Icons.Sun className="w-spacing-md h-spacing-md" />,
    question: 'O que a Igreja diz sobre o medo?',
    magisteriumAnswer: 'O medo é humano, mas não deve governar. A presença de Deus é mais forte que qualquer escuridão. "Não temas, porque eu te resgatei."',
    sourceDoc: 'Spe Salvi §32',
    textoBase: 'Não temas, porque eu estou contigo; não te assustes, porque eu sou o teu Deus; eu te fortaleço, e te ajudo, e te sustento com a minha destra fiel. (Is 41,10)',
    explicacao: 'O medo é uma reação natural diante do desconhecido, mas na vida espiritual ele pode se tornar uma prisão. A Igreja nos recorda que o antídoto para o medo não é a coragem cega, mas a presença. Saber que não estamos sozinhos muda a perspectiva do perigo.',
    interpretacaoProfunda: 'Bento XVI em Spe Salvi ensina que a esperança cristã não é uma ideia, mas uma Pessoa. O medo perde seu poder quando encontramos a "Esperança que não decepciona". O Magistério destaca que o "Não Temas" de Jesus é o fundamento da liberdade cristã.',
    aplicacaoPratica: 'Identifique o seu maior medo hoje. Visualize-se entregando esse medo nas mãos de Jesus. Sinta o peso saindo dos seus ombros enquanto você repete: "O Senhor é minha luz e minha salvação, a quem temerei?"',
    reflexaoFinal: 'O que eu faria hoje se soubesse que Deus está segurando minha mão direita?',
    exercicio: 'Vá a uma igreja ou um lugar silencioso. Feche os olhos e respire a paz de Deus. Peça a graça de ver o mundo não através do medo, mas através da Providência.',
    padh: '"O medo cresce…\nonde a presença é esquecida."',
    innerQuestion: 'Onde você se sente sozinho diante do medo?',
    relatedDocs: ['ss', 'dce', 'lf'],
  },
  {
    id: 'proposito',
    theme: 'Propósito',
    icon: <Icons.Compass className="w-spacing-md h-spacing-md" />,
    question: 'Qual é o sentido da minha vida?',
    magisteriumAnswer: 'Cada pessoa tem uma vocação única. A santidade não é privilégio de poucos, mas chamado universal — é encontrar Deus no concreto da vida.',
    sourceDoc: 'Gaudete et Exsultate §14',
    textoBase: 'Antes de te formar no ventre materno, eu te conheci; antes de saíres do seio materno, eu te consagrei. (Jr 1,5)',
    explicacao: 'Encontrar o propósito não é descobrir um segredo escondido, mas responder a um chamado de amor. O Magistério ensina que nossa vocação fundamental é a santidade — ser a melhor versão de quem Deus nos criou para ser, servindo aos outros com nossos dons únicos.',
    interpretacaoProfunda: 'Gaudete et Exsultate nos mostra que a santidade "ao lado" (dos vizinhos, dos pais) é o verdadeiro propósito. Não precisamos de grandes feitos heroicos, mas de um grande amor nas pequenas coisas. O sentido da vida é tornar-se um dom.',
    aplicacaoPratica: 'Liste três coisas que você faz bem e que trazem alegria aos outros. Como você pode usar um desses talentos hoje para glorificar a Deus no seu trabalho ou na sua família?',
    reflexaoFinal: 'Se a minha vida fosse um livro escrito por Deus, qual seria o título do capítulo que estou vivendo agora?',
    exercicio: 'Durante o dia, em cada tarefa simples, diga: "Senhor, faço isso por Ti". Transforme o ordinário em oração e veja como o propósito brota da intenção.',
    padh: '"Força não é ausência de fraqueza…\né direção apesar dela."',
    innerQuestion: 'O que ainda te move quando tudo pesa?',
    relatedDocs: ['ge', 'lg', 'cv'],
  },
  {
    id: 'sofrimento',
    theme: 'Sofrimento',
    icon: <Icons.Cross className="w-spacing-md h-spacing-md" />,
    question: 'Por que existe sofrimento?',
    magisteriumAnswer: 'O sofrimento, quando unido à cruz de Cristo, tem poder redentor. Não é castigo, mas mistério de amor e transformação.',
    sourceDoc: 'Salvifici Doloris §19',
    textoBase: 'Completo na minha carne o que falta às tribulações de Cristo, pelo seu corpo, que é a Igreja. (Col 1,24)',
    explicacao: 'O sofrimento é o mistério mais profundo da existência humana. A Igreja não oferece uma explicação lógica, mas uma Presença na Cruz. O sofrimento não é um beco sem saída, mas uma ponte para uma intimidade maior com o Redentor.',
    interpretacaoProfunda: 'João Paulo II, em Salvifici Doloris, revela que o sofrimento liberta o amor. Ao sofrer com paciência e oferecimento, participamos da obra da salvação. O Magistério nos ensina que a dor transfigurada pela fé torna-se fonte de consolação para os outros.',
    aplicacaoPratica: 'Se você está sofrendo hoje, não tente entender o "porquê". Tente viver o "com quem". Ofereça sua dor por uma intenção específica (alguém doente, uma causa nobre). Isso dá um sentido sobrenatural à sua cruz.',
    reflexaoFinal: 'Eu permito que Deus me console na minha dor, ou me fecho na amargura?',
    exercicio: 'Contemple uma imagem do Cristo Crucificado por 5 minutos. Não diga nada. Apenas deixe que o olhar de Jesus encontre a sua dor e a acolha.',
    padh: '"A dor não veio destruir…\nveio revelar o que ainda é frágil."',
    innerQuestion: 'O que o sofrimento está tentando te ensinar?',
    relatedDocs: ['ss', 'ev', 'gs', 'sd'],
  },
  {
    id: 'relacionamentos',
    theme: 'Relacionamentos',
    icon: <Icons.Heart className="w-spacing-md h-spacing-md" />,
    question: 'Como amar de verdade?',
    magisteriumAnswer: 'O amor autêntico é dom de si mesmo. Não é posse, é entrega. A família é escola de amor e comunhão.',
    sourceDoc: 'Amoris Laetitia §89',
    textoBase: 'Nisto todos conhecerão que sois meus discípulos: se vos amardes uns aos outros. (Jo 13,35)',
    explicacao: 'Relacionamentos são o laboratório da santidade. Amar quem é difícil, perdoar setenta vezes sete, servir sem esperar retorno — este é o caminho cristão. A Igreja ensina que a comunhão humana é um reflexo da comunhão da Santíssima Trindade.',
    interpretacaoProfunda: 'Amoris Laetitia nos lembra que a perfeição não existe nas famílias, mas a misericórdia sim. O Magistério enfatiza que o diálogo, a paciência e a ternura são as ferramentas para construir vínculos eternos que resistem às tempestades do egoísmo.',
    aplicacaoPratica: 'Escolha uma pessoa com quem você tem dificuldade de se relacionar. Reze por ela hoje e, se possível, faça um pequeno gesto de gentileza sem que ela perceba.',
    reflexaoFinal: 'O meu jeito de amar atrai as pessoas para Deus ou as afasta?',
    exercicio: 'Pratique a "escuta profunda". Na próxima conversa, não pense na resposta enquanto o outro fala. Apenas acolha as palavras dele como um dom. Amar é, antes de tudo, dar atenção.',
    padh: '"Amar não é completar o outro…\né caminhar junto sem exigir destino."',
    innerQuestion: 'Você está amando ou controlando?',
    relatedDocs: ['al', 'dce', 'hv'],
  },
];

/**
 * Ordem canônica das categorias (menor `order` = maior autoridade).
 * Fonte: `MAGISTERIUM_CATEGORIES` em `src/data/magisterium-urls.ts`.
 */
const CATEGORY_ORDER: Record<string, number> = MAGISTERIUM_CATEGORIES.reduce(
  (acc, cat) => ({ ...acc, [cat.name]: cat.order }),
  {} as Record<string, number>,
);

const MAGISTERIUM_AUTHORS = Array.from(new Set(MAGISTERIUM_DOCUMENTS.map((doc) => doc.author)))
  .sort((a, b) => a.localeCompare(b, 'pt-BR'));
const MAGISTERIUM_PONTIFICATES = Array.from(
  new Set(MAGISTERIUM_DOCUMENTS.map((doc) => doc.pontificate).filter((value): value is string => Boolean(value))),
).sort((a, b) => a.localeCompare(b, 'pt-BR'));
const MAGISTERIUM_YEARS = Array.from(new Set(MAGISTERIUM_DOCUMENTS.map((doc) => doc.year)))
  .sort((a, b) => b - a);

/** Renderiza um texto com trechos que casam a query destacados no card. */
const renderHighlighted = (text: string, query: string): React.ReactNode =>
  highlightSegments(text, query).map((seg, i) =>
    seg.match ? (
      <mark key={i} className="bg-secondary/25 text-inherit rounded-[2px] px-[1px]">
        {seg.text}
      </mark>
    ) : (
      <React.Fragment key={i}>{seg.text}</React.Fragment>
    ),
  );



const Magisterium: React.FC = () => {
  useRenderPerf('Magisterium', 15);
  const navigate = useNavigate();
  useAutoFocus();
  const { handleKeyDown: handleTabKeyDown } = useTabNavigation();
  const { saveLastRead, getLastRead } = useReadingMarks();
  const [searchParams, setSearchParams] = useSearchParams();

  // A URL é a única fonte de verdade dos filtros. Derivamos o state a cada
  // render — assim back/forward, deep-links e edições internas sempre coincidem.
  const urlFilterState = useMemo(() => searchParamsToState(searchParams), [searchParams]);
  const {
    search: searchQuery, category: selectedCategory, type: selectedType,
    author: selectedAuthor, pontificate: selectedPontificate, period: selectedPeriod,
    year: selectedYear, themes: selectedThemes, sort: sortBy, page,
  } = urlFilterState;

  // Setter unificado — escreve no `searchParams` preservando `topic`/`doc`.
  const updateFilters = useCallback(
    (
      patch: Partial<typeof urlFilterState>,
      opts: { push?: boolean } = {},
    ) => {
      const next = { ...urlFilterState, ...patch };
      const merged = mergeFilterParams(searchParams, {
        search: next.search,
        category: next.category,
        type: next.type,
        author: next.author,
        pontificate: next.pontificate,
        period: next.period,
        year: next.year,
        themes: next.themes,
        sort: next.sort,
        page: next.page,
      });
      if (merged.toString() !== searchParams.toString()) {
        setSearchParams(merged, { replace: !opts.push });
      }
    },
    [urlFilterState, searchParams, setSearchParams],
  );

  const setSearchQuery = useCallback(
    (q: string) => updateFilters({ search: q, page: 1 }),
    [updateFilters],
  );
  const setSelectedCategory = useCallback(
    (c: string | null) => updateFilters({ category: c, page: 1 }),
    [updateFilters],
  );
  const setSortBy = useCallback(
    (updater: MagisteriumSort | ((prev: MagisteriumSort) => MagisteriumSort)) => {
      const nextSort =
        typeof updater === 'function' ? (updater as (p: MagisteriumSort) => MagisteriumSort)(sortBy) : updater;
      updateFilters({ sort: nextSort, page: 1 });
    },
    [sortBy, updateFilters],
  );
  const setPage = useCallback(
    (updater: number | ((prev: number) => number)) => {
      const nextPage = typeof updater === 'function' ? (updater as (p: number) => number)(page) : updater;
      updateFilters({ page: nextPage }, { push: true });
    },
    [page, updateFilters],
  );
  const [lastReadMark, setLastReadMark] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('guidance');
  
  
  const [selectedGuidance, setSelectedGuidance] = useState(SPIRITUAL_GUIDANCE[0]);
  const activeGuidanceIndex = SPIRITUAL_GUIDANCE.findIndex(g => g.id === selectedGuidance.id);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [shouldAutoResume, setShouldAutoResume] = useState(() => {
    const topic = new URLSearchParams(window.location.search).get('topic');
    const doc = new URLSearchParams(window.location.search).get('doc');
    return !(topic || doc);
  });

  useEffect(() => {
    const topicParam = new URLSearchParams(window.location.search).get('topic');
    const docParam = new URLSearchParams(window.location.search).get('doc');

    if (topicParam || docParam) {
      if (topicParam) {
        const found = SPIRITUAL_GUIDANCE.find(g => g.id === topicParam);
        if (found) setSelectedGuidance(found);
      }
      return;
    }

    const fetchLastRead = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (!user) return;

      const { data } = await supabase
        .from('reading_marks')
        .select('*')
        .eq('user_id', user.id)
        .eq('content_type', 'magisterium')
        .eq('is_last_read', true)
        .maybeSingle();

      if (data) {
        setLastReadMark(data);
        if (shouldAutoResume && data.content_id) {
          const found = SPIRITUAL_GUIDANCE.find(g => g.id === data.content_id);
          if (found) {
            setSelectedGuidance(found);
            toast.info(`Retornando ao tema: ${found.theme}`, {
              description: 'Sua leitura foi retomada de onde você parou.',
              duration: 3000
            });
          }
        }
      }
      setShouldAutoResume(false);
    };
    fetchLastRead();
  }, [shouldAutoResume]);

  const MemoizedRelatio = useMemo(() => {
    if (activeTab !== 'guidance' || !selectedGuidance) return null;
    return (
      <Relatio 
        context={{ 
          type: 'magisterium', 
          id: selectedGuidance.id,
          tags: [selectedGuidance.theme, 'Magistério']
        }}
        onNavigateToBible={(abbr, ch) => navigate(`/bible?book=${abbr}&ch=${ch}`)}
        onNavigateToCIC={(p) => navigate(`/catechism?p=${p}`)}
        onSelectLogosQuery={(prompt) => {
          // In this view we don't have the drawer integrated directly as state
          // but we can navigate with a prompt if needed or just show a toast for now
          // Actually, let's just use the toast or a custom event
          window.dispatchEvent(new CustomEvent('open-logos-ai', { detail: { prompt, context: selectedGuidance.theme } }));
        }}
      />
    );
  }, [activeTab, selectedGuidance, navigate]);

  const filteredDocs = useMemo<MagisteriumDocument[]>(
    () =>
      filterAndSortDocuments(
        MAGISTERIUM_DOCUMENTS,
        { search: searchQuery, category: selectedCategory, type: selectedType, author: selectedAuthor, pontificate: selectedPontificate, period: selectedPeriod, year: selectedYear, themes: selectedThemes, sort: sortBy, page },
        CATEGORY_ORDER,
      ),
    [searchQuery, selectedCategory, selectedType, selectedAuthor, selectedPontificate, selectedPeriod, selectedYear, selectedThemes, sortBy, page],
  );

  // Página corrente (com clamp) + fatia visível.
  const pagination = useMemo(
    () => paginate(filteredDocs, page, MAGISTERIUM_PAGE_SIZE),
    [filteredDocs, page],
  );
  const visibleDocs = pagination.items;

  // ---------------------------------------------------------------------------
  // STAB-004.1 · Agrupamento visual opcional (sem alterar filtros/paginação).
  // `?group=category` agrupa por categoria; `?group=pope` agrupa por autor.
  // Ausente = agrupamento por categoria, deixando a hierarquia editorial visível. Nada é gravado em outro state.
  // ---------------------------------------------------------------------------
  const groupBy: 'category' | 'pope' | null = (() => {
    const g = searchParams.get('group');
    return g === 'category' || g === 'pope' ? g : 'category';
  })();

  const setGroupBy = useCallback(
    (next: 'category' | 'pope' | null) => {
      const nextParams = new URLSearchParams(searchParams);
      if (next) nextParams.set('group', next);
      else nextParams.delete('group');
      if (nextParams.toString() !== searchParams.toString()) {
        setSearchParams(nextParams, { replace: true });
      }
    },
    [searchParams, setSearchParams],
  );

  const groupedDocs = useMemo(() => {
    if (!groupBy) return null;
    const buckets = new Map<string, MagisteriumDocument[]>();
    for (const d of visibleDocs) {
      const key = groupBy === 'pope' ? (d.author || '—') : (d.category || '—');
      const arr = buckets.get(key) ?? [];
      arr.push(d);
      buckets.set(key, arr);
    }
    const entries = Array.from(buckets.entries()).map(([key, docs]) => ({ key, docs }));
    if (groupBy === 'category') {
      entries.sort((a, b) => (CATEGORY_ORDER[a.key] ?? 999) - (CATEGORY_ORDER[b.key] ?? 999));
    } else {
      // Papas: ordena pelo documento mais antigo de cada grupo (cronológico).
      const firstDate = (docs: MagisteriumDocument[]) =>
        docs.reduce((min, d) => {
          const k = d.date ?? `${d.year}`;
          return k < min ? k : min;
        }, '9999');
      entries.sort((a, b) => firstDate(a.docs).localeCompare(firstDate(b.docs)));
    }
    return entries;
  }, [groupBy, visibleDocs]);

  // Ref para o cabeçalho da lista — recebe foco após scroll ao topo (a11y).
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);

  // Rola até o topo da página. Cobre `window`, `document.documentElement` e
  // `document.body` porque o layout usa scroll no `body` em alguns ambientes.
  const scrollToResultsTop = useCallback((focusHeading = false) => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (document.body) document.body.scrollTop = 0;
      if (document.documentElement) document.documentElement.scrollTop = 0;
    }
    if (focusHeading) {
      // Foca o cabeçalho da lista para leitores de tela (a11y).
      requestAnimationFrame(() => {
        resultsHeadingRef.current?.focus({ preventScroll: true });
      });
    }
  }, []);

  // Normaliza a URL: se `?page=` está fora do intervalo (clampado) ou inválido
  // (0, negativo, "abc"), reescreve para o valor efetivo.
  useEffect(() => {
    const rawUrlPage = searchParams.get('page');
    const normalizedNeeded =
      pagination.page !== page || (rawUrlPage !== null && Number(rawUrlPage) !== pagination.page);
    if (normalizedNeeded) updateFilters({ page: pagination.page });
  }, [pagination.page, page, searchParams, updateFilters]);


  // Detecta mudanças de filtro (não paginação) para rolar ao topo.
  const filtersKey = `${searchQuery}::${selectedCategory ?? ''}::${selectedType ?? ''}::${selectedAuthor ?? ''}::${selectedPontificate ?? ''}::${selectedPeriod ?? ''}::${selectedYear ?? ''}::${selectedThemes.join('|')}::${sortBy}`;
  const prevFiltersKey = useRef(filtersKey);
  useEffect(() => {
    if (prevFiltersKey.current !== filtersKey) {
      prevFiltersKey.current = filtersKey;
      scrollToResultsTop(false);
    }
  }, [filtersKey, scrollToResultsTop]);

  const toggleTheme = useCallback(
    (theme: string) => {
      const next = selectedThemes.includes(theme)
        ? selectedThemes.filter(t => t !== theme)
        : [...selectedThemes, theme];
      updateFilters({ themes: next, page: 1 });
      // Ao trocar tema, rola ao topo e foca o cabeçalho para leitores de tela.
      scrollToResultsTop(true);
    },
    [selectedThemes, updateFilters, scrollToResultsTop],
  );

  const clearFilters = useCallback(() => {
    updateFilters({
      search: '',
      themes: [],
      category: null,
      type: null,
      author: null,
      pontificate: null,
      period: null,
      year: null,
      sort: 'canonical',
      page: 1,
    });
  }, [updateFilters]);




  const handleSelectGuidance = (item: typeof SPIRITUAL_GUIDANCE[0]) => {
    if (selectedGuidance.id === item.id) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedGuidance(item);
      setIsTransitioning(false);
      
      // Auto-save progress
      saveLastRead({
        content_type: 'magisterium',
        content_id: item.id,
        label: `Guia: ${item.theme}`,
        url: `/magisterium?topic=${item.id}`
      });
    }, 300);
  };

  return (
    <ContemplativeLayout>
      <MobileTopBar kicker="Cátedra Digital" title="Documentos" transparent />
      <div data-catedra-module="documents" className="estudar-module-landing min-w-0 w-full overflow-x-hidden">
      <SEOHead 
        title="Magistério da Igreja | Cátedra Digital" 
        description="Acesse os documentos fundamentais da Igreja Católica em uma experiência premium." 
        path="/magisterium"
        type="collection"
      />
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Magistério da Igreja Católica",
          "description": "Coleção de encíclicas, constituições e documentos oficiais da Igreja.",
          "publisher": {
            "@type": "Organization",
            "name": "Cátedra Digital"
          }
        })}
      </script>

      <EditorialHero
        variant="legacy"
        align="center"
        size="sm"
        rule={false}
        className="header-margin-rhythm px-spacing-md md:px-spacing-xl"
        icon={
          <Icons.ScrollText
            className="w-spacing-md h-spacing-md md:w-spacing-xl md:h-spacing-xl text-primary/20 mx-auto transition-all duration-1000"
            strokeWidth={1.2}
            aria-hidden="true"
          />
        }
        kicker="Magisterium Ecclesiae"
        kickerClassName="text-[10px] md:text-xs font-semibold uppercase text-primary/75 tracking-[0.18em] md:tracking-[0.28em] mb-spacing-sm md:mb-spacing-md"
        title="Magistério"
        titleClassName="mb-spacing-md max-w-none"
      />

      <div className="w-full space-y-spacing-2xl pb-spacing-4xl" data-catedra-module-root data-catedra-module="documents">

        {/* Unified Search & Filters */}
        <div className="estudar-doc-filter-stack space-y-spacing-xl">
          <div className="relative group w-full">
            <div className="absolute inset-0 bg-primary/[0.01] blur-xl rounded-premium-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <Icons.Search className="absolute left-spacing-lg top-spacing-2xs/2 -translate-y-1/2 w-spacing-md h-spacing-md text-primary/20 group-focus-within:text-primary transition-all duration-700" />
            <input
              placeholder="Buscar documento, autor ou tema..." 
              aria-label="Buscar documentos do Magistério por título, autor ou tema"
              className="search-input-premium pl-spacing-3xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filtros estruturados: categoria/concílio, autor, pontificado, tipo, período e ano. */}
          <section aria-label="Filtros do acervo" className="grid grid-cols-1 gap-spacing-sm rounded-xl border border-primary/10 bg-primary/[0.025] p-spacing-md sm:grid-cols-2 lg:grid-cols-3">
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-foreground">
              <span>Categoria / concílio</span>
              <select aria-label="Filtrar por categoria ou concílio" value={selectedCategory ?? ''} onChange={(e) => setSelectedCategory(e.target.value || null)} className="min-h-11 w-full rounded-lg border border-primary/15 bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                <option value="">Todas as categorias</option>
                {MAGISTERIUM_CATEGORIES.map((cat) => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
              </select>
            </label>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-foreground">
              <span>Autor / organismo</span>
              <select aria-label="Filtrar por autor ou organismo" value={selectedAuthor ?? ''} onChange={(e) => updateFilters({ author: e.target.value || null, page: 1 })} className="min-h-11 w-full rounded-lg border border-primary/15 bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                <option value="">Todos os autores</option>
                {MAGISTERIUM_AUTHORS.map((author) => <option key={author} value={author}>{author}</option>)}
              </select>
            </label>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-foreground">
              <span>Pontificado</span>
              <select aria-label="Filtrar por pontificado" value={selectedPontificate ?? ''} onChange={(e) => updateFilters({ pontificate: e.target.value || null, page: 1 })} className="min-h-11 w-full rounded-lg border border-primary/15 bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                <option value="">Todos os pontificados</option>
                {MAGISTERIUM_PONTIFICATES.map((pontificate) => <option key={pontificate} value={pontificate}>{pontificate}</option>)}
              </select>
            </label>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-foreground">
              <span>Tipo de documento</span>
              <select aria-label="Filtrar por tipo de documento" value={selectedType ?? ''} onChange={(e) => updateFilters({ type: e.target.value || null, page: 1 })} className="min-h-11 w-full rounded-lg border border-primary/15 bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                <option value="">Todos os tipos</option>
                {MAGISTERIUM_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-foreground">
              <span>Período</span>
              <select aria-label="Filtrar por período histórico" value={selectedPeriod ?? ''} onChange={(e) => updateFilters({ period: e.target.value || null, page: 1 })} className="min-h-11 w-full rounded-lg border border-primary/15 bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                <option value="">Todos os períodos</option>
                {MAGISTERIUM_PERIODS.map((period) => <option key={period.value} value={period.value}>{period.label}</option>)}
              </select>
            </label>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-foreground">
              <span>Ano de publicação</span>
              <select aria-label="Filtrar por ano de publicação" value={selectedYear ?? ''} onChange={(e) => updateFilters({ year: e.target.value || null, page: 1 })} className="min-h-11 w-full rounded-lg border border-primary/15 bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                <option value="">Todos os anos</option>
                {MAGISTERIUM_YEARS.map((year) => <option key={year} value={String(year)}>{year}</option>)}
              </select>
            </label>
          </section>

          <details open={selectedThemes.length > 0} className="rounded-xl border border-primary/10 px-spacing-md py-spacing-sm">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
              <span>Temas de estudo</span>
              <span className="text-xs font-medium text-muted-foreground">{selectedThemes.length ? `${selectedThemes.length} selecionado(s)` : `${MAGISTERIUM_THEMES.length} temas disponíveis`}</span>
            </summary>
            <div className="mt-spacing-sm flex flex-wrap gap-2">
              {MAGISTERIUM_THEMES.map((theme) => {
                const active = selectedThemes.includes(theme);
                return <Button key={theme} type="button" variant={active ? 'default' : 'outline'} size="sm" aria-pressed={active} className="min-h-9 rounded-full px-3 text-xs font-medium tracking-normal" onClick={() => toggleTheme(theme)}>{theme}</Button>;
              })}
            </div>
          </details>

          {/* Ordenação + reset */}
          <div className="estudar-doc-sort-row flex flex-col items-stretch justify-between gap-spacing-sm sm:flex-row sm:items-center sm:gap-spacing-md">
            <div className="text-sm font-semibold text-foreground" aria-live="polite">
              {pagination.totalItems === 0 ? (
                <>0 documentos</>
              ) : (
                <>
                  {(pagination.page - 1) * pagination.pageSize + 1}
                  –
                  {(pagination.page - 1) * pagination.pageSize + pagination.items.length}
                  {' de '}
                  {pagination.totalItems}
                </>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* STAB-004.1: toggle de agrupamento visual (sem alterar filtros) */}
              <BubbleHint kind="group" label="Agrupar visualmente os documentos por categoria">
                <Button
                  variant="ghost"
                  size="sm"
                  aria-pressed={groupBy === 'category'}
                  onClick={() => setGroupBy(groupBy === 'category' ? null : 'category')}
                  className={cn(
                    'text-xs font-semibold tracking-normal text-primary/80 hover:text-primary',
                    groupBy === 'category' && 'bg-primary/10 text-primary',
                  )}
                >
                  <Icons.Layers className="w-spacing-sm h-spacing-sm mr-spacing-2xs" />
                  Por Categoria
                </Button>
              </BubbleHint>
              <BubbleHint kind="group" label="Agrupar visualmente os documentos por Papa">
                <Button
                  variant="ghost"
                  size="sm"
                  aria-pressed={groupBy === 'pope'}
                  onClick={() => setGroupBy(groupBy === 'pope' ? null : 'pope')}
                  className={cn(
                    'text-xs font-semibold tracking-normal text-primary/80 hover:text-primary',
                    groupBy === 'pope' && 'bg-primary/10 text-primary',
                  )}
                >
                  <Icons.User className="w-spacing-sm h-spacing-sm mr-spacing-2xs" />
                  Por Papa
                </Button>
              </BubbleHint>
              <BubbleHint kind="sort" label="Alternar ordenação (canônica → cronológica ↑ → cronológica ↓)">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setSortBy(prev =>
                      prev === 'canonical'
                        ? 'chronological-asc'
                        : prev === 'chronological-asc'
                          ? 'chronological-desc'
                          : 'canonical',
                    )
                  }
                  className="text-xs font-semibold tracking-normal text-primary/80 hover:text-primary"
                >
                  <Icons.ArrowDown
                    className={cn(
                      'w-spacing-sm h-spacing-sm mr-spacing-2xs transition-transform',
                      sortBy === 'chronological-desc' && 'rotate-180',
                    )}
                  />
                  {sortBy === 'canonical'
                    ? 'Ordem canônica'
                    : sortBy === 'chronological-asc'
                      ? 'Cronológica ↑'
                      : 'Cronológica ↓'}
                </Button>
              </BubbleHint>
            </div>
          </div>

          {/* Chips de filtros ativos (removíveis) */}
          {(selectedCategory || selectedType || selectedAuthor || selectedPontificate || selectedPeriod || selectedYear || selectedThemes.length > 0 || searchQuery) && (
            <div
              className="flex items-center flex-wrap gap-spacing-2xs pt-spacing-2xs"
              role="region"
              aria-label="Filtros ativos"
            >
              <span className="text-xs font-semibold text-primary/80 mr-spacing-2xs">
                Filtros ativos:
              </span>

              {searchQuery && (
                <BubbleHint kind="chip-search" label={`Remover busca “${searchQuery}”`}>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label={`Remover busca: ${searchQuery}`}
                    className="inline-flex min-h-9 items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium normal-case tracking-normal text-primary transition-colors hover:bg-primary/20"
                  >
                    <span className="normal-case tracking-normal">“{searchQuery}”</span>
                    <Icons.X className="w-spacing-xs h-spacing-xs" strokeWidth={2} />
                  </button>
                </BubbleHint>
              )}

              {selectedType && <button type="button" onClick={() => updateFilters({ type: null, page: 1 })} className="inline-flex min-h-9 items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs text-primary" aria-label={`Remover tipo: ${selectedType}`}>{selectedType}<Icons.X className="h-3 w-3" aria-hidden="true" /></button>}
              {selectedAuthor && <button type="button" onClick={() => updateFilters({ author: null, page: 1 })} className="inline-flex min-h-9 items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs text-primary" aria-label={`Remover autor: ${selectedAuthor}`}>{selectedAuthor}<Icons.X className="h-3 w-3" aria-hidden="true" /></button>}
              {selectedPontificate && <button type="button" onClick={() => updateFilters({ pontificate: null, page: 1 })} className="inline-flex min-h-9 items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs text-primary" aria-label={`Remover pontificado: ${selectedPontificate}`}>{selectedPontificate}<Icons.X className="h-3 w-3" aria-hidden="true" /></button>}
              {selectedPeriod && <button type="button" onClick={() => updateFilters({ period: null, page: 1 })} className="inline-flex min-h-9 items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs text-primary" aria-label={`Remover período: ${selectedPeriod}`}>{MAGISTERIUM_PERIODS.find((item) => item.value === selectedPeriod)?.label ?? selectedPeriod}<Icons.X className="h-3 w-3" aria-hidden="true" /></button>}
              {selectedYear && <button type="button" onClick={() => updateFilters({ year: null, page: 1 })} className="inline-flex min-h-9 items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs text-primary" aria-label={`Remover ano: ${selectedYear}`}>{selectedYear}<Icons.X className="h-3 w-3" aria-hidden="true" /></button>}
              {selectedCategory && (
                <BubbleHint kind="chip-category" label={`Remover categoria: ${selectedCategory}`}>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(null)}
                    aria-label={`Remover categoria: ${selectedCategory}`}
                    className="inline-flex min-h-9 items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-xs font-medium normal-case tracking-normal text-white transition-colors hover:bg-primary/80"
                  >
                    {selectedCategory}
                    <Icons.X className="w-spacing-xs h-spacing-xs" strokeWidth={2} />
                  </button>
                </BubbleHint>
              )}

              {selectedThemes.map(theme => (
                <BubbleHint key={theme} kind="chip-theme" label={`Remover tema: ${theme}`}>
                  <button
                    type="button"
                    onClick={() => toggleTheme(theme)}
                    aria-label={`Remover tema: ${theme}`}
                    className="inline-flex min-h-9 items-center gap-2 rounded-full bg-secondary/20 px-3 py-1.5 text-xs font-medium normal-case tracking-normal text-primary transition-colors hover:bg-secondary/30"
                  >
                    {theme}
                    <Icons.X className="w-spacing-xs h-spacing-xs" strokeWidth={2} />
                  </button>
                </BubbleHint>
              ))}

              <BubbleHint kind="chip-clear" label="Remover todos os filtros de uma vez">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex min-h-9 items-center gap-2 rounded-full border border-primary/20 px-3 py-1.5 text-xs font-medium normal-case tracking-normal text-primary/80 transition-colors hover:border-primary/40 hover:text-primary ml-spacing-xs"
                >
                  <Icons.XCircle className="w-spacing-xs h-spacing-xs" strokeWidth={1.5} />
                  Limpar tudo
                </button>
              </BubbleHint>
            </div>
          )}
        </div>




        {/* Cabeçalho da lista (focável para acessibilidade após scroll ao topo). */}
        <h2
          ref={resultsHeadingRef}
          tabIndex={-1}
          aria-label={`Documentos do Magistério (${pagination.totalItems})`}
          className="sr-only"
        >
          Documentos do Magistério
        </h2>

        {/* Documents Grid (plana ou agrupada — ver STAB-004.1) */}
        {(() => {
          const renderCard = (doc: MagisteriumDocument, idx: number) => (
            <Link
              key={doc.id}
              to={`/magisterium/${doc.id}`}
              className="block h-full rounded-premium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              aria-label={`Abrir ${doc.title}${doc.abbr ? ` (${doc.abbr})` : ''}`}
            >
              <CathedraCard
                variant="interactive"
                padding="none"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group h-full"
              >
                <div className="p-3 md:p-spacing-md flex flex-col gap-spacing-sm md:gap-spacing-md h-full min-w-0 text-left">
                  <div className="flex justify-between items-start">
                    <div className="w-spacing-xl h-spacing-xl rounded-premium bg-primary/[0.02] border border-primary/5 flex items-center justify-center text-primary/60 group-hover:text-primary transition-colors">
                      {doc.type === 'Encíclica' ? <Icons.Scroll className="w-spacing-md h-spacing-md" strokeWidth={1} /> : <Icons.FileText className="w-spacing-md h-spacing-md" strokeWidth={1} />}
                    </div>
                    <span className="rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-semibold text-secondary">{doc.year}</span>
                  </div>

                  <div className="space-y-spacing-xs flex-1">
                    <h3 className="text-[16px] md:text-premium-lg font-display font-light text-foreground/80 group-hover:text-primary transition-colors leading-snug break-words">
                      {renderHighlighted(doc.title, searchQuery)}
                      {doc.abbr && (
                        <span className="ml-spacing-2xs text-[11px] font-black text-primary/70 tracking-[0.2em] align-middle">
                          ({renderHighlighted(doc.abbr, searchQuery)})
                        </span>
                      )}
                    </h3>
                    <p className="text-xs font-medium text-primary/80">
                      {renderHighlighted(doc.author, searchQuery)}
                    </p>
                    <p className="text-xs text-muted-foreground">{doc.type} · {doc.category}</p>
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {renderHighlighted(doc.summary, searchQuery)}
                    </p>
                  </div>

                  {doc.themes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 border-t border-primary/10 pt-3">
                      {doc.themes.slice(0, 3).map((theme) => (
                        <span key={theme} className="rounded-full bg-primary/[0.06] px-2.5 py-1 text-[11px] font-medium text-primary/80">{theme}</span>
                      ))}
                      {doc.themes.length > 3 && <span className="rounded-full border border-primary/10 px-2.5 py-1 text-[11px] text-muted-foreground">+{doc.themes.length - 3}</span>}
                    </div>
                  )}
                </div>
              </CathedraCard>
            </Link>
          );

          if (!groupedDocs) {
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-spacing-md w-full min-w-0">
                {visibleDocs.map((doc, idx) => renderCard(doc, idx))}
              </div>
            );
          }

          return (
            <div className="space-y-spacing-xl w-full">
              {groupedDocs.map(({ key, docs }) => (
                <section key={key} aria-label={`${groupBy === 'pope' ? 'Papa' : 'Categoria'}: ${key}`}>
                  <header className="flex items-baseline justify-between mb-spacing-md border-b border-primary/[0.06] pb-spacing-2xs">
                    <h3 className="text-sm font-semibold text-primary/80">
                      {key}
                    </h3>
                    <span className="text-xs font-medium text-muted-foreground">
                      {docs.length} {docs.length === 1 ? 'documento' : 'documentos'}
                    </span>
                  </header>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-spacing-md w-full">
                    {docs.map((doc, idx) => renderCard(doc, idx))}
                  </div>
                </section>
              ))}
            </div>
          );
        })()}

        {/* Paginação */}
        {pagination.totalPages > 1 && (
          <nav
            className="flex items-center justify-center gap-spacing-md pt-spacing-md"
            aria-label="Paginação de documentos"
          >
            <Button
              variant="ghost"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              aria-label="Página anterior"
              className="text-xs font-semibold tracking-normal text-primary/80 hover:text-primary"
            >
              <Icons.ArrowLeft className="w-spacing-sm h-spacing-sm mr-spacing-2xs" />
              Anterior
            </Button>
            <span
              className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80"
              aria-live="polite"
              aria-atomic="true"
            >
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              aria-label="Próxima página"
              className="text-xs font-semibold tracking-normal text-primary/80 hover:text-primary"
            >
              Próxima
              <Icons.ArrowRight className="w-spacing-sm h-spacing-sm ml-spacing-2xs" />
            </Button>
          </nav>
        )}

        {filteredDocs.length === 0 && (
          <div className="rounded-xl border border-primary/10 bg-primary/[0.025] px-5 py-10 text-center">
            <Icons.Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
            <h3 className="text-base font-semibold text-foreground">Nenhum documento encontrado</h3>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">Tente outro termo ou remova um ou mais filtros para ampliar os resultados.</p>
            <Button type="button" variant="outline" className="mt-4 min-h-11" onClick={clearFilters}>Limpar filtros</Button>
          </div>
        )}
      </div>
      </div>
    </ContemplativeLayout>
  );
};

export default Magisterium;
