import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '@/constants';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { BIBLE_DATA } from '@/data/bible-books';


import { supabase } from '@/lib/db';
import { toast } from 'sonner';

interface SearchResult {
  bookId: string;
  bookAbbrev: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  score?: number;
  relevance?: string;
  isBible?: boolean; // True for Bible results, false for Magisterium/Catechism
}


interface BibleSearchProps {
  onSelectResult: (bookAbbrev: string, chapter: number, verse: number) => void;
  onClose: () => void;
  initialTheme?: string | null;
}


function normalizeReference(value: string) {
  return value.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase().replace(/[.,;()[\\]{}]/g, ' ').replace(/\\s+/g, ' ').trim();
}

function parseBibleReference(input: string) {
  const match = input.trim().match(/^(.*?)\\s+(\\d+)\\s*[:.,]\\s*(\\d+)$/);
  if (!match) return null;
  const [, rawBook, chapterRaw, verseRaw] = match;
  const normalizedBook = normalizeReference(rawBook);
  const books = Object.values(BIBLE_DATA).flat().flatMap((category) => category.books);
  const book = books.find((candidate) => {
    const aliases = [candidate.abbr, candidate.name].map(normalizeReference);
    return aliases.some((alias) => alias === normalizedBook || alias.replace(/\\s+/g, '') === normalizedBook.replace(/\\s+/g, ''));
  });
  return book ? { book, chapter: Number(chapterRaw), verse: Number(verseRaw) } : null;
}

