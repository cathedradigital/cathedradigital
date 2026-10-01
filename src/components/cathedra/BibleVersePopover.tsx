/**
 * BibleVersePopover — adapter fino sobre `ReferencePopover` canônico.
 *
 * Reader Architecture Rule (COS §10): este arquivo NÃO pode importar
 * `@radix-ui/react-popover` nem `@/components/ui/popover` diretamente.
 * Toda referência bíblica inline usa `ReferencePopover`, exatamente como
 * `CatechismPopover` faz para o CIC. Assim, Bíblia e Catecismo compartilham
 * animação, tipografia, espaçamentos, estados de carregamento e comportamento
 * de abertura/fechamento — sem UX divergente.
 *
 * A API pública (props) e o `data-testid` do gatilho são preservados para
 * manter compatibilidade com os 20+ call sites e com os testes existentes.
 */

import React, { memo, useCallback, useState } from 'react';
import { useNavigate } from '@/lib/rr-compat';
import { ReferencePopover } from '@/components/reader';
import { supabase } from '@/lib/db';
import { Icons } from '../../constants';
import { buildBibleUrl } from '@/lib/bibleUrl';
import { BOOK_NAME_BY_ABBR } from '@/lib/bibleCanon';

interface BibleVersePopoverProps {
  abbr: string;
  chapter: number;
  verse?: number;
  label: string;
  /** Optional override; defaults to navigating to /bible?book=&ch=&v= */
  onNavigate?: (abbr: string, chapter: number, verse?: number) => void;
}

const sanitizeBookName = (raw: unknown, abbr: string): string => {
  const value = typeof raw === 'string' ? raw.trim() : '';
  if (value && value.toLowerCase() !== 'undefined' && value.toLowerCase() !== 'null') {
    return value;
  }
  return BOOK_NAME_BY_ABBR[abbr] || abbr;
};

const renderVerseText = (text: unknown): string => {
  if (typeof text !== 'string' || !text.trim()) return '…';
  if (text.toLowerCase() === 'undefined') return '…';
  return text;
};



const EXTERNAL_BIBLE_EDITIONS = [
  {
    id: 'ave-maria',
    name: 'Bíblia Ave-Maria',
    description: 'Consulta externa da edição digital publicada pela Província Claretiana / Editora Ave-Maria.',
    url: 'https://claretianos.com.br/biblia-ave-maria-online/',
  },
  {
    id: 'cnbb',
    name: 'Bíblia da CNBB',
    description: 'Referência oficial da tradução da Bíblia da CNBB.',
    url: 'https://www.cnbb.org.br/lancada-nova-edicao-da-biblia-sagrada-da-cnbb-em-brasilia-df/',
  },
  {
    id: 'peregrino',
    name: 'Peregrino',
    description: 'Acesso ao serviço externo. O Cátedra não copia, armazena ou extrai o conteúdo protegido.',
    url: 'https://www.souperegrino.com/',
  },
] as const;

type BodyProps = BibleVersePopoverProps;

