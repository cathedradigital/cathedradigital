import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '@/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNotes, UserNote } from '@/hooks/useNotes';
import { useReadingMarks, ReadingMark } from '@/hooks/useReadingMarks';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from '@/lib/rr-compat';
import { toast } from 'sonner';

const StudyJournal: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'notes' | 'marks'>('notes');
  const [searchQuery, setSearchQuery] = useState('');
  const [contentFilter, setContentFilter] = useState('all');
  const [colorFilter, setColorFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<'all' | '7d' | '30d' | 'older'>('all');
  
  const { notes: allNotes, updateNote, deleteNote, error: notesError } = useNotes('all');
  
  const { marks, deleteMark, updateMark } = useReadingMarks();
  
  const isWithinDateFilter = (date: string) => {
    if (dateFilter === 'all') return true;
    const age = Date.now() - new Date(date).getTime();
    const days = age / (1000 * 60 * 60 * 24);
    return dateFilter === '7d' ? days <= 7 : dateFilter === '30d' ? days <= 30 : days > 30;
  };

  const filteredNotes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allNotes.filter(n => {
      const matchesQuery = !q || n.note_text.toLowerCase().includes(q) || n.content_id.toLowerCase().includes(q) ||
        (n.book_abbr ? n.book_abbr.toLowerCase().includes(q) : false);
      const matchesType = contentFilter === 'all' || n.content_type === contentFilter;
      const matchesColor = colorFilter === 'all' || n.highlight_color === colorFilter;
      return matchesQuery && matchesType && matchesColor && isWithinDateFilter(n.updated_at);
    });
  }, [allNotes, searchQuery, contentFilter, colorFilter, dateFilter]);

  const filteredMarks = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return marks.filter(m => {
      if (m.is_last_read) return false;
      const matchesQuery = !q || m.label?.toLowerCase().includes(q) || m.content_id.toLowerCase().includes(q);
      const matchesType = contentFilter === 'all' || m.content_type === contentFilter;
      return matchesQuery && matchesType && isWithinDateFilter(m.updated_at);
    });
  }, [marks, searchQuery, contentFilter, dateFilter]);

  const handleUpdateNote = async (note: UserNote, newText: string) => {
    const ok = await updateNote(note.id, newText);
    if (ok) toast.success('Anotação atualizada');
    else toast.error('Não foi possível atualizar a anotação.');
  };

  const handleDeleteNote = async (note: UserNote) => {
    const ok = await deleteNote(note.id);
    if (ok) toast.info('Anotação removida');
    else toast.error('Não foi possível remover a anotação.');
  };

  return (
    <div className="space-y-spacing-xl animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-spacing-md">
        <div className="flex bg-muted/30 p-spacing-2xs rounded-premium-full border border-border/10">
          <Button
            variant={activeTab === 'notes' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('notes')}
            className={`rounded-premium-full px-spacing-lg h-spacing-xl ${activeTab === 'notes' ? 'shadow-premium' : ''}`}
          >
            Anotações ({allNotes.length})
          </Button>
          <Button
            variant={activeTab === 'marks' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('marks')}
            className={`rounded-premium-full px-spacing-lg h-spacing-xl ${activeTab === 'marks' ? 'shadow-premium' : ''}`}
          >
            Marcas ({marks.filter(m => !m.is_last_read).length})
          </Button>
        </div>

        <div className="relative w-full md:w-spacing-4xl">
          <Icons.Search className="absolute left-spacing-md top-spacing-2xs/2 -translate-y-1/2 w-spacing-md h-spacing-md text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar..."
            className="pl-spacing-xl rounded-premium-full border-border/20 bg-muted/10 focus-visible:ring-primary/20"
          />
        </div>
        <div className="flex flex-wrap items-center gap-spacing-xs">
          <select value={contentFilter} onChange={(e) => setContentFilter(e.target.value)} className="h-10 rounded-premium-full border border-border/20 bg-muted/10 px-3 text-xs">
            <option value="all">Todos os conteúdos</option>
            <option value="bible">Bíblia</option>
            <option value="catechism">Catecismo</option>
            <option value="magisterium">Magistério</option>
            <option value="saint">Santos</option>
          </select>
          {activeTab === 'notes' && (
            <select value={colorFilter} onChange={(e) => setColorFilter(e.target.value)} className="h-10 rounded-premium-full border border-border/20 bg-muted/10 px-3 text-xs">
              <option value="all">Todas as cores</option>
              <option value="yellow">Amarelo</option>
              <option value="green">Verde</option>
              <option value="blue">Azul</option>
              <option value="red">Vermelho</option>
              <option value="primary">Principal</option>
            </select>
          )}
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)} className="h-10 rounded-premium-full border border-border/20 bg-muted/10 px-3 text-xs">
            <option value="all">Qualquer data</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="older">Mais antigas</option>
          </select>
        </div>
      </div>

      {notesError && (
        <div role="alert" className="rounded-premium border border-destructive/20 bg-destructive/5 p-spacing-md text-sm text-destructive">
          Não foi possível carregar suas anotações. Tente novamente.
        </div>
      )}

      <AnimatePresence mode="wait">
        {activeTab === 'notes' ? (
          <motion.div
            key="notes"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-spacing-lg"
          >
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <NoteCard 
                  key={note.id} 
                  note={note} 
                  onUpdate={handleUpdateNote} 
                  onDelete={handleDeleteNote}
                  onNavigate={() => {
                    const params = new URLSearchParams();
                    let url = '/';

                    if (note.content_type === 'bible' && note.book_abbr && note.chapter) {
                      params.set('book', note.book_abbr);
                      params.set('ch', String(note.chapter));
                      if (note.verse) params.set('v', String(note.verse));
                      url = `/bible?${params.toString()}`;
                    } else if (note.content_type === 'catechism' && note.paragraph) {
                      url = `/catechism?p=${encodeURIComponent(String(note.paragraph))}`;
                    } else if (note.content_type === 'magisterium' && note.content_id) {
                      const [docId, paragraphIndex] = note.content_id.split(':');
                      url = `/magisterium/${encodeURIComponent(docId)}`;
                      if (paragraphIndex && /^\d+$/.test(paragraphIndex)) {
                        url += `?p=${encodeURIComponent(paragraphIndex)}`;
                      }
                    } else if (note.content_type === 'saint' && note.content_id) {
                      url = `/santos/${encodeURIComponent(note.content_id)}`;
                    }

                    navigate(url);
                  }}
                />
              ))
            ) : (
              <EmptyState icon={Icons.Book} message="Nenhuma anotação encontrada." />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="marks"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-spacing-lg"
          >
            {filteredMarks.length > 0 ? (
              filteredMarks.map((mark) => (
                <MarkCard 
                  key={mark.id} 
                  mark={mark} 
                  onDelete={() => deleteMark(mark.id)}
                  onNavigate={() => navigate(mark.url || '#')}
                />
              ))
            ) : (
              <EmptyState icon={Icons.Bookmark} message="Nenhuma marca de leitura encontrada." />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const NoteCard = ({ note, onUpdate, onDelete, onNavigate }: { 
  note: UserNote; 
  onUpdate: (note: UserNote, text: string) => void; 
  onDelete: (note: UserNote) => void;
  onNavigate: () => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(note.note_text);

  return (
    <motion.div
      layout
      className="bg-card border border-border/40 rounded-premium p-spacing-lg space-y-spacing-md hover:border-primary/20 transition-all group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-spacing-sm">
          <div className="px-spacing-xs py-spacing-2xs rounded-premium-full bg-primary/5 text-[9px] font-black uppercase tracking-widest text-primary">
            {note.content_type}
          </div>
          <span className="text-premium-xs font-bold text-muted-foreground">{note.content_id}</span>
        </div>
        <div className="flex gap-spacing-2xs opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-spacing-xl w-spacing-xl rounded-premium-full" onClick={() => setIsEditing(!isEditing)}>
            <Icons.PenLine className="w-spacing-sm h-spacing-sm" />
          </Button>
          <Button variant="ghost" size="icon" className="h-spacing-xl w-spacing-xl rounded-premium-full text-destructive" onClick={() => onDelete(note)}>
            <Icons.Trash className="w-spacing-sm h-spacing-sm" />
          </Button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-spacing-sm">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full bg-muted/10 rounded-premium p-spacing-md text-premium-sm font-serif leading-relaxed border-none focus:ring-1 focus:ring-primary/20 resize-none"
            rows={4}
          />
          <div className="flex justify-end gap-spacing-xs">
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancelar</Button>
            <Button size="sm" onClick={() => { onUpdate(note, editText); setIsEditing(false); }}>Salvar</Button>
          </div>
        </div>
      ) : (
        <p className="text-premium-sm md:text-premium-base font-serif italic leading-relaxed text-primary/80">
          "{note.note_text}"
        </p>
      )}

      <div className="flex items-center justify-between pt-spacing-xs">
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
          {format(new Date(note.created_at), "d 'de' MMM, yy", { locale: ptBR })}
        </span>
        <Button variant="ghost" size="sm" className="h-spacing-lg text-[10px] font-bold uppercase tracking-widest" onClick={onNavigate}>
          Ver Contexto <Icons.ArrowRight className="ml-spacing-2xs w-spacing-sm h-spacing-sm" />
        </Button>
      </div>
    </motion.div>
  );
};

const MarkCard = ({ mark, onDelete, onNavigate }: { 
  mark: ReadingMark; 
  onDelete: () => void;
  onNavigate: () => void;
}) => (
  <motion.div
    layout
    className="bg-muted/10 border border-border/10 rounded-premium p-spacing-lg space-y-spacing-md hover:bg-muted/20 transition-all group relative overflow-hidden"
  >
    <div className="flex items-center gap-spacing-sm">
      <div className="w-spacing-xl h-spacing-xl rounded-premium-full bg-primary/5 flex items-center justify-center text-primary">
        <Icons.Bookmark className="w-spacing-md h-spacing-md" />
      </div>
      <div className="min-w-spacing-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-spacing-3xs">{mark.content_type}</p>
        <h4 className="text-premium-sm font-bold truncate">{mark.label || mark.content_id}</h4>
      </div>
    </div>

    <div className="flex items-center justify-between pt-spacing-xs">
      <span className="text-[10px] text-muted-foreground">
        {format(new Date(mark.created_at), "dd/MM/yyyy")}
      </span>
      <div className="flex gap-spacing-xs">
        <Button variant="ghost" size="icon" className="h-spacing-xl w-spacing-xl rounded-premium-full text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={onDelete}>
          <Icons.Trash className="w-spacing-sm h-spacing-sm" />
        </Button>
        <Button size="sm" className="h-spacing-xl rounded-premium-full text-[10px] font-bold uppercase tracking-widest" onClick={onNavigate}>
          Continuar
        </Button>
      </div>
    </div>
  </motion.div>
);

const EmptyState = ({ icon: Icon, message }: { icon: any; message: string }) => (
  <div className="col-span-full py-spacing-3xl text-center opacity-30">
    <Icon className="w-spacing-2xl h-spacing-2xl mx-auto mb-spacing-md stroke-1" />
    <p className="font-serif italic">{message}</p>
  </div>
);

export default StudyJournal;