const BibleSearch: React.FC<BibleSearchProps> = ({ onSelectResult, onClose, initialTheme }) => {
  const [query, setQuery] = useState(initialTheme || '');

  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);


  useEffect(() => {
    if (initialTheme) {
      const mockEvent = { preventDefault: () => {} } as React.FormEvent;
      handleSearch(mockEvent);
    }
  }, []);


  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 2) return;

    setIsLoading(true);
    setSelectedIndex(null);
    try {
      let nextResults: SearchResult[] = [];
      let searchError: unknown = null;

      try {
        const { data, error } = await supabase.functions.invoke('bible-search', {
          body: { query: normalizedQuery },
        });
        if (error) throw error;
        nextResults = Array.isArray(data?.results)
          ? data.results.map((result: SearchResult) => ({ ...result, isBible: true }))
          : [];
      } catch (error) {
        searchError = error;
        console.error('[BibleSearch] search failed', error);
      }

      if (nextResults.length === 0) {
        const reference = parseBibleReference(normalizedQuery);
        if (reference) {
          try {
            const { data, error } = await supabase.functions.invoke('bible-text', {
              body: { abbrev: reference.book.abbr, chapter: reference.chapter },
            });
            if (error) throw error;
            const verse = Array.isArray(data?.verses)
              ? data.verses.find((item: { number?: number }) => Number(item.number) === reference.verse)
              : null;
            if (verse) {
              nextResults = [{
                bookId: reference.book.abbr,
                bookAbbrev: reference.book.abbr,
                bookName: reference.book.name,
                chapter: reference.chapter,
                verse: reference.verse,
                text: verse.text,
                score: 100,
                relevance: 'Referência exata',
                isBible: true,
              }];
            }
          } catch (fallbackError) {
            console.error('[BibleSearch] reference fallback failed', fallbackError);
          }
        }
      }

      setResults(nextResults);

      if (nextResults.length === 0) {
        if (searchError) {
          toast.error('Não foi possível pesquisar a Bíblia agora.', {
            description: 'A leitura continua disponível; tente novamente em alguns instantes.',
          });
        } else {
          toast.info('Nenhum resultado encontrado para esta pesquisa.');
        }
      }
    } catch (error) {
      console.error('[BibleSearch] search failed', error);
      setResults([]);
      toast.error('Não foi possível pesquisar a Bíblia agora.', {
        description: 'A leitura continua disponível; tente novamente em alguns instantes.',
      });
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="fixed inset-0 z-[100] bg-[#FAF9F6] flex flex-col">
      <header className="px-6 h-16 flex items-center gap-4 border-b border-primary/5">
        <button type="button" onClick={onClose} aria-label="Fechar busca" data-testid="bible-search-close" className="p-2 -ml-2 min-h-11 min-w-11 flex items-center justify-center text-primary/40 active:text-secondary">
          <Icons.X className="w-6 h-6" aria-hidden="true" />
        </button>
        <form id="bible-search-form" onSubmit={handleSearch} className="flex-1" data-testid="bible-search-form">
          <input 
            autoFocus
            type="text" 
            placeholder="Pesquisar nas Escrituras..." aria-label="Pesquisar nas Escrituras" data-testid="bible-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-10 bg-transparent text-lg font-serif outline-none placeholder:text-primary/20"
          />
        </form>
        <button type="submit" form="bible-search-form" aria-label="Executar busca" data-testid="bible-search-submit" className="p-2 min-h-11 min-w-11 flex items-center justify-center text-secondary/70 hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary rounded-md" disabled={isLoading || query.trim().length < 2}>
          <Icons.Search className="w-5 h-5" aria-hidden="true" />
        </button>
        {isLoading && <Icons.Loader className="w-4 h-4 text-secondary animate-spin" />}
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-20">
        <AnimatePresence mode="popLayout">
          {results.length > 0 ? (
            <div className="space-y-8">
              {results.map((result, idx) => (
                <motion.button
                  type="button"
                  data-testid={`bible-search-result-${result.bookAbbrev}-${result.chapter}-${result.verse}`}
                  key={`${result.bookAbbrev}-${result.chapter}-${result.verse}-${idx}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => {
                    setSelectedIndex(idx);
                    onSelectResult(result.bookAbbrev, result.chapter, result.verse);
                  }}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border transition-all space-y-2 group",
                    selectedIndex === idx ? "bg-white border-secondary shadow-sm ring-1 ring-secondary/20" : "bg-transparent border-primary/5 hover:border-primary/10"
                  )}
                >

                  <div className="flex items-center gap-2">
                    {/* Garantindo que o nome do livro seja exibido no vernáculo correto */}
                    <span className="text-[10px] font-black uppercase tracking-widest text-secondary/80">
                      {result.bookName
                        .replace(/\bTobit\b/g, 'Tobias')
                        .replace(/\bJudith\b/g, 'Judite')
                        .replace(/\bWisdom\b/g, 'Sabedoria')
                        .replace(/\bSirach\b/g, 'Eclesiástico')
                        .replace(/\bBaruch\b/g, 'Baruc')
                        .replace(/\bMaccabees\b/g, 'Macabeus')
                        .replace(/\bObadiah\b/g, 'Abdias')
                        .replace(/\bPsalms\b/g, 'Salmos')
                        .replace(/\bGenesis\b/g, 'Gênesis')
                        .replace(/\bExodus\b/g, 'Êxodo')
                        .replace(/\bLeviticus\b/g, 'Levítico')
                        .replace(/\bNumbers\b/g, 'Números')
                        .replace(/\bDeuteronomy\b/g, 'Deuteronômio')
                        .replace(/\bJoshua\b/g, 'Josué')
                        .replace(/\bJudges\b/g, 'Juízes')
                        .replace(/\bRuth\b/g, 'Rute')
                        .replace(/\b1 Samuel\b/g, '1 Samuel')
                        .replace(/\b2 Samuel\b/g, '2 Samuel')
                        .replace(/\b1 Kings\b/g, '1 Reis')
                        .replace(/\b2 Kings\b/g, '2 Reis')
                        .replace(/\b1 Chronicles\b/g, '1 Crônicas')
                        .replace(/\b2 Chronicles\b/g, '2 Crônicas')
                        .replace(/\bEzra\b/g, 'Esdras')
                        .replace(/\bNehemiah\b/g, 'Neemias')
                        .replace(/\bEsther\b/g, 'Ester')
                        .replace(/\bJob\b/g, 'Jó')
                        .replace(/\bProverbs\b/g, 'Provérbios')
                        .replace(/\bEcclesiastes\b/g, 'Eclesiastes')
                        .replace(/\bSong of Solomon\b/g, 'Cântico dos Cânticos')
                        .replace(/\bIsaiah\b/g, 'Isaías')
                        .replace(/\bJeremiah\b/g, 'Jeremias')
                        .replace(/\bLamentations\b/g, 'Lamentações')
                        .replace(/\bEzekiel\b/g, 'Ezequiel')
                        .replace(/\bDaniel\b/g, 'Daniel')
                        .replace(/\bHosea\b/g, 'Oseias')
                        .replace(/\bJoel\b/g, 'Joel')
                        .replace(/\bAmos\b/g, 'Amós')
                        .replace(/\bJonah\b/g, 'Jonas')
                        .replace(/\bMicah\b/g, 'Miqueias')
                        .replace(/\bNahum\b/g, 'Naum')
                        .replace(/\bHabakkuk\b/g, 'Habacuc')
                        .replace(/\bZephaniah\b/g, 'Sofonias')
                        .replace(/\bHaggai\b/g, 'Ageu')
                        .replace(/\bZechariah\b/g, 'Zacarias')
                        .replace(/\bMalachi\b/g, 'Malaquias')
                        .replace(/\bMatthew\b/g, 'Mateus')
                        .replace(/\bMark\b/g, 'Marcos')
                        .replace(/\bLuke\b/g, 'Lucas')
                        .replace(/\bJohn\b/g, 'João')
                        .replace(/\bActs\b/g, 'Atos')
                        .replace(/\bRomans\b/g, 'Romanos')
                        .replace(/\b1 Corinthians\b/g, '1 Coríntios')
                        .replace(/\b2 Corinthians\b/g, '2 Coríntios')
                        .replace(/\bGalatians\b/g, 'Gálatas')
                        .replace(/\bEphesians\b/g, 'Efésios')
                        .replace(/\bPhilippians\b/g, 'Filipenses')
                        .replace(/\bColossians\b/g, 'Colossenses')
                        .replace(/\b1 Thessalonians\b/g, '1 Tessalonicenses')
                        .replace(/\b2 Thessalonians\b/g, '2 Tessalonicenses')
                        .replace(/\b1 Timothy\b/g, '1 Timóteo')
                        .replace(/\b2 Timothy\b/g, '2 Timóteo')
                        .replace(/\bTitus\b/g, 'Tito')
                        .replace(/\bPhilemon\b/g, 'Filemon')
                        .replace(/\bHebrews\b/g, 'Hebreus')
                        .replace(/\bJames\b/g, 'Tiago')
                        .replace(/\b1 Peter\b/g, '1 Pedro')
                        .replace(/\b2 Peter\b/g, '2 Pedro')
                        .replace(/\b1 John\b/g, '1 João')
                        .replace(/\b2 John\b/g, '2 João')
                        .replace(/\b3 John\b/g, '3 João')
                        .replace(/\bJude\b/g, 'Judas')
                        .replace(/\bRevelation\b/g, 'Apocalipse')
                        .replace(/\bChapter\b/g, 'Capítulo')
                      } {result.chapter}:{result.verse}
                    </span>
                    <div className="flex-1 h-px bg-primary/5" />

                  </div>
                  {result.relevance && (
                    <p className="text-[10px] font-medium italic text-secondary/70">
                      Contexto: {result.relevance}
                    </p>
                  )}
                  <p className="font-serif text-[17px] leading-relaxed text-primary/70 group-active:text-primary transition-colors line-clamp-3">

                    {result.text}
                  </p>
                </motion.button>
              ))}
            </div>
          ) : !isLoading && query.length >= 2 && (
            <div className="h-full flex flex-col items-center justify-center opacity-20 text-center space-y-4">
              <Icons.Search className="w-12 h-12" />
              <p className="text-sm font-black uppercase tracking-widest italic">Pressione Enter para pesquisar</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BibleSearch;
