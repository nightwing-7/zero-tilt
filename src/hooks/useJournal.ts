import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { JournalEntryRow } from '@/types/database';

type JournalEntry = JournalEntryRow;

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) setEntries(data);
      if (error) console.error('Error fetching journal:', error);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addEntry = useCallback(async (entry: Partial<Omit<JournalEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('journal_entries')
      .insert({ ...entry, user_id: user.id })
      .select()
      .single();

    if (data) setEntries((prev) => [data, ...prev]);
    return { data, error };
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    const { error } = await supabase.from('journal_entries').delete().eq('id', id);
    if (!error) setEntries((prev) => prev.filter((e) => e.id !== id));
    return { error };
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  return { entries, loading, addEntry, deleteEntry, refresh: fetchEntries };
}
