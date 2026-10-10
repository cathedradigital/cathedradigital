import React, { useState, useEffect, useMemo, useRef, useCallback, useContext } from 'react';
import { useParams, useNavigate, useSearchParams } from '@/lib/rr-compat';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Icons } from '@/constants';
import { supabase } from '@/lib/db';
import { MAGISTERIUM_URLS, MAGISTERIUM_DOCUMENTS } from '@/data/magisterium-urls';
import MagisteriumDocumentHeader from './MagisteriumDocumentHeader';
import MagisteriumDocumentNav from './MagisteriumDocumentNav';
import MagisteriumSearchBar from './MagisteriumSearchBar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import SEOHead from '@/components/SEOHead';
import AudioButton from './AudioButton';
import ReadingControlPanel from './ReadingControlPanel';
import ReadingMark from './ReadingMark';
import NotesPanel from './NotesPanel';
import ChapterNotesList from './ChapterNotesList';
import { useNotes, UserNote } from '@/hooks/useNotes';
import { useReadingSettings } from '@/contexts/ReadingSettingsContext';
import { useReadingMarks } from '@/hooks/useReadingMarks';
import useReadingAutoHide from '@/hooks/useReadingAutoHide';
import { ReadingProgress } from './ReadingProgress';
import { TextSelectionToolbar } from './TextSelectionToolbar';
import { NoteEditModal } from './NoteEditModal';
import MagisteriumDiagnosticPanel from './MagisteriumDiagnosticPanel';
import { logMagisteriumDiag } from '@/lib/magisteriumDiagnostics';
import { ReaderContinuation } from '@/components/shared/ReaderContinuation';
import { resolveMagisteriumAutoNexus } from '@/core/knowledge/adapters/magisteriumAutoNexus';
import { NexusPanel, ReaderShell, EditorialHero } from '@/components/reader';
import BibleVersePopover from '@/components/cathedra/BibleVersePopover';
import CatechismPopover from '@/components/cathedra/CatechismPopover';
import { parseTheologicalReferences } from '@/lib/theologicalRefParser';
import { EditorialDivider } from '@/components/editorial';
import { HighlightMenu } from './HighlightMenu';
import { LangContext } from '@/contexts/LangContext';
import { getLocaleDefinition } from '@/lib/i18n/locales';
import type { Language } from '@/types';


function renderTheologicalInline(text: string): React.ReactNode {
  const segments = parseTheologicalReferences(text);
  return segments.map((segment, index) => {
    if (segment.type === 'bibleRef' && segment.abbr && segment.chapter) {
      return (
        <BibleVersePopover
          key={`bible-${index}`}
          abbr={segment.abbr}
          chapter={segment.chapter}
          verse={segment.verse}
          label={segment.value}
        />
      );
    }
    if (segment.type === 'catechismRef' && segment.paragraph) {
      return <CatechismPopover key={`cic-${index}`} paragraph={segment.paragraph} />;
    }
    return <React.Fragment key={`text-${index}`}>{segment.value}</React.Fragment>;
  });
}

