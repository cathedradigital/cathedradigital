import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/db';
import { useAuth } from './useAuth';
import { saveUserPsychology } from '@/lib/psychologicalProfile';

export interface UserNote {
  id: string;
  content_type: string;
  content_id: string;
  note_text: string;
  highlight_color: string;
  book_abbr?: string;
  chapter?: number;
  paragraph?: number;
  verse?: number;
  created_at: string;
  updated_at: string;
}

export function useNotes(contentType: string, contentId?: string) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!user) { setNotes([]); return; }
    setLoading(true);
    let query = supabase
      .from('user_notes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // "all" is an aggregation mode used by the journal, not a persisted content type.
    if (contentType !== 'all') query = query.eq('content_type', contentType);
    if (contentId) query = query.eq('content_id', contentId);

    const { data } = await query;
    setNotes((data as UserNote[]) || []);
    setLoading(false);
  }, [user, contentType, contentId]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  // Realtime synchronization
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`user_notes_realtime_${contentType}_${contentId || 'all'}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_notes',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          // Only refresh if it matches the content type filter (if not 'all')
          const newNote = payload.new as any;
          if (contentType === 'all' || (newNote && newNote.content_type === contentType)) {
            fetchNotes();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchNotes, contentType, contentId]);

  const addNote = useCallback(async (cId: string, text: string, color = 'yellow', context?: { book_abbr?: string; chapter?: number; paragraph?: number; verse?: number }) => {
    if (!user || !text.trim()) return null;
    
    // Create temporary item for optimistic UI
    const tempId = crypto.randomUUID();
    const tempNote: UserNote = {
      id: tempId,
      content_type: contentType,
      content_id: cId,
      note_text: text.trim(),
      highlight_color: color,
      ...context,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // Optimistic update
    setNotes(prev => [tempNote, ...prev]);

    try {
      const { data, error } = await supabase
        .from('user_notes')
        .insert({ user_id: user.id, content_type: contentType, content_id: cId, note_text: text.trim(), highlight_color: color, ...context })
        .select()
        .single();
        
      if (!error && data) {
        // Replace temp note with real data from server
        setNotes(prev => prev.map(n => n.id === tempId ? (data as UserNote) : n));
        
        // Save psychological profile (backgrounded)
        saveUserPsychology(user.id, text.trim(), `note_${contentType}`);
        
        return data as UserNote;
      } else {
        throw error || new Error('Failed to save note');
      }
    } catch (err) {
      console.error('Error adding note:', err);
      // Rollback optimistic update
      setNotes(prev => prev.filter(n => n.id !== tempId));
      return null;
    }
  }, [user, contentType]);

  const updateNote = useCallback(async (noteId: string, text: string, color?: string) => {
    if (!user || !text.trim()) return false;

    const previous = notes.find((note) => note.id === noteId);
    if (!previous) return false;

    const updates: Partial<UserNote> = {
      note_text: text.trim(),
      updated_at: new Date().toISOString(),
      ...(color ? { highlight_color: color } : {}),
    };

    // Keep the UI responsive, but never claim persistence until Supabase confirms it.
    setNotes((prev) => prev.map((note) => note.id === noteId ? { ...note, ...updates } : note));

    const { data, error } = await supabase
      .from('user_notes')
      .update(updates)
      .eq('id', noteId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error || !data) {
      console.error('Error updating note:', error);
      setNotes((prev) => prev.map((note) => note.id === noteId ? previous : note));
      return false;
    }

    setNotes((prev) => prev.map((note) => note.id === noteId ? (data as UserNote) : note));
    return true;
  }, [user, notes]);

  const deleteNote = useCallback(async (noteId: string) => {
    if (!user) return false;

    const previous = notes.find((note) => note.id === noteId);
    if (!previous) return false;

    // Optimistic delete with rollback if RLS/network rejects the mutation.
    setNotes((prev) => prev.filter((note) => note.id !== noteId));

    const { error } = await supabase
      .from('user_notes')
      .delete()
      .eq('id', noteId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting note:', error);
      setNotes((prev) => prev.some((note) => note.id === noteId) ? prev : [...prev, previous]);
      return false;
    }

    return true;
  }, [user, notes]);

  return { notes, loading, addNote, updateNote, deleteNote, refetch: fetchNotes };
}
