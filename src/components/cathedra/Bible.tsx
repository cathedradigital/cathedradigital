import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
/**
 * Bible Component - CATHEDRA BIBLE REGRESSION RECOVERY
 * Version: 4.0.0 (Stabilized)
 */
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
import BibleFullNotesList from './BibleFullNotesList';
import BibleBookmarksList from './BibleBookmarksList';
import { VerseNoteSup } from './VerseNoteSup';

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
import { saveBibleReturnContext } from '@/lib/bibleReturnContext';
import { parseBibleReferences } from '@/lib/bibleRefParser';

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
  const referenceVerseParam = searchParams.get('ref');
  const referenceVerseNumber = useMemo(() => {
    if (!referenceVerseParam) return null;
    const parsed = parseBibleReferences(referenceVerseParam).find((segment) => segment.type === 'bibleRef');
    return parsed?.verse ? String(parsed.verse) : null;
  }, [referenceVerseParam]);
  const requestedVerse = searchParams.get('v') ?? referenceVerseNumber;

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

;