function ReferenceAwareParagraph({ text }: { text: string }) {
  return (
    <ReactMarkdown
      components={{
        text: ({ children }) => {
          const value = Array.isArray(children) ? children.join('') : String(children ?? '');
          return <>{renderTheologicalInline(value)}</>;
        },
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

const MIN_DOC_LEN = 500;

function normalizeDocumentText(value: string): string {
  return value
    .replace(/\u00a0/g, ' ')
    .replace(/\r\n?/g, '\n')
    .split(/\n{2,}/)
    .map((block) => block
      .replace(/\s+/g, ' ')
      .replace(/\s+([,.;:!?])/g, '$1')
      .replace(/([,;:])(?=\S)/g, '$1 ')
      .trim()
    )
    .filter(Boolean)
    .join('\n\n');
}

function splitDocumentParagraphs(value: string): string[] {
  return normalizeDocumentText(value).split(/\n{2,}/).filter(Boolean);
}




const MagisteriumViewer: React.FC = () => {
  const { settings, updateSettings } = useReadingSettings();
  const { lang } = useContext(LangContext);
  useReadingAutoHide(settings.visualSilence);
  const { id } = useParams<{ id: string }>();

  const [searchParams] = useSearchParams();
  const highlight = searchParams.get('highlight') || searchParams.get('text');
  const requestedParagraph = searchParams.get('p');
  const navigate = useNavigate();
  
  const [content, setContent] = useState<{ title: string; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);
  const [failureCount, setFailureCount] = useState(0);
  const MAX_RETRIES = 3;
  const unrecoverable = failureCount >= MAX_RETRIES;
  const [readingProgress, setReadingProgress] = useState(0);
  const [activeHighlight, setActiveHighlight] = useState<UserNote | null>(null);
  const [activeParagraphId, setActiveParagraphId] = useState<string | null>(null);
  const [contextualPassage, setContextualPassage] = useState<{ index: number; text: string } | null>(null);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [translationLoading, setTranslationLoading] = useState(false);
  const [translationProgress, setTranslationProgress] = useState<{ current: number; total: number } | null>(null);
  const [translationError, setTranslationError] = useState<string | null>(null);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  // STAB-004.3.2 — busca interna do documento
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [sessionResumeUsed, setSessionResumeUsed] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const { saveLastRead, getLastRead } = useReadingMarks();
  const [lastReadMark, setLastReadMark] = useState<any>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { notes: docNotes, addNote, updateNote, deleteNote: deleteDocNote } = useNotes('magisterium');

  const openDocumentNote = useCallback(() => {
    setActiveParagraphId(activeParagraphId || 'documento');
    setActiveHighlight(null);
    setIsNoteModalOpen(true);
  }, [activeParagraphId]);

  // Update history
  useEffect(() => {
    const currentUrl = window.location.pathname + window.location.search;
    setHistory(prev => {
      if (prev[historyIndex] === currentUrl) return prev;
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(currentUrl);
      setHistoryIndex(newHistory.length - 1);
      return newHistory;
    });
  }, [location.pathname, location.search, historyIndex]);
  
  const currentDocNotes = useMemo(() => {
    if (!id) return [];
    return docNotes.filter(n => n.content_id === id || n.content_id.startsWith(`${id}:`));
  }, [docNotes, id]);

  // STAB-004.2: metadados canônicos do documento (sem chamadas de rede).
  const docMeta = useMemo(
    () => (id ? MAGISTERIUM_DOCUMENTS.find((d) => d.id === id) : undefined),
    [id]
  );

  const sourceLanguage = useMemo<Language>(() => {
    const knownSourceLanguages: Record<string, Language> = {
      dfil: 'la',
      paet: 'la',
      bdeus: 'la',
    };
    if (id && knownSourceLanguages[id]) return knownSourceLanguages[id];

    const url = docMeta?.url ?? '';
    const pathMatch = url.match(/\/((?:pt|en|es|it|la|fr|de))\//i);
    if (pathMatch) return pathMatch[1].toLowerCase() as Language;
    const suffixMatch = url.match(/_(po|la|en|es|it|fr|de)(?:\.|-|_)/i);
    if (suffixMatch?.[1]?.toLowerCase() === 'po') return 'pt';
    return (suffixMatch?.[1]?.toLowerCase() as Language) || 'pt';
  }, [docMeta?.url, id]);

  const sourceLanguageName = getLocaleDefinition(sourceLanguage).nativeName;
  const targetLanguageName = getLocaleDefinition(lang).nativeName;
  const showingTranslation = translatedText !== null && sourceLanguage !== lang;

  const translationCacheKey = id ? `cathedra_magisterium_translation_${id}_${lang}_v1` : null;

  useEffect(() => {
    setTranslatedText(null);
    setTranslationError(null);
    setTranslationProgress(null);
    if (!translationCacheKey || sourceLanguage === lang) return;
    try {
      const cached = localStorage.getItem(translationCacheKey);
      if (cached) setTranslatedText(cached);
    } catch { /* cache unavailable */ }
  }, [translationCacheKey, sourceLanguage, lang]);

  const translateDocument = useCallback(async () => {
    if (!content?.text || sourceLanguage === lang || translationLoading) return;
    setTranslationLoading(true);
    setTranslationError(null);
    try {
      const { data, error } = await supabase.functions.invoke('document-translate', {
        body: {
          text: content.text,
          source_language: sourceLanguage,
          target_language: lang,
        },
      });
      if (error) throw error;
      const result = typeof data?.text === 'string' ? data.text.trim() : '';
      if (!result) throw new Error('O tradutor não retornou conteúdo.');
      setTranslatedText(result);
      if (translationCacheKey) {
        try { localStorage.setItem(translationCacheKey, result); } catch { /* cache unavailable */ }
      }
    } catch (err: any) {
      setTranslationError(err?.message || 'Não foi possível traduzir este documento agora.');
    } finally {
      setTranslationLoading(false);
      setTranslationProgress(null);
    }
  }, [content?.text, sourceLanguage, lang, translationLoading, translationCacheKey]);

  useEffect(() => {
    if (!content?.text || sourceLanguage === lang || translatedText || translationLoading) return;
    void translateDocument();
  }, [content?.text, sourceLanguage, lang, translatedText, translationLoading, translateDocument]);


  useEffect(() => {
    const fetchLastRead = async () => {
      const lr = await getLastRead();
      setLastReadMark(lr);
    };
    fetchLastRead();
  }, [getLastRead]);

  useEffect(() => { setFailureCount(0); }, [id]);

  // STAB-004.3.1 — Scroll ao topo ao trocar de documento.
  // Não conflita com o restore de posição salva (linha ~338), que só age
  // quando existe `cathedra_last_magisterium_scroll_{id}` no localStorage
  // e roda 800ms depois, sobrepondo este scroll inicial quando aplicável.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [id]);

  // Restaura a posição exata deste documento depois de voltar do Nexus.\n  useEffect(() => {\n    if (!id || loading || !content) return;\n    const key = 'cathedra_last_magisterium_scroll_' + id;\n    const raw = localStorage.getItem(key);\n    const saved = raw ? Number(raw) : NaN;\n    const dbPosition = lastReadMark?.content_id === id && typeof lastReadMark.position === 'number' ? lastReadMark.position : NaN;\n    const position = Number.isFinite(saved) && saved > 0 ? saved : dbPosition;\n    if (!Number.isFinite(position) || position <= 0) return;\n    requestAnimationFrame(() => window.scrollTo({ top: position, left: 0, behavior: 'auto' }));\n  }, [id, loading, content, lastReadMark]);\n\n  // Guard contra StrictMode double-invoke: cada (id, retryNonce) executa 1x
  const lastFetchKey = useRef<string | null>(null);
  useEffect(() => {
    const fetchDoc = async () => {
      if (!id) return;
      const key = `${id}::${retryNonce}`;
      if (lastFetchKey.current === key) return;
      lastFetchKey.current = key;
      setLoading(true);
      setError(null);


      const isOfflineMode = localStorage.getItem('cathedra_offline_mode') === 'true';
      const url = MAGISTERIUM_URLS[id];
      if (!url) {
        setError('Documento não encontrado ou URL não configurada.');
        setLoading(false);
        logMagisteriumDiag({ docId: id, step: 'final_error', message: 'URL não configurada' });
        return;
      }

      if (isOfflineMode) {
        setError('Modo Somente-Cache ativo: Documentos do Vaticano não estão disponíveis offline.');
        setLoading(false);
        return;
      }

      try {
        const { data, error: invokeError } = await supabase.functions.invoke('vatican-document', {
          body: { url },
        });

        if (invokeError) {
          // Extrai detalhes (attempts, tried, step) do corpo da resposta 4xx/5xx.
          let details: any = null;
          try {
            const resp = (invokeError as any)?.context?.response;
            if (resp && typeof resp.json === 'function') details = await resp.json();
          } catch { /* body já consumido/indisponível */ }
          if (details) {
            console.warn('[Magisterium] edge error details', details);
            (invokeError as any).details = details;
            const attempts = details?.details?.attempts ?? details?.attempts;
            if (Array.isArray(attempts) && attempts.length) {
              const lines = attempts
                .map((a: any) => `  • [${a.status || 'err'}] ${a.url} — ${a.reason}`)
                .join('\n');
              (invokeError as any).message =
                `${details?.details?.message || details?.error || invokeError.message}\n\nURLs tentadas:\n${lines}`;
            }
          }
          throw invokeError;
        }
        if (!data?.text) throw new Error('Conteúdo não retornado pela função.');

        const meta = (data as { meta?: { step?: string; content_length?: number; winning_url?: string; attempts?: Array<{url:string;status:number;reason:string}> } })?.meta;
        const text: string = data.text;
        const isThin = text.length < MIN_DOC_LEN;

        if (meta?.attempts && meta.attempts.length > 1) {
          console.info('[Magisterium] fallback usado', {
            requested: url,
            winner: meta.winning_url,
            attempts: meta.attempts,
          });
        }

        if (isThin) {
          logMagisteriumDiag({
            docId: id,
            url,
            step: (meta?.step as any) ?? 'fetch_thin',
            contentLength: text.length,
            message: 'Conteúdo abaixo do mínimo legível',
          });
          throw new Error(
            `Documento retornou apenas ${text.length} caracteres — abaixo do mínimo legível (${MIN_DOC_LEN}). Pode ser uma página de redirecionamento do vatican.va.`,
          );
        }

        logMagisteriumDiag({
          docId: id,
          url,
          step: (meta?.step as any) ?? 'fetch_ok',
          contentLength: text.length,
        });

        setContent({ title: data.title || id, text });
        setFailureCount(0);
      } catch (err: any) {
        console.error('Error fetching document:', err);
        window.dispatchEvent(new CustomEvent('supabase-unreachable'));
        const msg = err?.message || 'Erro ao carregar o documento do Vaticano. Verifique sua conexão.';
        setError(msg);
        setFailureCount((n) => n + 1);
        logMagisteriumDiag({ docId: id, url, step: 'final_error', message: msg });
        toast.error('Não foi possível carregar o documento.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoc();
  }, [id, retryNonce]);


  // Restaura o parágrafo exato solicitado pelo Diário/Minha Jornada.
  // O índice persistido nas anotações é 0-based (para-N); a UI exibe §N+1.
  useEffect(() => {
    if (!content || loading || requestedParagraph === null) return;
    const paragraphIndex = Number(requestedParagraph);
    if (!Number.isInteger(paragraphIndex) || paragraphIndex < 0) return;

    const targetId = `para-${paragraphIndex}`;
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 10;

    const restoreRequestedParagraph = () => {
      if (cancelled) return;
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'auto', block: 'center' });
        target.classList.add('bg-primary/10');
        window.setTimeout(() => {
          if (!cancelled) target.classList.remove('bg-primary/10');
        }, 2200);
        return;
      }
      if (attempts < maxAttempts) {
        attempts += 1;
        window.setTimeout(restoreRequestedParagraph, 100);
      }
    };

    const frame = window.requestAnimationFrame(restoreRequestedParagraph);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [content, loading, requestedParagraph]);

  // Track visible paragraph for bookmarking
  useEffect(() => {
    if (loading || !content) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveParagraphId(entry.target.id);
          }
        });
      },
      { threshold: 0.5, rootMargin: '-10% 0px -70% 0px' }
    );

    const paragraphElements = document.querySelectorAll('[id^="para-"]');
    paragraphElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [loading, content]);

  const handleReturnToParagraph = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('bg-primary/10');
      setTimeout(() => el.classList.remove('bg-primary/10'), 2000);
    }
  };

  const handleBookmarkCurrent = () => {
    if (activeParagraphId && id && content) {
      const pIdx = parseInt(activeParagraphId.replace('para-', ''));
      saveLastRead({
        content_type: 'magisterium',
        content_id: id,
        position: pIdx,
        label: `${content.title} §${pIdx + 1}`,
        url: `/magisterium/${id}?p=${pIdx}`,
        is_last_read: true
      });
      toast.success('Posição salva', {
        description: `Você parou no parágrafo ${pIdx + 1}`
      });
    }
  };

  // Auto-save scroll position

  useEffect(() => {
    const handleScroll = () => {
      if (id && content) {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (window.scrollY / totalHeight) * 100;
        setReadingProgress(Math.min(100, Math.max(0, progress)));
        
        localStorage.setItem(`cathedra_last_magisterium_scroll_${id}`, window.scrollY.toString());
      }
    };
    
    // Save to DB on unmount or every few seconds
    const interval = setInterval(() => {
      if (id && content) {
        saveLastRead({
          content_type: 'magisterium',
          content_id: id,
          label: content.title,
          url: window.location.pathname + window.location.search,
          position: window.scrollY
        });
      }
    }, 10000); // every 10s

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, [id, content, saveLastRead]);

  const [pendingSelectionAnchorId, setPendingSelectionAnchorId] = useState<string | null>(null);

  const handleAddNoteOrHighlight = useCallback(async (color: string, text: string) => {
    if (!id) return;

    if (activeHighlight) {
      await updateNote(activeHighlight.id, text, color);
      setActiveHighlight(null);
    } else {
      const match = pendingSelectionAnchorId?.match(/^para-(\d+)$/);
      const paragraphIndex = match ? Number(match[1]) : undefined;
      const contentId = paragraphIndex !== undefined ? `${id}:${paragraphIndex}` : id;
      await addNote(contentId, text, color, paragraphIndex !== undefined ? { paragraph: paragraphIndex + 1 } : undefined);
    }

    setPendingSelectionAnchorId(null);
    setIsNoteModalOpen(false);
  }, [id, activeHighlight, addNote, pendingSelectionAnchorId, updateNote]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing or modal is open
      const activeElement = document.activeElement;
      const isTyping = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA' || (activeElement as HTMLElement)?.isContentEditable;

      // STAB-004.3.2 — Ctrl/Cmd+F abre a busca interna do documento,
      // suprimindo o Find nativo do navegador (funciona mesmo com foco em input).
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'f' && id) {
        e.preventDefault();
        setIsSearchOpen(true);
        return;
      }

      if (isTyping || isNoteModalOpen) return;
      
      
      // Accessibility: Reading shortcuts
      if (id) {
        if (e.key.toLowerCase() === (settings.shortcuts?.highlight || 'h')) {
          e.preventDefault();
          handleAddNoteOrHighlight('yellow', 'Destacado via atalho');
        }
        if (e.key.toLowerCase() === (settings.shortcuts?.note || 'n')) {
          e.preventDefault();
          setIsNoteModalOpen(true);
        }
        if (e.key === (settings.shortcuts?.clear || 'Escape')) {
          e.preventDefault();
          setActiveHighlight(null);
        }
        // Progress navigation (Alt + Up/Down)
        if (e.altKey && e.key === 'ArrowUp') {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        if (e.altKey && e.key === 'ArrowDown' && lastReadMark?.url) {
          e.preventDefault();
          
          const behavior = settings.resumeBehavior || 'confirm';
          let shouldResume = true;
          
          if (behavior === 'confirm') {
            shouldResume = confirm(`Deseja retomar a leitura em: ${lastReadMark.label}?`);
          } else if (behavior === 'once') {
            if (!sessionResumeUsed) {
              shouldResume = confirm(`Deseja retomar a leitura em: ${lastReadMark.label}?`);
              if (shouldResume) setSessionResumeUsed(true);
            }
          } else if (behavior === 'never') {
            shouldResume = false;
          }

          if (shouldResume) {
            navigate(lastReadMark.url);
          }
        }

        // History navigation (Alt + Left/Right)
        if (e.altKey && e.key === 'ArrowLeft' && historyIndex > 0) {
          e.preventDefault();
          const prevUrl = history[historyIndex - 1];
          setHistoryIndex(prev => prev - 1);
          navigate(prevUrl);
        }
        if (e.altKey && e.key === 'ArrowRight' && historyIndex < history.length - 1) {
          e.preventDefault();
          const nextUrl = history[historyIndex + 1];
          setHistoryIndex(prev => prev + 1);
          navigate(nextUrl);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [id, isNoteModalOpen, handleAddNoteOrHighlight, lastReadMark, navigate]);

  // Restore scroll position
  useEffect(() => {
    if (content && id && requestedParagraph === null) {
      const savedScroll = localStorage.getItem(`cathedra_last_magisterium_scroll_${id}`);
      if (savedScroll && !highlight) {
        setTimeout(() => {
          window.scrollTo({ top: parseInt(savedScroll), behavior: 'smooth' });
          toast('Documento restaurado do último ponto', { icon: '📖', duration: 2000 });
        }, 800);
      }
    }
  }, [content, id, highlight, requestedParagraph]);


  // Scroll to highlight when content is loaded
  useEffect(() => {
    if (content && highlight && contentRef.current) {
      setTimeout(() => {
        const text = contentRef.current?.innerText;
        if (text) {
          const index = text.toLowerCase().indexOf(highlight.toLowerCase());
          if (index !== -1) {
            // Find all elements that might contain the text
            // Simple strategy: find the first element that contains the text
            const walker = document.createTreeWalker(contentRef.current!, NodeFilter.SHOW_TEXT);
            let node;
            while ((node = walker.nextNode())) {
              if (node.textContent?.toLowerCase().includes(highlight.toLowerCase())) {
                const parent = node.parentElement;
                if (parent) {
                  parent.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  parent.classList.add('bg-primary/20', 'rounded', 'transition-colors', 'duration-1000');
                  setTimeout(() => parent.classList.remove('bg-primary/20'), 3000);
                  break;
                }
              }
            }
          }
        }
      }, 500);
    }
  }, [content, highlight]);

  const processedText = useMemo(() => {
    if (!content?.text) return '';
    if (showingTranslation) return normalizeDocumentText(translatedText || '');
    return normalizeDocumentText(content.text);
  }, [content, translatedText, showingTranslation]);

  if (loading) {
    return (
      <div className="max-w-spacing-4xl mx-auto px-spacing-md py-spacing-3xl flex flex-col items-center justify-center space-y-spacing-lg">
        <div className="relative">
          <div className="w-spacing-3xl h-spacing-3xl rounded-premium bg-primary/10 animate-pulse border-2 border-primary/20" />
          <Icons.Loader className="absolute inset-0 w-spacing-3xl h-spacing-3xl text-primary animate-spin p-spacing-md" />
        </div>
        <p className="text-muted-foreground font-serif italic animate-pulse">Buscando documento nos arquivos do Vaticano...</p>
      </div>
    );
  }

  if (error || !content) {
    const canonicalUrl = id ? MAGISTERIUM_URLS[id] : undefined;
    return (
      <div
        data-testid="magisterium-error-fallback"
        data-unrecoverable={unrecoverable ? 'true' : 'false'}
        data-failure-count={failureCount}
        role="alert"
        aria-live="assertive"
        className="max-w-spacing-2xl mx-auto px-spacing-md py-spacing-3xl text-center space-y-spacing-lg"
      >
        <div className="w-spacing-3xl h-spacing-3xl bg-destructive/10 rounded-premium flex items-center justify-center mx-auto">
          <Icons.AlertTriangle className="w-spacing-xl h-spacing-xl text-destructive" aria-hidden="true" />
        </div>
        <div className="space-y-spacing-xs">
          <h2 className="text-premium-2xl font-serif font-bold text-foreground">
            {unrecoverable ? 'Não foi possível carregar este documento' : 'Ops! Algo deu errado'}
          </h2>
          <p className="text-muted-foreground">
            {unrecoverable
              ? `Tentamos ${failureCount} vezes sem sucesso. O documento parece indisponível agora — abra-o diretamente no vatican.va ou tente novamente mais tarde.`
              : (error || 'Documento não disponível.')}
          </p>
          {unrecoverable && (
            <p
              data-testid="magisterium-unrecoverable-message"
              className="text-sm font-medium text-destructive"
            >
              Modo não-recuperável: novas tentativas automáticas foram interrompidas.
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-spacing-sm">
          {!unrecoverable && (
            <Button
              onClick={() => { setError(null); setRetryNonce((n) => n + 1); }}
              variant="default"
              className="rounded-premium-full"
              data-testid="magisterium-retry"
              autoFocus
            >
              <Icons.Loader className="w-spacing-md h-spacing-md mr-spacing-xs" aria-hidden="true" />
              Tentar novamente {failureCount > 0 ? `(${failureCount}/${MAX_RETRIES})` : ''}
            </Button>
          )}
          {canonicalUrl && (
            <a
              href={canonicalUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="magisterium-external-fallback"
              className="inline-flex items-center gap-spacing-xs rounded-premium-full border border-primary/30 px-spacing-lg py-spacing-sm text-sm text-foreground hover:bg-primary/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Icons.ExternalLink className="w-spacing-md h-spacing-md" aria-hidden="true" />
              Abrir no vatican.va
            </a>
          )}
          <Button onClick={() => navigate(-1)} variant="ghost" className="rounded-premium-full">
            <Icons.ArrowLeft className="w-spacing-md h-spacing-md mr-spacing-xs" aria-hidden="true" /> Voltar
          </Button>
        </div>
        <MagisteriumDiagnosticPanel />
      </div>
    );
  }


  const magisteriumNexus = resolveMagisteriumAutoNexus({
    docId: id ?? 'documento',
    title: content.title,
    themes: [content.title],
  });

  return (
    <ReaderShell
      className="w-full pb-spacing-4xl relative overflow-x-hidden"
      contentMaxWidth="max-w-3xl"
      ariaLabel={`Documento do Magistério — ${content.title}`}
      hero={
        <EditorialHero
          kicker={`Magistério${docMeta?.category ? ` · ${docMeta.category}` : ''}`}
          title={docMeta?.title ?? content.title}
          subtitle={requestedParagraph !== null ? `Leitura em foco · §${Number(requestedParagraph) + 1}` : (docMeta ? [docMeta.type, docMeta.author, docMeta.year ? String(docMeta.year) : undefined].filter(Boolean).join(' · ') : undefined)}
          meta={undefined}
        />
      }
      nexus={<NexusPanel output={magisteriumNexus} kicker={`Conexões · ${content.title}`} />}
      continuation={
        <ReaderContinuation
          context={{
            kind: 'magisterium',
            id: id ?? undefined,
            graphNodeId: magisteriumNexus.selfId ?? undefined,
            meta: { theme: content.title },
          }}
          suggestions={magisteriumNexus.suggestions.length > 0 ? magisteriumNexus.suggestions : undefined}
        />
      }
    >
      <SEOHead
        title={`${content.title} | Magistério`}
        description={`Leia o documento completo: ${content.title}`}
        path={`/magisterium/${id}`}
      />

      {/* Atmospheric Header - More minimal on mobile */}
      <div className="sticky top-spacing-0 z-40 bg-background/80 backdrop-blur-3xl py-spacing-sm px-spacing-md sm:px-spacing-lg mb-spacing-xl md:mb-spacing-3xl border-b border-primary/5 flex items-center justify-between gap-spacing-md header-reading-auto-hide transition-all duration-700">
        <div className="flex items-center gap-spacing-xs min-w-spacing-0">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            aria-label="Voltar"
            className="rounded-premium-full hover:bg-primary/5 min-h-11 min-w-11 shrink-0 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          >
            <Icons.ArrowLeft className="w-spacing-md h-spacing-md" aria-hidden="true" />
          </Button>
          <div className="min-w-spacing-0">
            <p className="text-[12px] md:text-[13px] font-semibold tracking-[0.03em] text-primary truncate leading-tight mb-spacing-2xs">{content.title}</p>
            <p className="text-[11px] md:text-[12px] text-muted-foreground uppercase tracking-[0.1em] font-semibold">Magistério</p>
          </div>
        </div>
        
        <div className="flex items-center gap-spacing-2xs shrink-0">
          <div className="hidden sm:flex items-center gap-spacing-2xs mr-spacing-xs">
            <AudioButton variant="outline" className="rounded-premium-full min-h-11 min-w-11 p-spacing-0 border-primary/10" />
            <ReadingMark contentType="magisterium" contentId={id || ''} label={content.title} />
          </div>
          <ReadingControlPanel />
          {/* STAB-004.3.2 — Toggle da busca interna */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSearchOpen((v) => !v)}
            aria-pressed={isSearchOpen}
            aria-label={isSearchOpen ? 'Fechar busca no documento' : 'Buscar neste documento (Ctrl+F)'}
            title="Buscar neste documento (Ctrl+F)"
            className={`rounded-premium-full min-h-11 min-w-11 p-spacing-0 transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${isSearchOpen ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/5 text-primary/70'}`}
          >
            <Icons.Search className="w-spacing-md h-spacing-md" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* STAB-004.3.2 — Barra de busca interna (sticky logo abaixo do header) */}
      <MagisteriumSearchBar
        containerRef={contentRef}
        contentVersion={id}
        open={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <div className="flex flex-col gap-spacing-xl lg:gap-spacing-2xl items-start">



        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 w-full relative"
        >
            {/* Cabeçalho editorial migrado para o slot `hero` do ReaderShell (C0.5.b). */}

            {/* STAB-004.2: Ficha rica do documento (só renderiza campos existentes) */}
            {docMeta && <MagisteriumDocumentHeader doc={docMeta} />}

            {sourceLanguage !== lang && (
              <section
                aria-label="Idioma e tradução do documento"
                className="w-full max-w-[70ch] mx-auto px-spacing-md md:px-0 mb-spacing-xl"
              >
                <div className="border border-primary/10 bg-primary/[0.025] px-spacing-md py-spacing-sm md:px-spacing-lg md:py-spacing-md rounded-xl flex flex-col gap-spacing-sm sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                      Idioma original · {sourceLanguageName}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {showingTranslation ? `Tradução de apoio para ${targetLanguageName}. A fonte oficial permanece vinculada ao Vaticano.` : `O texto carregado está em ${sourceLanguageName}. Você pode lê-lo em ${targetLanguageName} sem sair do Cátedra.`}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={translateDocument}
                    disabled={translationLoading}
                    className="shrink-0 rounded-full min-h-10 px-4 text-xs font-semibold"
                    data-testid="magisterium-translate"
                  >
                    {translationLoading ? 'Traduzindo…' : showingTranslation ? 'Atualizar tradução' : `Traduzir para ${targetLanguageName}`}
                  </Button>
                </div>
                {translationLoading && translationProgress && (
                  <p className="mt-2 text-center text-[12px] text-muted-foreground" aria-live="polite">
                    Traduzindo bloco {translationProgress.current} de {translationProgress.total}…
                  </p>
                )}
                {translationError && (
                  <p className="mt-2 text-center text-xs text-destructive" role="alert">{translationError}</p>
                )}
              </section>
            )}


            {/* Visual Indicator for Keyboard Shortcuts */}
            {settings.totalSilence && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="fixed bottom-spacing-4xl left-spacing-2xs/2 -translate-x-1/2 z-[160] px-spacing-md py-spacing-xs bg-primary/80 backdrop-blur-md text-primary-foreground rounded-premium-full text-[11px] font-semibold uppercase tracking-[0.1em] flex items-center gap-spacing-sm border border-white/10 shadow-premium"
              >
                <span className="flex items-center gap-spacing-2xs"><kbd className="bg-white/20 px-spacing-2xs py-spacing-3xs rounded">{settings.shortcuts?.highlight?.toUpperCase() || 'H'}</kbd> Destacar</span>
                <div className="w-px h-spacing-sm bg-white/20" />
                <span className="flex items-center gap-spacing-2xs"><kbd className="bg-white/20 px-spacing-2xs py-spacing-3xs rounded">{settings.shortcuts?.note?.toUpperCase() || 'N'}</kbd> Nota</span>
                <div className="w-px h-spacing-sm bg-white/20" />
                <span className="flex items-center gap-spacing-2xs"><kbd className="bg-white/20 px-spacing-2xs py-spacing-3xs rounded">Esc</kbd> Limpar</span>
              </motion.div>
            )}
            <div className="w-full relative">
            <div 
              ref={contentRef}
              onScroll={() => {
                if (id) localStorage.setItem(`cathedra_last_magisterium_scroll_${id}`, window.scrollY.toString());
              }}
              className={`w-full max-w-[70ch] mx-auto px-spacing-md md:px-spacing-0
                py-spacing-lg md:py-spacing-2xl prose prose-slate dark:prose-invert reader-text
                font-size-${settings.fontSize} font-family-${settings.fontFamily}
                text-[1.12rem] md:text-[1.18rem] prose-p:leading-[1.68] prose-p:mb-spacing-md
                prose-headings:font-serif prose-headings:text-primary prose-headings:mt-spacing-2xl prose-headings:mb-spacing-md
                prose-li:leading-[1.72] prose-li:mb-spacing-xs
                prose-p:first-child:mt-0
                prose-blockquote:border-primary/10 prose-blockquote:bg-primary/[0.01] prose-blockquote:p-spacing-md prose-blockquote:rounded-premium prose-blockquote:italic
                prose-strong:text-primary prose-strong:font-bold transition-all duration-300`}
            >

              {splitDocumentParagraphs(processedText).map((para, idx) => {
                const note = currentDocNotes.find(n => n.content_id === `${id}:${idx}` && n.highlight_color);
                
                return (
                  <div key={idx} className="group relative mb-spacing-xs" id={`para-${idx}`}>
                    <div className={cn(note ? `highlight-${note.highlight_color} px-spacing-2xs rounded-premium-sm cursor-pointer` : '')}
                         onClick={() => note && setActiveHighlight(note)}>
                      <ReferenceAwareParagraph text={para} />
                    </div>
                    <div className="absolute top-spacing-0 -right-spacing-2xl flex flex-col gap-spacing-xs opacity-0 group-hover:opacity-100 transition-opacity no-print">
                      <NotesPanel contentType="magisterium" contentId={`${id}:${idx}`} contentLabel={`${content.title} §${idx + 1}`} />
                      <ReadingMark contentType="magisterium" contentId={`${id}:${idx}`} label={`${content.title} Parágrafo ${idx + 1}`} />
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setContextualPassage({ index: idx, text: para })}
                        className="rounded-premium-full text-muted-foreground/50 hover:text-secondary hover:bg-secondary/5"
                        aria-label={`Abrir Yá para o parágrafo ${idx + 1}`}
                        title="Yá"
                      >
                        <Icons.Sparkles className="w-spacing-sm h-spacing-sm" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            </div>
            
            <HighlightMenu
              isOpen={contextualPassage !== null}
              onClose={() => setContextualPassage(null)}
              onSelectColor={async (color) => {
                if (!contextualPassage || !id) return;
                const existing = currentDocNotes.find(n => n.content_id === `${id}:${contextualPassage.index}`);
                if (existing) {
                  await updateNote(existing.id, existing.note_text, color);
                } else {
                  await addNote(`${id}:${contextualPassage.index}`, 'Destacado para meditação', color, { paragraph: contextualPassage.index + 1 });
                }
                setContextualPassage(null);
              }}
              onAddNote={() => {
                if (!contextualPassage) return;
                setPendingSelectionAnchorId(`para-${contextualPassage.index}`);
                setContextualPassage(null);
                setIsNoteModalOpen(true);
              }}
              verseText={contextualPassage?.text}
              reference={contextualPassage ? `${content.title} · §${contextualPassage.index + 1}` : undefined}
              passage={contextualPassage ? { kind: 'magisterium', id: id ?? 'documento', highlight: `para-${contextualPassage.index}` } : undefined}
            />

            <TextSelectionToolbar 
              activeHighlightId={activeHighlight?.id}
              activeColor={activeHighlight?.highlight_color}
              onHighlight={(color) => {
                if (activeHighlight) {
                  updateNote(activeHighlight.id, activeHighlight.note_text, color).then((ok) => {
                    if (ok) setActiveHighlight(null);
                  });
                } else if (id) {
                  addNote(id, 'Destacado para meditação', color);
                }
              }}
              onDeleteHighlight={() => {
                if (activeHighlight) {
                  deleteDocNote(activeHighlight.id);
                  setActiveHighlight(null);
                }
              }}
              onAddNote={(_selectedText, anchorId) => {
                if (id || activeHighlight) {
                  setPendingSelectionAnchorId(anchorId ?? null);
                  setIsNoteModalOpen(true);
                }
              }}
            />

            <NoteEditModal 
              isOpen={isNoteModalOpen}
              onClose={() => setIsNoteModalOpen(false)}
              onSave={handleAddNoteOrHighlight}
              onDelete={() => {
                if (activeHighlight) {
                  deleteDocNote(activeHighlight.id);
                  setActiveHighlight(null);
                  setIsNoteModalOpen(false);
                }
              }}
              initialText={activeHighlight?.note_text === 'Destacado para meditação' ? '' : activeHighlight?.note_text}
              initialColor={activeHighlight?.highlight_color || 'yellow'}
              title={activeHighlight ? 'Editar Reflexão' : 'Nova Reflexão'}
              isEditing={!!activeHighlight}
            />

            <ReadingProgress 
              progress={readingProgress}
              onScrollToTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              onScrollToPercentage={(p) => {
                const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
                window.scrollTo({ top: (p / 100) * totalHeight, behavior: 'smooth' });
              }}
              showResume={lastReadMark && lastReadMark.url !== window.location.pathname + window.location.search}
              onResumeLast={() => {
                const behavior = settings.resumeBehavior || 'confirm';
                if (behavior === 'always' || (behavior === 'once' && sessionResumeUsed)) {
                   navigate(lastReadMark.url);
                } else if (behavior === 'never') {
                   toast.info('Retomada automática desativada nas configurações.');
                } else if (confirm(`Deseja retomar a leitura em: ${lastReadMark.label}?`)) {
                   if (behavior === 'once') setSessionResumeUsed(true);
                   navigate(lastReadMark.url);
                }
              }}
              label={content.title}
              isSubtle={settings.visualSilence}
              lastParagraphId={activeParagraphId || undefined}
              onBookmarkCurrent={handleBookmarkCurrent}
              onReturnToParagraph={handleReturnToParagraph}
            />

        </motion.div>
      </div>


      {content && (
        <div className="w-full max-w-[70ch] mx-auto mb-spacing-2xl space-y-spacing-2xl">
          <ChapterNotesList 
            notes={currentDocNotes} 
            onDeleteNote={deleteDocNote}
            title="Minhas Notas neste Documento"
          />

          <EditorialDivider variant="gold-fade" className="max-w-[240px] mx-auto" />
        </div>
      )}

      {/* STAB-004.3: Navegação entre documentos (derivada de MAGISTERIUM_DOCUMENTS) */}
      {id && <MagisteriumDocumentNav currentId={id} />}

      {/* NexusPanel + ReaderContinuation migrados para slots `nexus` e `continuation` do ReaderShell (C0.5.b). */}

      <div className="mt-spacing-4xl pt-spacing-3xl border-t border-primary/5 flex flex-col items-center gap-spacing-2xl">
        <div className="text-center space-y-spacing-md">
          <Icons.CheckCircle2 className="w-spacing-2xl h-spacing-2xl text-primary/60 mx-auto" />
          <div className="space-y-spacing-2xs">
            <h3 className="text-premium-xl font-display text-primary uppercase tracking-widest">Contemplação Concluída</h3>
            <p className="text-premium-xs text-muted-foreground italic">"A leitura busca, a meditação encontra."</p>
          </div>
          <Button 
            onClick={() => {
              saveLastRead({
                content_type: 'magisterium',
                content_id: id || '',
                label: content.title,
                url: window.location.pathname,
                position: document.documentElement.scrollHeight
              });
              toast.success("Progresso salvo com sucesso", {
                icon: '✨'
              });
              navigate(-1);
            }}
            className="rounded-premium-full px-spacing-2xl py-spacing-lg bg-primary text-primary-foreground hover:scale-105 transition-all shadow-premium"
          >
            Concluir e Voltar
          </Button>
        </div>

        <Button 
          variant="ghost" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="rounded-premium-full px-spacing-xl py-spacing-lg text-muted-foreground hover:text-primary transition-all group"
        >
          <Icons.ChevronUp className="w-spacing-md h-spacing-md mr-spacing-xs group-hover:-translate-y-1 transition-transform" /> 
          Voltar ao Topo do Documento
        </Button>
      </div>

      <MagisteriumDiagnosticPanel />
    </ReaderShell>
  );
};

export default MagisteriumViewer;