const BibleVersePopoverBody: React.FC<BodyProps> = ({ abbr, chapter, verse, onNavigate }) => {
  const navigate = useNavigate();
  const [verses, setVerses] = useState<{ number: number; text: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetched, setFetched] = useState(false);
  const [bookName, setBookName] = useState<string>(() => sanitizeBookName(undefined, abbr));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchVerses = useCallback(async () => {
    const correlationId = `bvp-${abbr}-${chapter}-${Date.now()}`;
    try {
      console.info('[BibleVersePopover] invoke bible-text', { abbrev: abbr, chapter, verse, correlationId });
      const { data, error } = await supabase.functions.invoke('bible-text', {
        body: { abbrev: abbr, chapter },
        headers: { 'x-correlation-id': correlationId },
      });
      if (error) {
        console.warn('[BibleVersePopover] edge error', { correlationId, error });
        setErrorMsg('Não foi possível carregar este trecho agora.');
      }
      const incoming = Array.isArray(data?.verses) ? data.verses : [];
      setBookName(sanitizeBookName(data?.book, abbr));

      if (incoming.length === 0) {
        console.warn('[BibleVersePopover] empty verses payload', { correlationId, data });
        setErrorMsg(prev => prev || 'Este trecho ainda não foi importado na tradução disponível. A Bíblia está em reconstrução.');
      } else if (verse) {
        const idx = incoming.findIndex((v: any) => Number(v.number) === Number(verse));
        if (idx === -1) {
          // P0.2.0 — Contenção: não mascarar ausência com "primeiros versículos".
          // Informar honestamente que aquele versículo não existe na base atual.
          setErrorMsg(`Versículo ${verse} ainda não disponível nesta tradução. Bíblia em reconstrução.`);
          setVerses([]);
        } else {
          const start = Math.max(0, idx - 1);
          const end = Math.min(incoming.length, idx + 3);
          setVerses(incoming.slice(start, end));
        }
      } else {
        setVerses(incoming.slice(0, 5));
      }
    } catch (e) {
      console.error('[BibleVersePopover] fetch crashed', { correlationId, error: e });
      setErrorMsg('Erro ao carregar versículo.');
      setVerses([]);
    } finally {
      setLoading(false);
      setFetched(true);
    }
  }, [abbr, chapter, verse]);

  React.useEffect(() => {
    void fetchVerses();
  }, [fetchVerses]);

  const handleNavigate = () => {
    if (onNavigate) {
      onNavigate(abbr, chapter, verse);
      return;
    }
    navigate(buildBibleUrl({ abbr, chapter, verse }));
  };

  const goLabel = verse ? `Ir ao versículo ${verse}` : 'Abrir completo';

  return (
    <div className="space-y-spacing-sm">
      <button
        type="button"
        onClick={handleNavigate}
        className="text-premium-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-spacing-2xs"
      >
        {goLabel}
        <Icons.ArrowDown className="w-spacing-sm h-spacing-sm -rotate-90" />
      </button>

      {loading && (
        <div className="space-y-spacing-xs py-spacing-xs">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-spacing-sm bg-muted rounded animate-pulse" style={{ width: `${50 + i * 15}%` }} />
          ))}
        </div>
      )}

      {!loading && verses.length > 0 && (
        <div className="space-y-spacing-xs">
          {verses.map(v => (
            <p key={v.number} className="text-premium-xs leading-relaxed text-foreground/90 font-serif">
              <sup className="text-primary font-bold mr-spacing-2xs">{v.number}</sup>
              {renderVerseText(v.text)}
            </p>
          ))}
          {!verse && (
            <p className="text-premium-xs text-muted-foreground italic pt-spacing-2xs border-t border-border">
              Mostrando primeiros versículos…
            </p>
          )}
        </div>
      )}

      {!loading && fetched && verses.length === 0 && (
        <p className="text-premium-xs text-muted-foreground italic">
          {errorMsg || 'Texto não disponível.'}
        </p>
      )}

      <div className="mt-spacing-sm border-t border-border pt-spacing-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-2">Outras edições</p>
        <div className="flex flex-wrap gap-2">
          {EXTERNAL_BIBLE_EDITIONS.map((edition) => (
            <a
              key={edition.id}
              href={edition.url}
              target="_blank"
              rel="noopener noreferrer"
              title={edition.description}
              className="inline-flex min-h-8 items-center rounded-full border border-border bg-muted/30 px-3 py-1.5 text-[10px] font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {edition.name}
              <span aria-hidden="true" className="ml-1.5">↗</span>
            </a>
          ))}
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
          A consulta é feita na fonte externa. O Cátedra não incorpora nem guarda o texto dessas edições sem licença de reprodução.
        </p>
      </div>

      {/* Mantém o nome do livro no rodapé, para paridade com o header antigo */}
      {!loading && verses.length > 0 && (
        <p className="text-premium-xs text-muted-foreground pt-spacing-2xs border-t border-border">
          {bookName} {chapter}{verse ? `,${verse}` : ''} · NAA
        </p>
      )}
    </div>
  );
};

const BibleVersePopover: React.FC<BibleVersePopoverProps> = memo(({ abbr, chapter, verse, label, onNavigate }) => {
  const safeLabel = (label && label !== 'undefined')
    ? label
    : `${sanitizeBookName(undefined, abbr)} ${chapter}${verse ? `,${verse}` : ''}`;

  return (
    <ReferencePopover
      kind="bible"
      label={safeLabel}
      ariaLabel={safeLabel}
      title={`${safeLabel} · NAA`}
      className="font-bold"
      renderContent={() => (
        <BibleVersePopoverBody
          abbr={abbr}
          chapter={chapter}
          verse={verse}
          label={safeLabel}
          onNavigate={onNavigate}
        />
      )}
    />
  );
});

export default BibleVersePopover;
