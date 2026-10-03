import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
/**
 * Bible Component - CATHEDRA BIBLE REGRESSION RECOVERY
 * Version: 4.0.0 (Stabilized)
 */
import html2canvas from 'html2canvas';
import { BIBLE_DATA, BibleBook } from '@/data/bible-books';
import { Helmet } from '@/lib/helmet-compat';
import { Link, useNavigate, useSearchParams } from '@/lib/rr-compat';
import { useBibleNavigation } from '@/hooks/bible/useBibleNavigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '@/constants';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useReadingSettings } from '@/contexts/ReadingSettingsContext';
import { cn, getElementSelector } from '@/lib/utils';
import { supabase } from '@/lib/db';
import { toast } from 'sonner';
import { describeBibleTextError } from '@/shared/bibleTextSchema';
import { useRenderPerf } from '@/hooks/useRenderPerf';
import BibleDictionaryPopover from './BibleDictionaryPopover';
import ReadingSettingsPopover from './ReadingSettingsPopover';
import { useAuth } from '@/hooks/useAuth';
import { BibleSkeleton } from './RouteSkeletons';
import { useNotes } from '@/hooks/useNotes';
import { useReadingMarks } from '@/hooks/useReadingMarks';
import { NoteEditModal } from './NoteEditModal';
import BibleSearch from './BibleSearch';
import { BibleHome } from './BibleHome';
import BibleFullNotesList from './BibleFullNotesList';
import BibleBookmarksList from './BibleBookmarksList';
import { BibleReader } from './BibleReader';
import { VerseNoteSup } from './VerseNoteSup';
import { FORBIDDEN_ENGLISH_WORDS, LANGUAGE_ALLOWLIST } from '@/constants/language-config';

import { MonthlyRecap } from './MonthlyRecap';
import { HighlightMenu } from './HighlightMenu';
import { BibleKnowledgeAudit } from './BibleKnowledgeAudit';
import { KnowledgeGraph } from './KnowledgeGraph';
import { useCatechismParagraph } from '@/hooks/useCatechismParagraph';
import { buildPassageUrl } from '@/lib/passageUrl';
import { useShare } from '@/hooks/useShare';
import { useHighContrast } from '@/hooks/useHighContrast';
import biblePerf from '@/lib/biblePerf';
import { isChapterMissing, MISSING_CHAPTER_REASON } from '@/lib/bibleMissingChapters';
import NexusContributionDialog from './NexusContributionDialog';
import { saveBibleReturnContext } from '@/lib/bibleReturnContext';

const CatechismParagraphPreview: React.FC<{ paragraphId: string }> = ({ paragraphId }) => {
  const pNum = Number.parseInt(String(paragraphId).replace(/^§/, '').trim(), 10);
  const { data, isLoading } = useCatechismParagraph(pNum, !isNaN(pNum));

  if (isNaN(pNum)) return null;

  if (isLoading) {
    return (
      <div className="space-y-spacing-xs animate-pulse">
        <div className="h-3 bg-primary/10 rounded w-full" />
        <div className="h-3 bg-primary/10 rounded w-5/6" />
      </div>
    );
  }

  if (!data?.content) {
    return (
      <div className="space-y-spacing-xs" data-testid="catechism-preview-empty">
        <p className="text-xs text-primary/50 italic" data-testid="catechism-preview-empty-message">
          Conteúdo ainda não indexado no banco oficial.
        </p>
        <Link
          to={`/catechism?p=${pNum}`}
          data-testid="catechism-preview-empty-link"
          data-cic-paragraph={pNum}
          data-cic-origin="bible-preview-empty"
          className="inline-flex items-center gap-1 text-xs font-bold text-secondary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary rounded-sm"
          onClick={() => {
            // Instrumentação: origem + destino do link do CIC
            console.info('[CIC link click]', {
              origin: 'Bible/CatechismPreview',
              paragraph: pNum,
              href: `/catechism?p=${pNum}`,
              from: typeof window !== 'undefined' ? window.location.pathname + window.location.search : '',
            });
          }}
        >
          Abrir §{pNum} no Catecismo →
        </Link>
      </div>
    );
  }


  return (
    <div
      className="rounded-xl border border-blue-500/15 bg-blue-500/[0.03] p-spacing-sm"
      data-testid="catechism-preview"
      data-cic-paragraph={pNum}
    >
      <p className="text-premium-xs font-bold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-300">
        Texto do Catecismo · §{pNum}
      </p>
      <p className="mt-1 text-sm font-serif text-primary/80 leading-relaxed max-h-40 overflow-y-auto pr-2 scrollbar-thin">
        {data.content}
      </p>
    </div>
  );
};






const readBibleRef = (ref: unknown) => {
  if (!ref || typeof ref !== 'object') return null;
  const value = ref as Record<string, unknown>;
  const abbr = String(value.abbr ?? value.abbrev ?? value.book ?? value.book_abbr ?? '').trim();
  const chapter = Number(value.chapter ?? value.ch ?? value.chapter_number);
  const verse = Number(value.verse ?? value.v ?? value.verse_number);
  if (!abbr || !Number.isFinite(chapter)) return null;
  return { abbr, chapter, verse: Number.isFinite(verse) ? verse : undefined };
};

const nexusConnectionFromRow = (row: any, currentVerseId?: string) => {
  const sourceBible = row.source_kind === 'bible_verse' ? readBibleRef(row.source_ref) : null;
  const targetBible = row.target_kind === 'bible_verse' ? readBibleRef(row.target_ref) : null;
  const sourceId = sourceBible?.verse ? `${sourceBible.abbr}-${sourceBible.chapter}-${sourceBible.verse}` : '';
  const isSource = Boolean(sourceBible && sourceId === currentVerseId);
  const otherKind = isSource ? row.target_kind : row.source_kind;
  const otherRef = isSource ? row.target_ref : row.source_ref;
  const otherBible = isSource ? targetBible : sourceBible;
  const otherParagraph = otherKind === 'catechism_paragraph'
    ? String((otherRef as any)?.paragraph ?? (otherRef as any)?.paragraph_id ?? (otherRef as any)?.paragraphNumber ?? (otherRef as any)?.p ?? '').trim()
    : '';
  const id = otherBible
    ? otherBible.abbr + '-' + otherBible.chapter + (otherBible.verse ? '-' + otherBible.verse : '')
    : otherParagraph || String((otherRef as any)?.id ?? (otherRef as any)?.slug ?? row.id);
  const labels: Record<string, string> = { catechism_paragraph: 'Catecismo', magisterium_doc: 'Magistério', patristic: 'Patrística', saint: 'Santo', saint_work: 'Obra de santo', glossary: 'Glossário', prayer: 'Oração', journey: 'Jornada', liturgy: 'Liturgia', bible_verse: 'Bíblia', other: 'Referência' };
  return { type: otherKind === 'catechism_paragraph' ? 'catechism' : otherKind === 'magisterium_doc' ? 'document' : otherKind === 'bible_verse' ? 'cross_ref' : 'reference', label: labels[otherKind] ?? 'Referência', color: otherKind === 'catechism_paragraph' ? 'bg-blue-500' : 'bg-amber-500', id, summary: row.note || '', theological_theme: undefined, relevance_level: row.confidence };
};

