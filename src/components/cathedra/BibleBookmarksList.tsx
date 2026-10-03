import React, { useMemo } from 'react';
import { Icons } from '@/constants';
import { Button } from '@/components/ui/button';
import { useReadingMarks } from '@/hooks/useReadingMarks';
import { BIBLE_DATA } from '@/data/bible-books';

interface BibleBookmarksListProps {
  onClose: () => void;
  onSelectReference: (book: string, chapter: number, verse: number) => void;
}

export const BibleBookmarksList: React.FC<BibleBookmarksListProps> = ({ onClose, onSelectReference }) => {
  const { marks, loading, deleteMark } = useReadingMarks();

  const bookmarks = useMemo(() => marks
    .filter((mark) => mark.content_type === 'bible_bookmark')
    .map((mark) => {
      const [book, chapterRaw, verseRaw] = String(mark.content_id).split(':');
      const chapter = Number(chapterRaw);
      const verse = Number(verseRaw);
      const allBooks = Object.values(BIBLE_DATA).flat().flatMap((cat) => cat.books);
      const bookData = allBooks.find((item) => item.abbr === book);
      return { ...mark, book, chapter, verse, bookName: bookData?.name ?? book };
    })
    .filter((mark) => Number.isInteger(mark.chapter) && Number.isInteger(mark.verse))
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
  [marks]);

  return (
    <div className="min-h-screen bg-background px-spacing-lg pt-8 pb-24">
      <div className="mx-auto max-w-2xl space-y-spacing-lg">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-secondary">Bíblia</p>
            <h1 className="font-display text-2xl text-primary">Marcadores</h1>
            <p className="mt-1 text-sm text-muted-foreground">Versículos que você guardou para retornar depois.</p>
          </div>
          <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl">
            <Icons.X className="mr-1.5 h-4 w-4" /> Fechar
          </Button>
        </header>

        {loading ? (
          <div className="rounded-2xl border border-primary/10 p-6 text-center text-sm text-muted-foreground">Carregando marcadores…</div>
        ) : bookmarks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-primary/15 bg-primary/[0.02] p-8 text-center">
            <Icons.BookMarked className="mx-auto h-8 w-8 text-secondary/50" />
            <h2 className="mt-3 font-display text-lg text-primary">Nenhum marcador ainda</h2>
            <p className="mt-1 text-sm text-muted-foreground">Abra um versículo, escolha as ações e marque-o para voltar a ele rapidamente.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {bookmarks.map((bookmark) => (
              <div key={bookmark.id} className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-card p-4 shadow-sm">
                <button
                  type="button"
                  onClick={() => onSelectReference(bookmark.book, bookmark.chapter, bookmark.verse)}
                  className="min-w-0 flex-1 text-left"
                  aria-label={'Abrir ' + bookmark.bookName + ' ' + bookmark.chapter + ':' + bookmark.verse}
                >
                  <p className="font-display font-bold text-primary">{bookmark.bookName} {bookmark.chapter}:{bookmark.verse}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{bookmark.label || 'Versículo marcado'}</p>
                </button>
                <button
                  type="button"
                  onClick={() => deleteMark(bookmark.id)}
                  className="min-h-10 min-w-10 rounded-full text-primary/30 hover:bg-red-500/5 hover:text-red-600"
                  aria-label={'Remover marcador de ' + bookmark.bookName + ' ' + bookmark.chapter + ':' + bookmark.verse}
                >
                  <Icons.Trash2 className="mx-auto h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BibleBookmarksList;