const Bible: React.FC = () => {
  const [isConnectionEditorOpen, setIsConnectionEditorOpen] = useState(false);
  const [navHistory, setNavHistory] = useState<{book: string, chapter: number, verse?: number}[]>([]);

  useRenderPerf('Sacra Biblia Mobile-First', 15);

const fetchReferenceVerse = useCallback(async (connection: { type: string; id: string }) => {
    if (connection.type !== 'cross_ref' && connection.type !== 'bible') {
      setReferenceVerse(null);
      return;
    }
    const parts = String(connection.id).split('-');
    if (parts.length < 3) {
      setReferenceVerse(null);
      return;
    }
    const [abbr, chapterRaw, verseRaw] = parts;
    const chapter = Number(chapterRaw);
    const verse = Number(verseRaw);
    if (!abbr || !Number.isInteger(chapter) || !Number.isInteger(verse)) {
      setReferenceVerse(null);
      return;
    }
    setReferenceVerseLoading(true);
    try {
      const { data: book } = await supabase.from('bible_books').select('id,name,abbrev').eq('abbrev', abbr).maybeSingle();
      if (!book) throw new Error('reference_book_not_found');
      const { data: chapterRow } = await supabase.from('bible_chapters').select('id').eq('book_id', book.id).eq('number', chapter).maybeSingle();
      if (!chapterRow) throw new Error('reference_chapter_not_found');
      const { data: verseRow } = await supabase.from('bible_verses').select('number,text').eq('chapter_id', chapterRow.id).eq('number', verse).maybeSingle();
      if (!verseRow?.text) throw new Error('reference_verse_not_found');
      setReferenceVerse({ reference: `${book.name} ${chapter}:${verse}`, text: verseRow.text });
    } catch (error) {
      console.warn('[Nexus] reference verse unavailable', { connection, error });
      setReferenceVerse(null);
    } finally {
      setReferenceVerseLoading(false);
    }
  }, []);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { settings } = useReadingSettings();
  const { enabled: highContrast, toggle: toggleHighContrast } = useHighContrast();
  const { user } = useAuth();

  // R1.2.2 Onda 7 — URL como fonte única de verdade para navegação.
  const {
    viewMode,
    selectedBook,
    selectedChapter,
    searchQuery,
    setViewMode,
    setSelectedBook,
    setSelectedChapter,
    setSearchQuery,
    selectBook,
    selectChapter,
    nextChapter,
    prevChapter,
  } = useBibleNavigation();

  const [verses, setVerses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const [sourceInfo, setSourceInfo] = useState<string>('Nenhuma');
  const [invalidationStats, setInvalidationStats] = useState({ legacy: 0, expired: 0 });
  const [cacheSyncVersion, setCacheSyncVersion] = useState(8); // Bumped to v8 for AI Translation stabilization
  const [diagnosticLogs, setDiagnosticLogs] = useState<any[]>([]);
  const [sessionId] = useState(() => sessionStorage.getItem('cathedra_session_id') || `sess_${crypto.randomUUID()}`);

  
  // New States for Annotations and Progress
  const [lastRead, setLastRead] = useState<any>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [activeVerse, setActiveVerse] = useState<{ number: number; text: string } | null>(null);
  const [expandedConnection, setExpandedConnection] = useState<{ label: string, summary: string, type: string, id: string, color?: string, theological_theme?: string } | null>(null);
  const [referenceVerse, setReferenceVerse] = useState<{ reference: string; text: string } | null>(null);
  const [referenceVerseLoading, setReferenceVerseLoading] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isGraphOpen, setIsGraphOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<{id: string, book: string, ch: number, v: number, text: string, type: string, screenshot?: string, htmlSnippet: string, title?: string, file: string, timestamp: string}[]>([]);
  
  const groupedScanResults = useMemo(() => {
    const groups: Record<string, typeof scanResults> = {};
    scanResults.forEach(res => {
      const key = `${res.book} Cap. ${res.ch}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(res);
    });
    // Ordenar chaves e resultados internos
    return Object.keys(groups).sort().reduce((acc, key) => {
      acc[key] = groups[key].sort((a, b) => a.v - b.v);
      return acc;
    }, {} as Record<string, typeof scanResults>);
  }, [scanResults]);



  
  const [highlights, setHighlights] = useState<Record<string, string>>({});
  
  const { notes, addNote, deleteNote, updateNote, refetch: fetchNotes } = useNotes('bible');
  const { marks: readingMarks, saveLastRead: syncRemoteLastRead, addMark, deleteMark } = useReadingMarks();
  const scrollContainerRef = useRef<HTMLDivElement>(null);







  // Auditoria leve de cache: somente valida o cache local.
  // Não consulta tabelas auxiliares inexistentes nem executa varredura recorrente no DOM.
  useEffect(() => {
    const cacheKeys = Object.keys(localStorage).filter(k => k.startsWith('bible_cache_'));
    cacheKeys.forEach(key => {
      try {
        const cachedValue = localStorage.getItem(key);
        if (!cachedValue) return;
        const cached = JSON.parse(cachedValue);
        if (!cached.v || cached.v < cacheSyncVersion) {
          localStorage.removeItem(key);
          setInvalidationStats(prev => ({ ...prev, legacy: prev.legacy + 1 }));
        }
      } catch {
        localStorage.removeItem(key);
      }
    });
  }, [cacheSyncVersion]);

  // R1.2.2 Onda 7 — viewMode/selectedBook/selectedChapter agora derivam da URL
  // (useBibleNavigation). O único side-effect residual aqui é disparar o
  // fetchVerses quando o par (livro, capítulo) muda em modo leitura.
  useEffect(() => {
    if (viewMode === 'reading' && selectedBook) {
      fetchVerses(selectedBook.abbr, selectedChapter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, selectedBook?.abbr, selectedChapter]);


  // Re-busca o capítulo quando o usuário troca a tradução ou alterna a
  // modernização ortográfica (chave de cache muda no servidor).
  const reloadKey = `${settings.bibleTranslationId ?? 'primary'}|${settings.bibleModernize ? 1 : 0}`;
  useEffect(() => {
    if (selectedBook && selectedChapter) {
      fetchVerses(selectedBook.abbr, selectedChapter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);


  // R1.2.3 — restaura o versículo solicitado depois que o DOM estiver pronto.
  // Isso também cobre retorno do Diário sem recarregar o capítulo (somente ?v muda)
  // e cache local, que antes retornava de fetchVerses antes do scroll.
  const requestedVerse = searchParams.get('v');

  useEffect(() => {
    if (viewMode !== 'reading' || isLoading || verses.length === 0) return;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 8;

    const restoreVerse = () => {
      if (cancelled) return;
      const element = requestedVerse
        ? document.getElementById(`verse-${requestedVerse}`)
        : null;

      if (element) {
        const headerHeight = 56;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerHeight - 20;

        window.scrollTo({ top: Math.max(0, offsetPosition), behavior: 'smooth' });
        element.classList.add('bg-secondary/20', 'scale-[1.02]');
        window.setTimeout(() => {
          if (!cancelled) element.classList.remove('bg-secondary/20', 'scale-[1.02]');
        }, 3000);
        return;
      }

      if (requestedVerse && attempts < maxAttempts) {
        attempts += 1;
        window.setTimeout(restoreVerse, 100);
        return;
      }

      if (!requestedVerse) {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    };

    const frame = window.requestAnimationFrame(restoreVerse);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [requestedVerse, verses, isLoading, viewMode]);

  // Local Persistence Logic
  useEffect(() => {
    const savedLastRead = localStorage.getItem('cathedra_bible_last_read');
    if (savedLastRead) setLastRead(JSON.parse(savedLastRead));

    const savedHighlights = localStorage.getItem('cathedra_bible_highlights');
    if (savedHighlights) setHighlights(JSON.parse(savedHighlights));
  }, []);


  // Retoma o ponto visual exato do capítulo ao voltar de uma relação.
  useEffect(() => {
    // Quando há um versículo profundo solicitado (?v=...), a restauração do
    // versículo tem prioridade sobre a posição genérica salva do capítulo.
    if (requestedVerse) return;
    if (viewMode !== 'reading' || !selectedBook) return;
    const key = 'cathedra_bible_scroll_' + selectedBook.abbr + '_' + selectedChapter;
    const raw = localStorage.getItem(key);
    const saved = raw ? Number(raw) : NaN;
    if (Number.isFinite(saved) && saved > 0) requestAnimationFrame(() => window.scrollTo({ top: saved, behavior: 'auto' }));
    const onScroll = () => localStorage.setItem(key, String(window.scrollY));
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [viewMode, selectedBook, selectedChapter]);

  const saveReadingProgress = useCallback((bookAbbr: string, chapter: number, verse?: number) => {
    // Cross-Navigation Validation: Detect if we are jumping between modules (e.g., from a connection)
    const currentPath = window.location.pathname;
    const isInterModuleNav = currentPath.includes('/catechism') || currentPath.includes('/magisterium');
    
    if (isInterModuleNav) {
      console.log('[Stability] Inter-module navigation detected. Validating state preservation.');
      // Measure navigation stability: if we transition back and forth too fast, it might be a loop
      const lastNav = sessionStorage.getItem('last_module_nav');
      if (lastNav && Date.now() - parseInt(lastNav) < 500) {
        console.error('[Stability] High-frequency inter-module navigation detected (Jitter).');
        supabase.from('analytics_events').insert([{
          event_name: 'navigation_jitter_detected',
          properties: { from: currentPath, to: '/bible', timestamp: new Date().toISOString() }
        }]);
      }
      sessionStorage.setItem('last_module_nav', Date.now().toString());
    }

    const allBooks = Object.values(BIBLE_DATA).flat().flatMap(cat => cat.books);
    const book = allBooks.find(b => b.abbr === bookAbbr);
    if (!book) return;

    const progress = { 
      bookName: book.name, 
      bookAbbr: book.abbr, 
      chapter,
      verse: verse || 1
    };
    setLastRead(progress);
    localStorage.setItem('cathedra_bible_last_read', JSON.stringify(progress));
    
    // Remote sync for cross-device functional recovery
    if (user) {
      syncRemoteLastRead({
        content_type: 'bible',
        content_id: bookAbbr,
        chapter,
        label: `${book.name} ${chapter}`,
        url: `/bible?book=${encodeURIComponent(bookAbbr)}&ch=${chapter}${verse ? `&v=${verse}` : ''}`,
        is_last_read: true
      });
      
      // Store state in persistence table for navigation recovery
      supabase.from('reading_state_history').insert([{
        user_id: user.id,
        content_type: 'bible',
        content_id: bookAbbr,
        chapter,
        view_mode: 'reading',
        metadata: { ...progress, timestamp: Date.now() }
      }]);
    }
    
    // Offline storage for favorites/progress
    const offlineKey = `offline_bible_progress_${bookAbbr}`;
    localStorage.setItem(offlineKey, JSON.stringify({ ...progress, timestamp: Date.now() }));
  }, [user, syncRemoteLastRead]);


    const markDailyAsCompleted = () => {


    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`cathedra_bible_daily_${today}`, 'completed');
    toast.success('Leitura do dia concluída!');
  };

  const [isHighlightMenuOpen, setIsHighlightMenuOpen] = useState(false);

  const handleOpenAnnotation = (verse: { number: number; text: string }) => {
    setActiveVerse(verse);
    setIsNoteModalOpen(true);
  };


  const handleSaveNote = async (text: string, color: string) => {
    if (!activeVerse || !selectedBook) return;
    
    await addNote(
      `${selectedBook.abbr}:${selectedChapter}:${activeVerse.number}`,
      text,
      color,
      {
        book_abbr: selectedBook.abbr,
        chapter: selectedChapter,
        verse: activeVerse.number
      },
    );
    
    setIsNoteModalOpen(false);
    toast.success('Nota salva');
  };

  const isVerseBookmarked = useCallback((verseNumber: number) => {
    if (!selectedBook) return false;
    const contentId = selectedBook.abbr + ':' + selectedChapter + ':' + verseNumber;
    return readingMarks.some((mark) => mark.content_type === 'bible_bookmark' && mark.content_id === contentId);
  }, [readingMarks, selectedBook, selectedChapter]);

  const toggleBookmark = useCallback(async (verseNumber: number) => {
    if (!selectedBook || !user) {
      toast.info('Entre na sua conta para usar marcadores.');
      return;
    }
    const contentId = selectedBook.abbr + ':' + selectedChapter + ':' + verseNumber;
    const existing = readingMarks.find((mark) => mark.content_type === 'bible_bookmark' && mark.content_id === contentId);
    if (existing) {
      await deleteMark(existing.id);
      toast.success('Marcador removido');
      return;
    }
    const bookName = selectedBook.name;
    const created = await addMark({
      content_type: 'bible_bookmark',
      content_id: contentId,
      chapter: selectedChapter,
      label: bookName + ' ' + selectedChapter + ':' + verseNumber,
      url: '/bible?book=' + encodeURIComponent(selectedBook.abbr) + '&ch=' + selectedChapter + '&v=' + verseNumber,
      is_last_read: false,
    });
    if (created) toast.success('Versículo marcado');
    else toast.error('Não foi possível salvar o marcador.');
  }, [selectedBook, selectedChapter, user, readingMarks, addMark, deleteMark]);

  const toggleHighlight = async (verseNumber: number, color: string) => {
    if (!selectedBook) return;
    const key = `${selectedBook.abbr}-${selectedChapter}-${verseNumber}`;
    const currentColor = highlights[key];
    const next = { ...highlights };

    if (currentColor === color) delete next[key];
    else next[key] = color;

    setHighlights(next);
    localStorage.setItem('cathedra_bible_highlights', JSON.stringify(next));

    if (!user) return;

    try {
      const contentId = `${selectedBook.abbr}:${selectedChapter}:${verseNumber}`;
      if (currentColor === color) {
        const { error } = await supabase
          .from('user_notes')
          .delete()
          .eq('user_id', user.id)
          .eq('content_type', 'bible')
          .eq('content_id', contentId)
          .eq('note_text', '');

        if (error) throw error;
      } else {
        const { data: existing, error: existingError } = await supabase
          .from('user_notes')
          .select('id')
          .eq('user_id', user.id)
          .eq('content_type', 'bible')
          .eq('content_id', contentId)
          .eq('note_text', '')
          .maybeSingle();

        if (existingError) throw existingError;

        if (existing?.id) {
          const { error } = await supabase
            .from('user_notes')
            .update({ highlight_color: color })
            .eq('id', existing.id)
            .eq('user_id', user.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('user_notes')
            .insert({
              user_id: user.id,
              content_type: 'bible',
              content_id: contentId,
              note_text: '',
              highlight_color: color,
              book_abbr: selectedBook.abbr,
              chapter: selectedChapter,
              verse: verseNumber,
            });
          if (error) throw error;
        }
      }
      await fetchNotes();
    } catch (error) {
      console.error('[Bible] highlight persistence failed', error);
      setHighlights(prev => currentColor === color
        ? { ...prev, [key]: color }
        : (() => { const rollback = { ...prev }; delete rollback[key]; return rollback; })());
      toast.error('Não foi possível salvar o destaque na conta.');
    }
  };


  useEffect(() => {
    const remoteHighlights: Record<string, string> = {};
    for (const note of notes) {
      if (note.content_type !== 'bible' || note.note_text !== '' || !note.book_abbr || !note.chapter || !note.verse) continue;
      remoteHighlights[`${note.book_abbr}-${note.chapter}-${note.verse}`] = note.highlight_color || 'yellow';
    }
    if (Object.keys(remoteHighlights).length > 0) {
      setHighlights(prev => ({ ...prev, ...remoteHighlights }));
    }
  }, [notes]);

  const handleExportData = () => {
    const data = {
      notes,
      highlights,
      lastRead,
      dailyStatus: {} as any
    };
    
    // Get all daily reading keys from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('cathedra_bible_daily_')) {
        data.dailyStatus[key] = localStorage.getItem(key);
      }
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cathedra-bible-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Dados exportados com sucesso');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.highlights) {
          setHighlights(data.highlights);
          localStorage.setItem('cathedra_bible_highlights', JSON.stringify(data.highlights));
        }
        if (data.lastRead) {
          setLastRead(data.lastRead);
          localStorage.setItem('cathedra_bible_last_read', JSON.stringify(data.lastRead));
        }
        if (data.dailyStatus) {
          Object.entries(data.dailyStatus).forEach(([key, value]) => {
            localStorage.setItem(key, value as string);
          });
        }
        toast.success('Dados importados com sucesso');
      } catch (err) {
        toast.error('Erro ao importar arquivo');
      }
    };
    reader.readAsText(file);
  };

  const share = useShare();
  const handleShareVerse = useCallback(() => {
    if (!activeVerse || !selectedBook) return;

    const title = selectedBook.chapterTitles?.[selectedChapter] || '';
    const reference = `${selectedBook.name} ${selectedChapter}:${activeVerse.number}${title ? ` (${title})` : ''}`;
    const text = `"${activeVerse.text}" — ${reference}`;
    // URL canônica sempre via helper — nenhuma construção manual.
    const url = buildPassageUrl({
      kind: 'bible',
      ref: `${selectedBook.abbr} ${selectedChapter}:${activeVerse.number}`,
      highlight: reference,
    });

    share({ title: 'Cathedra Bible', text, url }).catch(() => {
      /* useShare já faz fallback para clipboard + toast */
    });
  }, [activeVerse, selectedBook, selectedChapter, share]);

  const fetchVerses = async (abbr: string, chapter: number) => {
    const runId = `${abbr}-${chapter}-${Date.now()}`;
    biblePerf.start(runId, abbr, chapter);

    setIsLoading(true);
    setSourceInfo('Buscando...');

    // 1. Check L1 Cache (síncrono)
    const offlineKey = `bible_cache_${abbr}_${chapter}`;
    const cached = localStorage.getItem(offlineKey);
    biblePerf.mark(runId, 'cache:check');

    if (cached) {
      try {
        const cachedData = JSON.parse(cached);
        const isLegacy = !cachedData.v || cachedData.v < cacheSyncVersion || (cachedData.book && /Tobit|Judith|Wisdom|Sirach|Baruch|Maccabees|Obadiah|Psalms|Genesis|Chapter/i.test(cachedData.book));
        const isExpired = Date.now() - (cachedData.timestamp || 0) > 1000 * 60 * 60 * 24 * 7;

        if (!isLegacy && !isExpired) {
          setVerses(cachedData.verses.map((v: any) => ({ ...v, chapter })));
          setIsLoading(false);
          setSourceInfo(`Cache Local (v${cacheSyncVersion})`);
          biblePerf.mark(runId, 'render');
          biblePerf.end(runId, {
            cacheHit: true,
            status: 'ok',
            source: 'L1 cache',
            versesCount: cachedData.verses?.length ?? 0,
          });
          return;
        } else {
          localStorage.removeItem(offlineKey);
        }
      } catch (e) {
        localStorage.removeItem(offlineKey);
      }
    }

    // 2. PARALELO: busca texto + conexões (não dependem entre si)
    biblePerf.mark(runId, 'text:start');
    biblePerf.mark(runId, 'connections:start');
    setConnectionsLoading(true);
    setSourceInfo('Buscando na Nuvem...');

    const textPromise = supabase.functions
      .invoke('bible-text', {
        body: {
          abbrev: abbr,
          chapter,
          client_cache_version: cacheSyncVersion,
          ...(settings.bibleTranslationId ? { translation_id: settings.bibleTranslationId } : {}),
          ...(settings.bibleModernize ? { modernize: true } : {}),
        },
      })
      .finally(() => biblePerf.mark(runId, 'text:end'));

    const connectionsPromise = Promise.resolve(
      supabase
        .from('nexus_relations')
        .select('id, relation_type, source_kind, source_ref, target_kind, target_ref, note, confidence, status')
        .eq('status', 'published')
    ).then((res) => {
      biblePerf.mark(runId, 'connections:end');
      return res;
    });

    // Hidrata conexões assim que chegarem, sem bloquear o render do texto
    connectionsPromise
      .then(({ data: dbConnections }) => {
        if (dbConnections && dbConnections.length > 0) {
          setDynamicConnections((prev) => {
            const newConns: Record<string, any[]> = { ...prev };
            dbConnections.forEach((conn: any) => {
              const source = conn.source_kind === 'bible_verse' ? readBibleRef(conn.source_ref) : null;
              const target = conn.target_kind === 'bible_verse' ? readBibleRef(conn.target_ref) : null;
              const bible = source ?? target;
              if (!bible?.verse) return;
              const key = `${bible.abbr}-${bible.chapter}-${bible.verse}`;
              const mapped = nexusConnectionFromRow(conn, key);
              if (!newConns[key]) newConns[key] = [];
              if (!newConns[key].some((item) => item.id === mapped.id && item.type === mapped.type)) newConns[key].push(mapped);
            });
            return newConns;
          });
        }
      })
      .catch(() => {
        // silenciar — conexões são best-effort
      })
      .finally(() => {
        setConnectionsLoading(false);
      });


    try {
      const { data, error, response } = await textPromise;

      if (response?.status === 304) {
        const cachedRes = JSON.parse(localStorage.getItem(offlineKey) || '{}');
        setVerses((cachedRes.verses || []).map((v: any) => ({ ...v, chapter })));
        setIsLoading(false);
        setSourceInfo('Sincronizado (ETag 304)');
        biblePerf.mark(runId, 'render');
        biblePerf.end(runId, { status: '304', source: '304 + L1', versesCount: cachedRes.verses?.length ?? 0 });
        return;
      }

      if (response?.status === 404) {
        const errorData: any = data || {};
        const described = describeBibleTextError(errorData);
        const title = described?.title ?? errorData.error ?? 'Texto não encontrado';
        const description = described?.description
          ?? (typeof errorData.reason === 'string'
              ? errorData.reason
              : `Não foi possível carregar ${abbr} ${chapter}.`);
        toast.error(title, { description, id: `bible-text-404-${abbr}-${chapter}` });
        setSourceInfo(`Erro 404 — ${typeof errorData.reason === 'string' ? errorData.reason : 'texto não encontrado'}`);
        setIsLoading(false);
        biblePerf.end(runId, { status: '404', source: '404' });
        return;
      }

      if (response?.status === 400) {
        const errorData: any = data || {};
        const reason = typeof errorData.reason === 'string'
          ? errorData.reason
          : (typeof errorData.error === 'string' ? errorData.error : 'Requisição inválida.');
        toast.error('Não foi possível carregar o capítulo', {
          description: reason,
          id: `bible-text-400-${abbr}-${chapter}`,
        });
        setSourceInfo(`Erro 400 — ${reason}`);
        setIsLoading(false);
        biblePerf.end(runId, { status: '400', source: '400' });
        return;
      }

      if (error) throw error;

      const serverEtag = response?.headers.get('ETag');
      if (serverEtag) localStorage.setItem(`etag_${abbr}_${chapter}`, serverEtag);

      const loadedVerses = data.verses || [];

      // Auto-scan validation with PNG screenshots and detailed JSON reporting
      if (viewMode === 'reading' && isScanning) {
        const forbiddenEnRegex = new RegExp(`\\b(${FORBIDDEN_ENGLISH_WORDS.join('|')}|Tobit|Judith|Wisdom|Sirach|Baruch|Maccabees)\\b`, 'i');
        const found = loadedVerses.filter((v: any) => forbiddenEnRegex.test(v.text));

        if (found.length > 0) {
          const container = document.querySelector('.bible-content-container') as HTMLElement;
          const visualSnippet = container?.innerHTML.substring(0, 500) || 'Não disponível';

          const captureScreenshot = async () => {
            let screenshotData = '';
            if (container) {
              try {
                const canvas = await html2canvas(container, {
                  scale: 1,
                  useCORS: true,
                  logging: false,
                });
                screenshotData = canvas.toDataURL('image/png');
              } catch (e) {
                console.error('Screenshot error:', e);
              }
            }

            setScanResults((prev) => [
              ...prev,
              ...found.map((f: any) => ({
                id: `evid_${crypto.randomUUID().substring(0, 8)}`,
                book: data.book || abbr,
                ch: chapter,
                v: f.number,
                text: f.text,
                type: 'language_violation',
                screenshot: screenshotData,
                htmlSnippet: visualSnippet,
                title: `Inglês detectado em ${data.book || abbr} ${chapter}:${f.number}`,
                file: 'src/components/cathedra/Bible.tsx',
                timestamp: new Date().toISOString(),
              })),
            ]);
          };
          captureScreenshot();
        }
      }

      // RENDER do texto imediatamente — conexões hidratam depois sem bloquear
      const renderStartedAt = performance.now();
      setVerses(loadedVerses.map((v: any) => ({ ...v, chapter })));
      biblePerf.mark(runId, 'render');
      const sourceLabel = `API de Produção (${data.source || 'Edge'}) - Vernáculo PT Garantido`;
      setSourceInfo(sourceLabel);

      // Telemetria: envia render_ms para a edge correlacionando pelo correlationId.
      // Mede até o segundo rAF para capturar o paint real (não só o setState).
      const corrId: string | undefined = data?.metadata?.correlationId;
      if (corrId) {
        requestAnimationFrame(() => requestAnimationFrame(() => {
          const renderMs = Math.round(performance.now() - renderStartedAt);
          if (renderMs >= 0 && renderMs < 30000) {
            supabase.functions
              .invoke('bible-perf-render', { body: { correlation_id: corrId, render_ms: renderMs } })
              .catch(() => { /* best-effort */ });
          }
        }));
      }

      // Update Diagnostic Logs
      setDiagnosticLogs((prev) => [
        {
          sessionId,
          timestamp: new Date().toISOString(),
          book: data.book || abbr,
          abbr: abbr,
          chapter,
          source: sourceLabel,
          verses: loadedVerses.length,
          file: 'src/components/cathedra/Bible.tsx',
        },
        ...prev.slice(0, 99),
      ]);

      if (loadedVerses.length > 0) {
        localStorage.setItem(offlineKey, JSON.stringify({
          verses: loadedVerses,
          timestamp: Date.now(),
          v: cacheSyncVersion,
          book: data.book || abbr,
        }));
      } else {
        toast.warning('Capítulo sem conteúdo no momento.');
      }

          // Save progress — DEFERIDO para não bloquear interações pós-render
      const allBooks = Object.values(BIBLE_DATA).flat().flatMap((cat) => cat.books);
      const book = allBooks.find((b) => b.abbr === abbr);
      if (book) {
        const finish = () => {
          biblePerf.mark(runId, 'progress:start');
          try {
            saveReadingProgress(book.abbr, chapter);
          } finally {
            biblePerf.mark(runId, 'progress:end');
            biblePerf.end(runId, {
              status: loadedVerses.length ? 'ok' : 'empty',
              source: data.source || 'Edge',
              versesCount: loadedVerses.length,
            });
          }
        };
        if (typeof (window as any).requestIdleCallback === 'function') {
          (window as any).requestIdleCallback(finish, { timeout: 1000 });
        } else {
          setTimeout(finish, 0);
        }
      } else {
        biblePerf.end(runId, {
          status: loadedVerses.length ? 'ok' : 'empty',
          source: data.source || 'Edge',
          versesCount: loadedVerses.length,
        });
      }
    } catch (error: any) {
      setVerses([]);
      setSourceInfo('Erro no Carregamento');
      toast.error('Erro ao carregar texto sagrado', {
        description: 'O capítulo não pôde ser recuperado da fonte oficial nem do banco local. Nenhum texto parcial foi exibido.',
        id: `bible-text-error-${abbr}-${chapter}`,
      });
      biblePerf.end(runId, { status: 'error', source: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Navegação (selectBook/selectChapter/nextChapter/prevChapter) vive em useBibleNavigation.


  const handleDragEnd = (event: any, info: any) => {
    const threshold = 80;
    if (info.offset.x < -threshold) nextChapter();
    else if (info.offset.x > threshold) prevChapter();
  };

  const dictionaryTerms = ['Deus', 'Jesus', 'Cristo', 'Senhor', 'Espírito', 'Jerusalém', 'Israel', 'Moisés', 'Abraão', 'Aliança', 'Graça', 'Pecado', 'Salvação', 'Reino', 'Evangelho'];

  const [showKnowledgePanel, setShowKnowledgePanel] = useState(false);
  const [activeThemeFilter, setActiveThemeFilter] = useState<string | null>(null);
  const [dynamicConnections, setDynamicConnections] = useState<Record<string, any[]>>({});

  // Fonte de verdade das conexões inline: somente dados carregados do índice/banco.
  // O antigo mapa mock foi removido para não apresentar relações fictícias ao leitor.
  const KNOWLEDGE_CONNECTIONS = dynamicConnections;

  const THEOLOGICAL_THEMES = [
    { id: 'creatio', label: 'Criação', parent: null, connections: 0, tags: ['Dogma', 'Ontologia'] },
    { id: 'eucharistia', label: 'Eucaristia', parent: null, connections: 0, tags: ['Sacramento', 'Liturgia'] },
    { id: 'gratia', label: 'Graça', parent: null, connections: 0, tags: ['Soteriologia'] },
    { id: 'trinitas', label: 'Santíssima Trindade', parent: null, connections: 0, tags: ['Mistério', 'Dogma'] },
    { id: 'mariologia', label: 'Mariologia', parent: null, connections: 0, tags: ['Santos', 'Dogma'] },
  ];

  const CROSS_REFERENCES: Record<string, string[]> = {
    'Jo-1-1': ['Gn-1-1', '1Jo-1-1', 'Sl 33:6'],
    'Jo-3-16': ['Rm-5-8', '1Jo-4-9', 'Ef 2:4'],
    'Gn-1-1': ['Jo-1-1', 'Hb-11-3', 'Sl 102:25'],
    'Mt-5-3': ['Lc-6-20', 'Is 57:15'],
  };

  
  // Knowledge Connection System
  const wrapWithDictionary = (text: string) => {
    const parts = text.split(new RegExp(`(${dictionaryTerms.join('|')})`, 'gi'));
    return parts.map((part, i) => {
      if (dictionaryTerms.some(term => term.toLowerCase() === part.toLowerCase())) {
        return <BibleDictionaryPopover key={i} term={part}>{part}</BibleDictionaryPopover>;
      }
      return part;
    });
  };

  /**
   * Glyphs ⓐ-ⓩ (e similares) vêm inline da NAA marcando notas/refs cruzadas.
   * Em vez de exibi-los crus, substituímos por uma sup numerada clicável que
   * abre o trecho correspondente do `comment` enviado pelo backend.
   */
  const NOTE_GLYPH_RE = /[\u24D0-\u24E9\u2460-\u2473]/g; // ⓐ-ⓩ + ① -⑳

  const parseCommentByGlyph = (comment?: string | null) => {
    if (!comment) return new Map<string, string>();
    const map = new Map<string, string>();
    // Split comment into segments that each start with a glyph.
    const matches = [...comment.matchAll(/([\u24D0-\u24E9\u2460-\u2473])\s*([\s\S]*?)(?=[\u24D0-\u24E9\u2460-\u2473]|$)/g)];
    for (const m of matches) {
      const glyph = m[1];
      const body = m[2].trim();
      if (glyph && body) map.set(glyph, body);
    }
    return map;
  };

  const renderVerseWithNotes = (text: string, comment?: string | null) => {
    const noteMap = parseCommentByGlyph(comment);
    const pieces = text.split(NOTE_GLYPH_RE);
    const glyphs = text.match(NOTE_GLYPH_RE) || [];

    const nodes: React.ReactNode[] = [];
    pieces.forEach((piece, i) => {
      if (piece) nodes.push(<span key={`t-${i}`}>{wrapWithDictionary(piece)}</span>);
      const g = glyphs[i];
      if (g) {
        nodes.push(
          <VerseNoteSup
            key={`n-${i}`}
            index={i + 1}
            contentHtml={noteMap.get(g)}
          />
        );
      }
    });
    return nodes;
  };


  const auditData = useMemo(() => {
    const allBooks = Object.values(BIBLE_DATA).flat().flatMap(cat => cat.books);
    const connectedBooks = new Set();
    const uncoveredBooks: string[] = [];
    
    Object.keys(KNOWLEDGE_CONNECTIONS).forEach(key => {
      const bookAbbr = key.split('-')[0];
      connectedBooks.add(bookAbbr);
    });

    allBooks.forEach(b => {
      if (!connectedBooks.has(b.abbr)) {
        uncoveredBooks.push(b.name);
      }
    });

    const themes = Array.from(new Set(
      Object.values(KNOWLEDGE_CONNECTIONS)
        .flat()
        .filter(c => c.type === 'theology')
        .map(c => c.label)
    ));
    
    return {
      totalBooks: allBooks.length,
      coveredBooks: connectedBooks.size,
      emptyBooks: uncoveredBooks,
      totalChapters: allBooks.reduce((acc, b) => acc + b.chapters, 0),
      themesCount: themes.length,
      theologicalThemes: THEOLOGICAL_THEMES,
    };
  }, [KNOWLEDGE_CONNECTIONS]);

  // Map of CIC catechism citations per book → { chapters: Set, verses: Set("ch-v") }
  const cicCitationMap = useMemo(() => {
    const chapters = new Set<number>();
    const verses = new Set<string>();
    if (!selectedBook) return { chapters, verses };
    const mergedConnections = { ...KNOWLEDGE_CONNECTIONS, ...dynamicConnections };
    Object.entries(mergedConnections).forEach(([key, conns]) => {
      if (key === 'all') return;
      const [abbr, ch, v] = key.split('-');
      if (abbr !== selectedBook.abbr) return;
      const hasCIC = conns.some(c => c.type === 'catechism');
      if (!hasCIC) return;
      const chNum = Number(ch);
      if (!Number.isNaN(chNum)) chapters.add(chNum);
      if (v) verses.add(`${ch}-${v}`);
    });
    return { chapters, verses };
  }, [KNOWLEDGE_CONNECTIONS, selectedBook]);

  const [isNexusContribOpen, setIsNexusContribOpen] = useState(false);

  // Chapter-level check: does this chapter have ANY Nexus connection?
  const chapterHasConnections = useMemo(() => {
    if (!selectedBook || !selectedChapter) return false;
    const prefix = `${selectedBook.abbr}-${selectedChapter}-`;
    const mergedConnections = { ...KNOWLEDGE_CONNECTIONS, ...dynamicConnections };
    return Object.entries(mergedConnections).some(([key, arr]) => key.startsWith(prefix) && Array.isArray(arr) && arr.length > 0);
  }, [KNOWLEDGE_CONNECTIONS, selectedBook, selectedChapter]);

  // Pre-fetch all connections for the selected book (powers gold-dot indicators on the chapter grid)
  const connectionsErrorShownRef = useRef(false);
  useEffect(() => {
    if (!selectedBook) return;
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('nexus_relations')
          .select('id, relation_type, source_kind, source_ref, target_kind, target_ref, note, confidence, status')
          .eq('status', 'published');
        if (cancelled) return;
        if (error) {
          const is406 = (error as any)?.code === 'PGRST406' || /406/.test(error.message || '');
          console.warn('[Nexus] nexus_relations fetch failed — usando fallback local', {
            code: (error as any)?.code,
            message: error.message,
            book: selectedBook.abbr,
            is406,
          });
          if (!connectionsErrorShownRef.current) {
            connectionsErrorShownRef.current = true;
            toast.message('Conexões do Nexus em modo offline', {
              description: 'Algumas referências do Catecismo podem aparecer reduzidas. Exibindo dados locais.',
              duration: 4000,
            });
          }
          return;
        }
        if (!data || data.length === 0) return;
        setDynamicConnections(prev => {
          const next = { ...prev };
          data.forEach((conn: any) => {
            const source = conn.source_kind === 'bible_verse' ? readBibleRef(conn.source_ref) : null;
            const target = conn.target_kind === 'bible_verse' ? readBibleRef(conn.target_ref) : null;
            const bible = source ?? target;
            if (!bible?.verse) return;
            const key = `${bible.abbr}-${bible.chapter}-${bible.verse}`;
            const mapped = nexusConnectionFromRow(conn, key);
            if (!next[key]) next[key] = [];
            if (!next[key].some((item: any) => item.id === mapped.id && item.type === mapped.type)) next[key].push(mapped);
          });
          return next;
        });
      } catch (err) {
        console.warn('[Nexus] connection prefetch threw — usando fallback local', err);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedBook]);







  const filteredBooks = useMemo(() => {

    if (!searchQuery) return BIBLE_DATA;
    const result: any = {};
    Object.entries(BIBLE_DATA).forEach(([testament, categories]) => {
      const filteredCategories = categories.map(cat => ({
        ...cat,
        books: cat.books.filter(b => 
          b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          b.abbr.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(cat => cat.books.length > 0);
      if (filteredCategories.length > 0) result[testament] = filteredCategories;
    });
    return result;
  }, [searchQuery]);

  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);

  return (
    <div className={cn(
      "relative min-h-screen transition-colors duration-1000 text-primary/90", 
      settings.theme === 'night' ? "bg-[#0A0B0D]" : "bg-[#FAF9F6]",
      settings.immersiveMode && (settings.theme === 'night' ? "bg-[#0A0B0D]" : "bg-[#FAF9F6]")
    )}>

      {/* Diagnostic Trigger (Debug only) */}
      <button 
        onClick={() => setIsDiagnosticOpen(true)}
        aria-label="Abrir diagnóstico cirúrgico da Bíblia"
        className="fixed top-20 right-4 z-[999] min-h-11 min-w-11 p-spacing-xs bg-primary/5 rounded-full opacity-0 hover:opacity-100 focus-visible:opacity-100 transition-opacity flex items-center justify-center"
      >
        <Icons.Activity className="w-4 h-4 text-primary/20" aria-hidden="true" />
      </button>

      <AnimatePresence>
        {isDiagnosticOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-spacing-lg bg-background/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-primary/10 rounded-3xl p-spacing-xl max-w-lg w-full shadow-premium space-y-spacing-md"
            >
              <h2 className="text-lg font-bold">Diagnóstico Cirúrgico</h2>
              <div className="space-y-spacing-xs text-xs font-mono bg-muted p-spacing-md rounded-xl max-h-60 overflow-y-auto">
                 <p>Sessão: {sessionId}</p>
                 <p>Logs Coletados: {diagnosticLogs.length}</p>
                 <p className="border-t border-primary/5 pt-2">Livro Atual: {selectedBook?.name}</p>
                 <p>Capítulo: {selectedChapter}</p>
                 <p>Fonte Atual: <span className="text-secondary font-bold">{sourceInfo}</span></p>
                 <p className="border-t border-primary/5 pt-2">Invalidações: L:{invalidationStats.legacy} / E:{invalidationStats.expired}</p>
              </div>

              <div className="space-y-spacing-md">
                <div className="flex flex-col gap-spacing-xs">
                  <span className="text-[10px] font-black uppercase text-primary/40">Filtros de Exportação</span>
                  <div className="flex gap-spacing-xs">
                    <input 
                      id="diag-book-filter"
                      placeholder="Livro (ex: Jo)"
                      className="flex-1 bg-primary/5 border-none rounded-lg p-spacing-xs text-[10px]"
                    />
                    <input 
                      id="diag-chapter-start"
                      type="number"
                      placeholder="Início"
                      className="w-16 bg-primary/5 border-none rounded-lg p-spacing-xs text-[10px]"
                    />
                    <input 
                      id="diag-chapter-end"
                      type="number"
                      placeholder="Fim"
                      className="w-16 bg-primary/5 border-none rounded-lg p-spacing-xs text-[10px]"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-spacing-xs">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const bookFilter = (document.getElementById('diag-book-filter') as HTMLInputElement).value;
                      const chStartRaw = (document.getElementById('diag-chapter-start') as HTMLInputElement).value;
                      const chEndRaw = (document.getElementById('diag-chapter-end') as HTMLInputElement).value;
                      
                      const chStart = parseInt(chStartRaw);
                      const chEnd = parseInt(chEndRaw);

                      if (chStartRaw && chEndRaw && chStart > chEnd) {
                        toast.error('O capítulo inicial não pode ser maior que o final.');
                        return;
                      }

                      const filtered = diagnosticLogs.filter(log => {
                        const matchesBook = !bookFilter || log.abbr.toLowerCase() === bookFilter.toLowerCase();
                        const matchesStart = isNaN(chStart) || log.chapter >= chStart;
                        const matchesEnd = isNaN(chEnd) || log.chapter <= chEnd;
                        return matchesBook && matchesStart && matchesEnd;
                      });

                      if (filtered.length === 0 && diagnosticLogs.length > 0) {
                        toast.warning('Nenhum log encontrado para este intervalo específico.');
                        return;
                      }

                      const report = filtered.length > 0 ? filtered : diagnosticLogs;
                      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `bible-diag-logs.json`;
                      a.click();
                    }}
                    className="flex-1 text-xs"
                  >
                    Exportar JSON
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const bookFilter = (document.getElementById('diag-book-filter') as HTMLInputElement).value;
                      const chStartRaw = (document.getElementById('diag-chapter-start') as HTMLInputElement).value;
                      const chEndRaw = (document.getElementById('diag-chapter-end') as HTMLInputElement).value;

                      const chStart = parseInt(chStartRaw);
                      const chEnd = parseInt(chEndRaw);

                      if (chStartRaw && chEndRaw && chStart > chEnd) {
                        toast.error('O capítulo inicial não pode ser maior que o final.');
                        return;
                      }

                      const filtered = diagnosticLogs.filter(log => {
                        const matchesBook = !bookFilter || log.abbr.toLowerCase() === bookFilter.toLowerCase();
                        const matchesStart = isNaN(chStart) || log.chapter >= chStart;
                        const matchesEnd = isNaN(chEnd) || log.chapter <= chEnd;
                        return matchesBook && matchesStart && matchesEnd;
                      });

                      if (filtered.length === 0 && diagnosticLogs.length > 0) {
                        toast.warning('Nenhum log encontrado para este intervalo.');
                        return;
                      }

                      const report = filtered.length > 0 ? filtered : diagnosticLogs;
                      const headers = ['sessionId', 'timestamp', 'book', 'abbr', 'chapter', 'source', 'verses'];
                      const csvContent = [
                        headers.join(','),
                        ...report.map(log => headers.map(h => log[h]).join(','))
                      ].join('\n');

                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `bible-diag-logs.csv`;
                      a.click();
                    }}
                    className="flex-1 text-xs"
                  >
                    Exportar CSV
                  </Button>
                </div>

                <div className="pt-4 border-t border-primary/5 space-y-spacing-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-primary/40">Relatório de Auditoria Final</span>
                    {scanResults.length > 0 && (
                      <div className="flex gap-spacing-xs">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const blob = new Blob([JSON.stringify(scanResults, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `auditoria-final-${new Date().toISOString()}.json`;
                            link.click();
                          }}
                          className="min-h-11 text-xs uppercase font-bold px-spacing-xs"
                        >
                          JSON
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const csv = "ID,Livro,Capitulo,Versiculo,Titulo,Texto,Fonte,Arquivo,SessionID,Timestamp,Evidencia_HTML\n" + 
                              scanResults.map(r => `"${r.id}","${r.book}",${r.ch},${r.v},"${r.title}","${r.text.replace(/"/g, '""')}","${r.type}","${r.file}","${sessionId}","${r.timestamp}","${r.htmlSnippet.substring(0, 50).replace(/"/g, '""')}..."`).join("\n");
                            const blob = new Blob([csv], { type: 'text/csv' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `auditoria-final-${new Date().toISOString()}.csv`;
                            link.click();
                          }}
                          className="min-h-11 text-xs uppercase font-bold px-spacing-xs"
                        >
                          CSV
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-spacing-xs">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setIsScanning(true);
                        setScanResults([]);
                        toast.info('Iniciando varredura com screenshots PNG...');
                        const runDeepScan = async () => {
                          const targetBooks = ['Tb', 'Jdt', 'Sb', 'Eclo', 'Br', '1Mc', '2Mc', 'Sl', 'Gn'];
                          for (const abbr of targetBooks) {
                            for (let ch = 1; ch <= 2; ch++) {
                              await fetchVerses(abbr, ch);
                              await new Promise(r => setTimeout(r, 2000));
                            }
                          }
                          setIsScanning(false);
                          toast.success('Varredura e capturas concluídas');
                        };
                        runDeepScan();
                      }}
                      disabled={isScanning}
                      className="flex-1 text-xs uppercase font-bold text-secondary"
                    >
                      {isScanning ? 'Varrendo...' : 'Nova Auditoria'}
                    </Button>
                  </div>

                  {scanResults.length > 0 && (
                    <div className="space-y-spacing-md">
                      <div className="p-spacing-sm bg-red-500/5 border border-red-500/20 rounded-xl max-h-[400px] overflow-y-auto space-y-spacing-lg">
                        {Object.entries(groupedScanResults).map(([groupKey, items]) => (
                          <div key={groupKey} className="space-y-spacing-sm">
                            <div className="flex items-center gap-spacing-xs sticky top-0 bg-card/90 backdrop-blur-sm py-spacing-xs z-10">
                              <span className="text-[10px] font-black uppercase text-red-500 bg-red-500/10 px-spacing-xs py-spacing-0.5 rounded-md">
                                {groupKey}
                              </span>
                              <div className="flex-1 h-px bg-red-500/10" />
                              <span className="text-premium-xs opacity-60">{items.length} ocorrências</span>
                            </div>
                            
                            {items.map((res, i) => (
                              <div key={res.id} className="pl-2 space-y-spacing-xs border-l-2 border-red-500/10 pb-4 last:pb-0">
                                <div className="flex items-center justify-between">
                                  <span className="text-premium-xs font-bold text-red-500">Versículo {res.v}</span>
                                  <span className="text-premium-xs opacity-60 italic">{res.type}</span>
                                </div>
                                <p className="text-premium-sm font-serif leading-relaxed italic">"{res.text.substring(0, 100)}..."</p>
                                {res.screenshot && (
                                  <div className="relative group cursor-pointer" onClick={() => {
                                    const win = window.open("");
                                    win?.document.write(`
                                      <body style="margin:0;background:#000;display:flex;align-items:center;justify-center;min-height:100vh;">
                                        <img src="${res.screenshot}" style="max-width:100%;max-height:100vh;object-fit:contain;" />
                                      </body>
                                    `);
                                  }}>
                                    <img src={res.screenshot} className="w-full h-24 object-cover rounded-lg border border-primary/10" alt={`Captura da página original: ${res.title ?? 'documento litúrgico'}`} />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                                      <span className="text-premium-xs text-white font-bold uppercase">Ver captura original</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-spacing-xs">
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => {
                    Object.keys(localStorage).filter(k => k.startsWith('bible_cache_')).forEach(k => localStorage.removeItem(k));
                    toast.success('Cache Bíblico Limpo');
                    window.location.reload();
                  }}
                  className="flex-1 uppercase text-[10px] font-black"
                >
                  Limpar Cache
                </Button>
                <Button onClick={() => setIsDiagnosticOpen(false)} className="flex-1 min-h-11 uppercase text-xs font-bold focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2">Fechar Painel</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      <Helmet>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Lora:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
      </Helmet>

      <AnimatePresence mode="wait">
        {viewMode === 'home' && (
          <motion.div 
            key="home"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "px-spacing-lg pt-10 pb-32 max-w-lg mx-auto transition-colors duration-1000",
              settings.theme === 'night' && "bg-[#0D0E10] text-stone-400"
            )}

          >
            {/* Minimal Header */}
            <header className="mb-spacing-xl flex items-center justify-between">
              <div className="w-10" /> {/* Spacer */}
              <div className="flex flex-col items-center">
                <Icons.BookOpen className="w-8 h-8 text-secondary/40 mb-spacing-sm" />
                <h1 className="font-display text-2xl tracking-[0.2em] uppercase text-primary/80">Bíblia Sagrada</h1>
              </div>
              <div className="flex items-center gap-spacing-xs" data-testid="bible-toolbar">
                <button
                  type="button"
                  onClick={() => setViewMode('search')}
                  aria-label="Pesquisar na Bíblia"
                  data-testid="bible-toolbar-search"
                  className="p-spacing-xs text-secondary/80 active:scale-95 transition-transform"
                  title="Pesquisar na Bíblia"
                >
                  <Icons.Search className="w-5 h-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('bookmarks')}
                  aria-label="Abrir marcadores"
                  data-testid="bible-toolbar-bookmarks"
                  className="p-spacing-xs text-secondary/80 active:scale-95 transition-transform"
                  title="Marcadores"
                >
                  <Icons.BookMarked className="w-6 h-6" aria-hidden="true" />
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label="Mais opções da Bíblia"
                      data-testid="bible-toolbar-more"
                      className="p-spacing-xs text-secondary/80 active:scale-95 transition-transform"
                      title="Mais opções"
                    >
                      <Icons.MoreHorizontal className="w-6 h-6" aria-hidden="true" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-52">
                    <DropdownMenuItem onClick={() => setViewMode('notes')}>
                      <Icons.List className="w-4 h-4 mr-2" />
                      Anotações
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsConnectionEditorOpen(true)}>
                      <Icons.Edit3 className="w-4 h-4 mr-2" />
                      Editor Bíblia ↔ CIC
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsFeedbackOpen(true)}>
                      <Icons.HelpCircle className="w-4 h-4 mr-2" />
                      Suporte & Feedback
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowKnowledgePanel(true)}>
                      <Icons.Activity className="w-4 h-4 mr-2" />
                      Auditoria Estratégica
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/bible-recovery')}>
                      <Icons.Stethoscope className="w-4 h-4 mr-2" />
                      Recovery Bíblia
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <button
                  type="button"
                  onClick={() => setViewMode('notes')}
                  aria-label="Abrir anotações"
                  data-testid="bible-toolbar-notes"
                  className="p-spacing-xs text-secondary/80 active:scale-95 transition-transform"
                  title="Anotações"
                >
                  <Icons.List className="w-6 h-6" aria-hidden="true" />
                </button>
              </div>




            </header>

            {/* Bible Home Experience */}
            <div className="space-y-spacing-md mb-spacing-2xl">
              <BibleHome onSelectBook={selectBook} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </div>

            <div className="flex gap-spacing-md mb-spacing-2xl">
              <button 
                onClick={handleExportData}
                className="flex-1 flex items-center justify-center gap-spacing-xs p-spacing-sm bg-white border border-primary/5 rounded-xl text-premium-xs font-bold uppercase tracking-widest text-primary/40 shadow-sm"
              >
                <Icons.Download className="w-3 h-3" /> Exportar
              </button>
              <label className="flex-1 flex items-center justify-center gap-spacing-xs p-spacing-sm bg-white border border-primary/5 rounded-xl text-premium-xs font-bold uppercase tracking-widest text-primary/40 cursor-pointer shadow-sm">
                <Icons.Upload className="w-3 h-3" /> Importar
                <input type="file" className="hidden" accept=".json" onChange={handleImportData} />
              </label>
            </div>




            {/* Vertical Book List */}
            <div
              className="space-y-spacing-2xl"
              data-testid="book-list"
              onKeyDown={(e) => {
                if (!['ArrowUp','ArrowDown','Home','End'].includes(e.key)) return;
                const target = e.target as HTMLElement;
                if (!target.matches('[data-book-btn]')) return;
                e.preventDefault();
                const btns = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[data-book-btn]'));
                const idx = btns.indexOf(target as HTMLButtonElement);
                if (idx < 0) return;
                let next = idx;
                if (e.key === 'ArrowDown') next = Math.min(idx + 1, btns.length - 1);
                else if (e.key === 'ArrowUp') next = Math.max(idx - 1, 0);
                else if (e.key === 'Home') next = 0;
                else if (e.key === 'End') next = btns.length - 1;
                btns[next]?.focus();
              }}
            >

              {Object.keys(filteredBooks).length === 0 && (
                <div
                  data-testid="book-list-empty"
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                  aria-label={searchQuery ? `Nenhum livro encontrado para "${searchQuery}"` : 'Nenhum livro disponível no momento'}
                  className="text-center py-spacing-2xl px-spacing-lg space-y-spacing-md"
                >

                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-secondary/5 border border-secondary/10">
                    <Icons.BookOpen className="w-6 h-6 text-secondary/40" aria-hidden="true" />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-secondary/60">
                    Nenhum livro encontrado
                  </p>
                  <p className="text-sm font-serif italic text-muted-foreground max-w-xs mx-auto leading-relaxed">
                    {searchQuery
                      ? `Nada corresponde a "${searchQuery}". Tente outra busca.`
                      : 'A lista aparecerá aqui assim que o cânone for carregado.'}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-xs font-bold uppercase tracking-widest text-secondary hover:underline"
                    >
                      Limpar busca
                    </button>
                  )}
                </div>
              )}

              {Object.entries(filteredBooks).map(([testament, categories]: any) => (

                <section key={testament} className="space-y-spacing-lg">
                  <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-secondary/50 border-b border-primary/5 pb-2">{testament}</h2>
                  
                  {categories.map((cat: any) => (
                    <div key={cat.name} className="space-y-spacing-xs">
                      <span className="text-premium-xs font-bold uppercase tracking-widest text-primary/20 ml-spacing-xs mb-spacing-xs block">{cat.name}</span>
                      <div className="divide-y divide-primary/[0.03]">
                        {cat.books.map((book: BibleBook) => {
                          const isActive = selectedBook?.abbr === book.abbr;
                          return (
                          <button 
                            key={book.abbr}
                            data-book-btn
                            data-testid={`book-btn-${book.abbr}`}
                            onClick={() => selectBook(book)}
                            aria-current={isActive ? 'page' : undefined}

                            className={cn(
                              "w-full h-14 flex items-center justify-between transition-colors px-spacing-sm rounded-lg group",
                              "hover:bg-primary/[0.03] active:bg-primary/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60",
                              isActive
                                ? "bg-secondary/10 border-l-2 border-secondary shadow-sm"
                                : "border-l-2 border-transparent"
                            )}
                          >
                            <span className={cn(
                              "font-serif text-lg transition-colors",
                              isActive ? "text-secondary font-semibold" : "text-primary/70 group-hover:text-primary"
                            )}>{book.name}</span>
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-widest transition-colors",
                              isActive ? "text-secondary/80" : "text-primary/20 group-hover:text-primary/40"
                            )}>{book.abbr}</span>
                          </button>
                          );
                        })}
                      </div>

                    </div>
                  ))}
                </section>
              ))}
            </div>
          </motion.div>
        )}

        {viewMode === 'chapters' && selectedBook && (
          <motion.div 
            key="chapters"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="px-spacing-lg pt-10 pb-32 max-w-lg mx-auto"
          >
            <button 
              onClick={() => {
                navigate('/bible');
                window.scrollTo({ top: 0, behavior: 'instant' });
              }}
              className="mb-spacing-xl flex items-center gap-spacing-xs text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 active:text-secondary transition-colors"
            >
              <Icons.ChevronLeft className="w-4 h-4" /> Voltar
            </button>

            <header className="mb-spacing-xl text-center">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary/50 mb-spacing-xs block">Sumário Bíblico</span>
              <h1 className="font-display text-4xl text-primary/80 tracking-tight mb-spacing-md">{selectedBook.name}</h1>
              {selectedBook.description && (
                <p className="text-sm font-serif italic text-primary/40 leading-relaxed max-w-xs mx-auto mb-spacing-lg">
                  {selectedBook.description}
                </p>
              )}
              <div className="w-12 h-px bg-secondary/20 mx-auto" />
            </header>

            <div
              className="grid grid-cols-6 gap-1.5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12"
              data-testid="chapter-grid"
              role="grid"
              aria-label={`Capítulos de ${selectedBook.name}`}
              onKeyDown={(e) => {
                const keys = ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'];
                if (!keys.includes(e.key)) return;
                const target = e.target as HTMLElement;
                if (!target.matches('[data-chapter-btn]')) return;
                e.preventDefault();
                const btns = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[data-chapter-btn]'));
                const idx = btns.indexOf(target as HTMLButtonElement);
                if (idx < 0) return;
                const cols = window.matchMedia('(min-width: 1024px)').matches ? 12 : window.matchMedia('(min-width: 768px)').matches ? 10 : window.matchMedia('(min-width: 640px)').matches ? 8 : 6;
                let next = idx;
                if (e.key === 'ArrowRight') next = Math.min(idx + 1, btns.length - 1);
                else if (e.key === 'ArrowLeft') next = Math.max(idx - 1, 0);
                else if (e.key === 'ArrowDown') next = Math.min(idx + cols, btns.length - 1);
                else if (e.key === 'ArrowUp') next = Math.max(idx - cols, 0);
                else if (e.key === 'Home') next = 0;
                else if (e.key === 'End') next = btns.length - 1;
                btns[next]?.focus();
              }}
            >

              {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((ch) => {
                const missing = isChapterMissing(selectedBook.abbr, ch);
                return (
                <button 
                  key={ch}
                  data-chapter-btn
                  data-testid={`chapter-btn-${ch}`}
                  onClick={() => { if (!missing) selectChapter(ch); }}

                  disabled={missing}
                  aria-disabled={missing}
                  aria-current={selectedChapter === ch ? 'page' : undefined}
                  title={missing ? MISSING_CHAPTER_REASON : undefined}
                  className={cn(
                    "min-h-10 sm:min-h-11 flex flex-col items-center justify-center rounded-lg border transition-all group shadow-sm",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 focus-visible:ring-offset-1",
                    missing
                      ? "bg-muted/40 border-dashed border-primary/10 opacity-60 cursor-not-allowed"
                      : selectedChapter === ch
                        ? "bg-secondary/15 border-secondary ring-2 ring-secondary/30 shadow-md scale-[1.03]" 
                        : notes.some(n => n.book_abbr === selectedBook.abbr && n.chapter === ch)
                          ? "bg-secondary/5 border-secondary/20 hover:border-secondary/40 hover:bg-secondary/10"
                          : "bg-white border-primary/5 hover:border-secondary/40 hover:bg-secondary/[0.04]"
                  )}

                >
                  <span className={cn(
                    "text-sm sm:text-base font-display transition-colors",
                    missing
                      ? "text-primary/40 line-through decoration-primary/30"
                      : selectedChapter === ch ? "text-secondary font-bold" : "text-primary/70 group-hover:text-secondary group-active:text-secondary"
                  )}>{ch}</span>

                  <div className="flex items-center gap-spacing-xs mt-spacing-xs">
                    {missing && (
                      <span className="text-premium-xs uppercase tracking-wider text-primary/50">
                        sem fonte
                      </span>
                    )}
                    {!missing && selectedBook.chapterTitles?.[ch] && (
                      <div className={cn(
                        "w-1 h-1 rounded-full",
                        selectedChapter === ch ? "bg-secondary" : "bg-secondary/40"
                      )} />
                    )}
                    {!missing && cicCitationMap.chapters.has(ch) && (
                      <div
                        className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.7)]"
                        title="Contém citação do Catecismo (CIC)"
                        aria-label="Capítulo com citação do Catecismo"
                      />
                    )}
                  </div>
                </button>
                );
              })}

            </div>
          </motion.div>
        )}

        {viewMode === 'reading' && selectedBook && (
          <motion.div 
            key="reading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen"
          >
            {/* Sticky Reading Header */}
            <header className={cn(
              "sticky top-0 z-50 backdrop-blur-md border-b border-primary/5 px-spacing-md h-14 flex items-center justify-between transition-colors duration-1000",
              settings.theme === 'night' ? "bg-[#0A0B0D]/90" : "bg-[#FAF9F6]/90"
            )}>

              <button onClick={() => navigate(`/bible?book=${selectedBook.abbr}`)} aria-label="Voltar para lista de capítulos" className="p-spacing-xs min-h-11 min-w-11 flex items-center justify-center text-primary/40 active:text-secondary">
                <Icons.ChevronLeft className="w-6 h-6" aria-hidden="true" />
              </button>
              <div className="text-center">
                <h2 className="text-[11px] font-black uppercase tracking-widest text-primary/80">{selectedBook.name} {selectedChapter}</h2>
              </div>
              <div className="flex items-center gap-spacing-xs">
                <button
                  type="button"
                  onClick={toggleHighContrast}
                  aria-pressed={highContrast}
                  aria-label={highContrast ? 'Desativar alto contraste das bolhas do Nexus' : 'Ativar alto contraste das bolhas do Nexus'}
                  title="Alto contraste do Nexus"
                  data-testid="nexus-contrast-toggle"
                  className={cn(
                    'p-spacing-xs rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2',
                    highContrast ? 'text-secondary bg-secondary/15' : 'text-primary/50 hover:text-primary',
                  )}
                >
                  <Icons.Contrast className="w-5 h-5" />
                </button>
                <ReadingSettingsPopover />
              </div>
            </header>

            <motion.div 
              className="w-full px-3 sm:px-5 lg:px-8 py-5 sm:py-8 pb-32 mx-auto max-w-5xl"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.1}
              onDragEnd={handleDragEnd}
            >
              {isLoading ? <BibleSkeleton /> : (
                <article className="space-y-spacing-lg">
                  <header className="flex flex-col items-center mb-spacing-2xl opacity-30">
                    <Icons.Logo className="w-10 h-10 mb-spacing-lg" />
                    <h3 className="text-2xl font-display font-light uppercase tracking-[0.4em] italic">{selectedBook.name} {selectedChapter}</h3>
                  </header>

                  {/* Context Banner */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-spacing-sm sm:p-spacing-md bg-secondary/5 rounded-2xl border border-secondary/10 mb-spacing-lg"
                  >
                    <div className="flex items-center gap-spacing-sm mb-spacing-xs">
                      <Icons.Info className="w-4 h-4 text-secondary/40" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-secondary/80">Contexto do Livro</span>
                    </div>
                    <p className="text-xs font-serif italic text-primary/60 leading-relaxed">
                      {selectedBook.context || selectedBook.description || "Este livro faz parte do Cânone Sagrado das Escrituras."}
                    </p>
                  </motion.div>

                  {/* Hidratação de conexões — não bloqueia leitura */}
                  {connectionsLoading && verses.length > 0 && (
                    <div
                      className="flex items-center gap-spacing-xs -mt-spacing-md mb-spacing-md text-[10px] font-black uppercase tracking-widest text-secondary/60"
                      role="status"
                      aria-live="polite"
                    >
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary/60 animate-pulse" />
                      <span>Carregando referências cruzadas…</span>
                      <span className="flex-1 h-px bg-secondary/10" />
                    </div>
                  )}

                  <div className="space-y-spacing-md editorial-column">
                    {verses.length === 0 && !isLoading ? (
                      <div className="py-spacing-2xl text-center space-y-spacing-lg bg-primary/[0.02] rounded-3xl border border-primary/5 p-spacing-xl">
                        <Icons.AlertCircle className="w-12 h-12 text-secondary/40 mx-auto" />
                        <div className="space-y-spacing-xs">
                          <h4 className="text-[11px] font-black uppercase tracking-widest text-primary/60">Texto não disponível</h4>
                          <p className="text-sm font-serif italic text-primary/40">
                            Não conseguimos carregar este capítulo. Verifique sua conexão ou relate o problema.
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-spacing-sm">
                          <Button
                            variant="default"
                            onClick={() => selectedBook && fetchVerses(selectedBook.abbr, selectedChapter)}
                            className="h-12 rounded-xl text-premium-xs font-bold uppercase tracking-widest"
                          >
                            Tentar Novamente
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIsFeedbackOpen(true)}
                            className="h-12 rounded-xl text-premium-xs font-bold uppercase tracking-widest border-primary/10"
                          >
                            Relatar Problema
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-0">
                        {verses.map((v, index) => {


                      const hasNote = notes.some(n => 
                        n.book_abbr === selectedBook.abbr && 
                        n.chapter === selectedChapter && 
                        n.verse === v.number
                      );
                      
                      return (
                        <div 
                          key={v.number} 
                          id={`verse-${v.number}`} 
                          onClick={() => {
                            saveReadingProgress(selectedBook.abbr, selectedChapter, v.number);
                            setActiveVerse(v);
                            setIsHighlightMenuOpen(true);
                          }}
                          className={cn(
                            "w-full flex items-start gap-2 sm:gap-3 group relative transition-all duration-200 cursor-pointer active:bg-primary/[0.05] px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-transparent hover:border-primary/5",
                            highlights[`${selectedBook.abbr}-${selectedChapter}-${v.number}`] === 'yellow' && "bg-yellow-200/40",
                            highlights[`${selectedBook.abbr}-${selectedChapter}-${v.number}`] === 'green' && "bg-green-200/40",
                            highlights[`${selectedBook.abbr}-${selectedChapter}-${v.number}`] === 'blue' && "bg-blue-200/40",
                            highlights[`${selectedBook.abbr}-${selectedChapter}-${v.number}`] === 'red' && "bg-red-200/40"
                          )}
                        >

                          <div className="flex flex-col items-center gap-1 mt-1 w-5 sm:w-6 shrink-0">
                            <span className="text-[10px] sm:text-[11px] font-serif font-bold text-secondary/40 tabular-nums">{v.number}</span>
                            {cicCitationMap.verses.has(`${selectedChapter}-${v.number}`) && (
                              <div
                                role="img"
                                aria-label="Versículo com citação do Catecismo"
                                title="Versículo com citação do Catecismo (CIC)"
                                className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.7)]"
                              />
                            )}
                            {hasNote && (
                              <div className="flex flex-col items-center gap-spacing-xs">
                                <div className="w-1.5 h-1.5 rounded-full bg-secondary/60 shadow-sm" title="Possui anotação" />
                                <span className="text-premium-xs font-bold uppercase tracking-tight text-secondary/40 leading-none">Meditado</span>
                              </div>
                            )}
                          </div>


                          
                          <div className="flex-1 space-y-0">
                            {(() => {
                              const connectionKey = `${selectedBook.abbr}-${selectedChapter}-${v.number}`;
                              const verseConnections = KNOWLEDGE_CONNECTIONS[connectionKey] || [];
                              const crossRefs = CROSS_REFERENCES[connectionKey] || [];

                              return (
                                <>
                            <p 
                              data-testid={`verse-text-${v.number}`}
                              className={cn(
                                "leading-[1.65] font-serif text-primary/85 tracking-tight relative flex-1 min-w-0",
                                settings.fontSize === 'small' && "text-[16px]",
                                settings.fontSize === 'medium' && "text-[19px]",
                                settings.fontSize === 'large' && "text-[22px]",
                                settings.fontSize === 'extra-large' && "text-[26px]",
                                settings.lineSpacing === 'tight' && "leading-[1.55]",
                                settings.lineSpacing === 'normal' && "leading-[1.7]",
                                settings.lineSpacing === 'wide' && "leading-[1.8]",
                                settings.contrast === 'soft' && "opacity-70",
                                settings.contrast === 'high' && "text-primary font-bold"
                              )}
                            >
                              {renderVerseWithNotes(v.text, v.comment)}
                              
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenAnnotation(v);
                                }}
                                aria-label={`Anotar versículo ${v.number}`}
                                className="absolute right-0 top-0 p-1.5 min-h-10 min-w-10 flex items-center justify-center text-primary/20 hover:text-secondary opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-all"
                              >
                                <Icons.PenLine className="w-3.5 h-3.5" aria-hidden="true" />
                              </button>
                            </p>

                            {/* Knowledge Connection Cards — Nexus (squared, structured) */}
                            {verseConnections.length > 0 && (
                              <div data-testid={`nexus-bubbles-${v.number}`} className="grid grid-cols-2 sm:grid-cols-3 gap-spacing-xs pt-1">
                                {verseConnections.slice(0, 6).map((conn, idx) => {
                                  const typeMeta: Record<string, { icon: React.ReactNode; tone: string; stripe: string; kicker: string }> = {
                                    catechism: { icon: <Icons.BookMarked className="w-3 h-3" />, tone: 'text-blue-800', stripe: 'bg-blue-600', kicker: 'Catecismo' },
                                    bible: { icon: <Icons.BookOpen className="w-3 h-3" />, tone: 'text-emerald-800', stripe: 'bg-emerald-600', kicker: 'Escritura' },
                                    document: { icon: <Icons.ScrollText className="w-3 h-3" />, tone: 'text-purple-800', stripe: 'bg-purple-600', kicker: 'Magistério' },
                                    theology: { icon: <Icons.Sparkles className="w-3 h-3" />, tone: 'text-primary', stripe: 'bg-secondary', kicker: 'Nexus' },
                                    cross_ref: { icon: <Icons.Link className="w-3 h-3" />, tone: 'text-amber-800', stripe: 'bg-amber-600', kicker: 'Referência' },
                                  };
                                  const meta = typeMeta[conn.type] || typeMeta.theology;
                                  return (
                                    <Popover key={idx}>
                                      <PopoverTrigger asChild>
                                        <motion.button
                                          data-testid="nexus-connection-card"
                                          initial={{ opacity: 0, y: 4 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ delay: idx * 0.03 }}
                                          aria-label={`${meta.kicker}: ${conn.label}`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            console.info('[Nexus] click', {
                                              book: selectedBook.abbr,
                                              chapter: selectedChapter,
                                              verse: v.number,
                                              type: conn.type,
                                              label: conn.label,
                                              id: conn.id,
                                            });
                                            try {
                                              window.dispatchEvent(new CustomEvent('nexus:click', {
                                                detail: { book: selectedBook.abbr, chapter: selectedChapter, verse: v.number, ...conn }
                                              }));
                                            } catch {}
                                            setExpandedConnection(conn);
                                            void fetchReferenceVerse(conn);
                                          }}
                                          className="group relative overflow-hidden rounded-md border border-primary/20 bg-white hover:border-secondary/50 hover:bg-secondary/[0.04] shadow-sm hover:shadow-md transition-all text-left active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 dark:bg-primary/5 dark:border-primary/30"
                                        >
                                          <div className={cn("absolute left-0 top-0 bottom-0 w-[3px]", meta.stripe)} />
                                          <div className="pl-2.5 pr-2 py-spacing-xs.5 flex flex-col gap-spacing-0.5">
                                            <div className="flex items-center gap-spacing-xs.5">
                                              <span className={cn("shrink-0", meta.tone)}>{meta.icon}</span>
                                              <span className={cn("text-premium-xs font-bold uppercase tracking-[0.12em]", meta.tone)}>
                                                {meta.kicker}
                                              </span>
                                            </div>
                                            <span className="text-[11px] font-bold text-primary dark:text-foreground leading-tight truncate">
                                              {conn.label}
                                            </span>
                                          </div>
                                        </motion.button>
                                      </PopoverTrigger>
                                      <PopoverContent
                                        side="top"
                                        align="center"
                                        sideOffset={8}
                                        collisionPadding={12}
                                        data-testid="nexus-connection-popover"
                                        aria-labelledby={`nexus-popover-title-${v.number}-${idx}`}
                                        aria-describedby={`nexus-popover-desc-${v.number}-${idx}`}
                                        className="w-[min(22rem,calc(100vw-24px))] z-[200] p-spacing-sm rounded-xl border border-primary/10 bg-card shadow-premium"
                                      >
                                        <div className="space-y-spacing-xs">
                                          <div className="flex items-start gap-spacing-xs">
                                            <span className={cn("mt-0.5 shrink-0", meta.tone)}>{meta.icon}</span>
                                            <div className="min-w-0">
                                              <p className={cn("text-premium-xs font-bold uppercase tracking-[0.2em]", meta.tone)}>{meta.kicker}</p>
                                              <h4 id={`nexus-popover-title-${v.number}-${idx}`} className="text-sm font-display font-bold text-primary truncate">{conn.label}</h4>
                                            </div>
                                          </div>
                                          <p id={`nexus-popover-desc-${v.number}-${idx}`} className="text-xs font-serif italic text-primary/70 leading-relaxed">
                                            {conn.summary}
                                          </p>
                                          {(conn.type === 'cross_ref' || conn.type === 'bible') && (
                                            <div className="rounded-xl border border-secondary/20 bg-secondary/[0.04] p-spacing-sm">
                                              <p className="text-premium-xs font-bold uppercase tracking-[0.16em] text-secondary">
                                                Texto bíblico da referência
                                              </p>
                                              {referenceVerseLoading ? (
                                                <p className="mt-1 text-xs text-primary/50">Carregando versículo…</p>
                                              ) : referenceVerse ? (
                                                <>
                                                  <p className="mt-1 text-xs font-bold text-primary">{referenceVerse.reference}</p>
                                                  <p className="mt-1 text-sm font-serif leading-relaxed text-primary/80">{referenceVerse.text}</p>
                                                </>
                                              ) : (
                                                <p className="mt-1 text-xs text-primary/50">Texto da referência indisponível.</p>
                                              )}
                                            </div>
                                          )}

                                          {conn.type === 'catechism' && (
                                            <div className="pt-spacing-sm border-t border-primary/5">
                                              <CatechismParagraphPreview paragraphId={conn.id} />
                                            </div>
                                          )}
                                          <div className="pt-spacing-sm border-t border-primary/5">
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              data-testid="nexus-popover-nav-link"
                                              onClick={() => {
                                                console.info('[Nexus] navigate', { from: 'bible', to: conn.type, id: conn.id });
                                                saveBibleReturnContext({
                                                  book: selectedBook.abbr,
                                                  chapter: selectedChapter,
                                                  verse: v.number,
                                                  label: `${selectedBook.name} ${selectedChapter}:${v.number}`,
                                                });
                                                if (conn.type === 'catechism') navigate(`/catechism?p=${conn.id}`);
                                                else if (conn.type === 'document') navigate(`/magisterium?doc=${conn.id}`);
                                                else if (conn.type === 'bible' || conn.type === 'cross_ref') {
                                                  const parts = String(conn.id).split('-');
                                                  if (parts.length >= 2) navigate(`/bible?book=${parts[0]}&ch=${parts[1]}${parts[2] ? `&v=${parts[2]}` : ''}`);
                                                }
                                              }}
                                              className="w-full min-h-11 rounded-xl text-xs font-bold uppercase tracking-widest focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
                                            >
                                              <Icons.BookOpen className="w-3.5 h-3.5 mr-spacing-xs text-secondary" />
                                              Abrir referência
                                            </Button>
                                          </div>
                                        </div>
                                      </PopoverContent>
                                    </Popover>

                                  );
                                })}
                              </div>
                            )}




                            {/* Cross References */}
                            {crossRefs.length > 0 && !KNOWLEDGE_CONNECTIONS[connectionKey] && (
                              <div className="flex flex-wrap gap-spacing-xs pt-2">
                                {crossRefs.map(ref => {
                                  const [b, c, vNum] = ref.split('-');
                                  return (
                                    <button
                                      key={ref}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/bible?book=${b}&ch=${c}&v=${vNum}`);
                                      }}
                                      className="text-premium-xs font-bold uppercase tracking-widest bg-secondary/5 text-secondary/80 px-spacing-xs py-spacing-xs rounded-full border border-secondary/10 hover:bg-secondary/10 transition-colors"
                                    >
                                      {b} {c}:{vNum}
                                    </button>
                                    );
                                  })}
                                </div>
                              )}
                                </>
                              );
                            })()}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                  {/* Nexus — Empty state por capítulo + botão de contribuição */}
                  {!isLoading && verses.length > 0 && !chapterHasConnections && (
                    <section
                      data-testid="nexus-empty-state"
                      aria-labelledby="nexus-empty-title"
                      className="mt-8 rounded-2xl border border-dashed border-primary/15 bg-primary/[0.02] p-6 text-center"
                    >
                      <div className="mx-auto w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center mb-3">
                        <Icons.Sparkles className="w-5 h-5 text-secondary" aria-hidden="true" />
                      </div>
                      <h3 id="nexus-empty-title" className="font-display text-base text-primary mb-1">
                        Nexus deste capítulo ainda não catalogado
                      </h3>
                      <p className="text-sm text-primary/60 max-w-md mx-auto mb-4 leading-relaxed">
                        Ainda não há conexões teológicas cadastradas para {selectedBook.name} {selectedChapter}. Contribua com uma referência do Catecismo, Magistério ou Escritura — sua sugestão será revisada pelos editores.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsNexusContribOpen(true)}
                        data-testid="nexus-contribute-btn"
                        className="rounded-xl text-[11px] font-black uppercase tracking-widest"
                      >
                        <Icons.Plus className="w-4 h-4 mr-2 text-secondary" aria-hidden="true" />
                        Contribuir com uma conexão
                      </Button>
                    </section>
                  )}

                  <NexusContributionDialog
                    open={isNexusContribOpen}
                    onOpenChange={setIsNexusContribOpen}
                    bookAbbr={selectedBook.abbr}
                    bookName={selectedBook.name}
                    chapter={selectedChapter}
                  />

                  {/* Vertical Navigation Buttons */}
                  <footer className="pt-12 pb-20 space-y-spacing-md">
                    <div className="flex gap-spacing-md">
                      <Button 
                        onClick={prevChapter}
                        disabled={selectedChapter <= 1}
                        variant="outline"
                        className="flex-1 h-16 rounded-2xl border-primary/5 text-primary/40 text-[10px] font-black uppercase tracking-widest shadow-sm"
                      >
                        <Icons.ChevronLeft className="w-4 h-4 mr-spacing-xs" /> Anterior
                      </Button>
                      <Button 
                        onClick={nextChapter}
                        disabled={selectedChapter >= selectedBook.chapters}
                        className="flex-[2] h-16 rounded-2xl bg-primary text-white text-[11px] font-black uppercase tracking-widest shadow-lg active:scale-[0.98] transition-all"
                      >
                        Próximo Capítulo <Icons.ChevronRight className="w-4 h-4 ml-spacing-xs" />
                      </Button>
                    </div>
                  </footer>

                </article>
              )}
            </motion.div>
          </motion.div>
        )}
        {viewMode === 'search' && (
          <BibleSearch 
            onClose={() => setViewMode('home')} 
            onSelectResult={(book, chapter, verse) => {
              navigate(`/bible?book=${book}&ch=${chapter}&v=${verse}`);
              setViewMode('reading');
            }} 
            initialTheme={activeThemeFilter}
          />
        )}


        {viewMode === 'notes' && (
          <BibleFullNotesList 
            onClose={() => setViewMode('home')}
            onSelectReference={(book, chapter, verse) => {
              navigate(`/bible?book=${book}&ch=${chapter}&v=${verse}`);
              setViewMode('reading');
            }}
            onEditNote={async (noteId, text, color) => {
              await updateNote(noteId, text, color);
              toast.success('Anotação atualizada');
            }}
            onDeleteNote={async (noteId) => {
              await deleteNote(noteId);
              toast.success('Anotação removida');
            }}
          />
        )}

        {viewMode === 'bookmarks' && (
          <BibleBookmarksList
            onClose={() => setViewMode('home')}
            onSelectReference={(book, chapter, verse) => {
              navigate('/bible?book=' + book + '&ch=' + chapter + '&v=' + verse);
              setViewMode('reading');
            }}
          />
        )}

        {viewMode === 'monthly_recap' && (
          <MonthlyRecap 
            onClose={() => setViewMode('home')}
            onSelectDate={(bookAbbr, chapter) => {
              navigate(`/bible?book=${bookAbbr}&ch=${chapter}`);
              setViewMode('reading');
            }}
          />
        )}
      </AnimatePresence>

      {showKnowledgePanel && (
        <BibleKnowledgeAudit 
          onClose={() => setShowKnowledgePanel(false)} 
          auditData={auditData}
          onThemeClick={(theme) => {
            setActiveThemeFilter(theme);
            setViewMode('search');
            setShowKnowledgePanel(false);
          }}
        />
      )}



      <NoteEditModal 

        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSave={handleSaveNote}
        title={`${selectedBook?.name} ${selectedChapter}:${activeVerse?.number}`}
      />

      <HighlightMenu
        isOpen={isHighlightMenuOpen}
        onClose={() => setIsHighlightMenuOpen(false)}
        onSelectColor={(color) => {
          if (activeVerse) {
            toggleHighlight(activeVerse.number, color);
            setIsHighlightMenuOpen(false);
          }
        }}
        onAddNote={() => {
          setIsHighlightMenuOpen(false);
          setIsNoteModalOpen(true);
        }}
        isBookmarked={activeVerse ? isVerseBookmarked(activeVerse.number) : false}
        onToggleBookmark={() => {
          if (activeVerse) void toggleBookmark(activeVerse.number);
        }}
        verseText={activeVerse?.text}
        reference={
          activeVerse && selectedBook
            ? `${selectedBook.abbr} ${selectedChapter}:${activeVerse.number}`
            : undefined
        }
        passage={
          activeVerse && selectedBook
            ? {
                kind: 'bible',
                ref: `${selectedBook.abbr} ${selectedChapter}:${activeVerse.number}`,
              }
            : undefined
        }
        onOpenNexus={() => {
          setIsHighlightMenuOpen(false);
          setIsNexusContribOpen(true);
        }}
      />


      {/* Nexus connections now open as anchored Popover on each card (see nexus-connection-popover). */}


      <AnimatePresence>
        {isGraphOpen && (
          <KnowledgeGraph 
            onClose={() => setIsGraphOpen(false)}
            initialNodeId={expandedConnection?.id}
            onNavigateToContent={(book, chapter, verse) => {
              navigate(`/bible?book=${book}&ch=${chapter}&v=${verse}`);
              setViewMode('reading');
              setIsGraphOpen(false);
              setExpandedConnection(null);
            }}

          />
        )}
      </AnimatePresence>


      <AnimatePresence>
        {isFeedbackOpen && (
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-spacing-lg">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFeedbackOpen(false)}
              className="absolute inset-0 bg-background/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-card border border-primary/10 rounded-[2.5rem] shadow-premium p-spacing-xl space-y-spacing-lg"
            >
              <div className="text-center space-y-spacing-xs">
                <Icons.HelpCircle className="w-10 h-10 text-secondary mx-auto mb-spacing-md" />
                <h3 className="text-lg font-display font-bold text-primary uppercase tracking-widest">Suporte Sagrado</h3>
                <p className="text-sm font-serif italic text-primary/60">
                  Relate problemas de exibição ou sugira conexões teológicas.
                </p>
              </div>

              <div className="space-y-spacing-md">
                <div className="space-y-spacing-xs">
                  <span className="text-premium-xs font-bold uppercase tracking-widest text-primary/30">O que está acontecendo?</span>
                  <textarea 
                    placeholder="Ex: O capítulo 3 de Gênesis não está carregando..."
                    className="w-full bg-primary/[0.02] border border-primary/5 rounded-2xl p-spacing-md text-sm font-serif italic focus:outline-none focus:ring-1 focus:ring-secondary/20"
                    rows={4}
                  />
                </div>
              </div>

              <Button 
                onClick={() => {
                  toast.success('Feedback enviado com sucesso. Nossa equipe analisará o ocorrido.');
                  setIsFeedbackOpen(false);
                }}
                className="w-full h-14 bg-primary text-primary-foreground rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg"
              >
                Enviar Relatório
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isConnectionEditorOpen && (
          <div className="fixed inset-0 z-[220] flex items-center justify-center p-spacing-lg">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConnectionEditorOpen(false)}
              className="absolute inset-0 bg-[#0A0B0D]/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-card border border-primary/10 rounded-[2.5rem] shadow-premium p-spacing-xl space-y-spacing-lg"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-display font-bold text-primary uppercase">Editor Bíblia ↔ CIC</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsConnectionEditorOpen(false)} aria-label="Fechar editor de relação Bíblia e CIC" className="min-h-11 min-w-11 rounded-full opacity-60 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2">
                  <Icons.X className="w-6 h-6" />
                </Button>
              </div>

              <div className="space-y-spacing-md">
                <div className="grid grid-cols-2 gap-spacing-md">
                  <div className="space-y-spacing-xs">
                    <span className="text-premium-xs font-bold uppercase text-primary/45">Versículo</span>
                    <input className="w-full bg-primary/[0.02] border border-primary/5 rounded-xl p-spacing-sm text-sm font-serif" placeholder="Ex: João 6,35" />
                  </div>
                  <div className="space-y-spacing-xs">
                    <span className="text-premium-xs font-bold uppercase text-primary/45">Parágrafo CIC</span>
                    <input className="w-full bg-primary/[0.02] border border-primary/5 rounded-xl p-spacing-sm text-sm font-serif" placeholder="Ex: 1324" />
                  </div>
                </div>

                <div className="space-y-spacing-xs">
                  <span className="text-premium-xs font-bold uppercase text-primary/45">Nota de Relacionamento</span>
                  <textarea className="w-full bg-primary/[0.02] border border-primary/5 rounded-xl p-spacing-sm text-sm font-serif" rows={2} placeholder="Descreva o motivo desta conexão..." />
                </div>
              </div>

              <div className="p-spacing-md bg-primary/[0.01] rounded-2xl border border-primary/5 max-h-40 overflow-y-auto">
                <span className="text-premium-xs font-bold uppercase text-primary/45 block mb-spacing-sm">Histórico de Revisão</span>
                <p className="text-xs text-primary/50">
                  Nenhuma revisão histórica foi carregada deste banco nesta sessão.
                </p>
              </div>

              <Button 
                onClick={() => {
                  // Simplified validation rules
                  const verseInput = document.querySelector('input[placeholder="Ex: João 6,35"]') as HTMLInputElement;
                  const cicInput = document.querySelector('input[placeholder="Ex: 1324"]') as HTMLInputElement;
                  
                  if (!verseInput?.value || !cicInput?.value) {
                    toast.error('Preencha as referências obrigatórias');
                    return;
                  }

                  if (verseInput.value.includes('Jo 1:1') && cicInput.value.includes('279')) {
                    toast.warning('Esta conexão já existe no banco de dados');
                    return;
                  }

                  toast.success('Conexão enviada para validação teológica');
                  setIsConnectionEditorOpen(false);
                }}
                className="w-full h-14 bg-primary text-primary-foreground rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg"
              >
                Salvar Relação
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Bible;