import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import {
  JournalEntry,
  getJournalEntries,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
} from '../services/journal';

export interface JournalState {
  entries: JournalEntry[];
  loading: boolean;
  error: string | null;
  page: number;
}

export function useJournal() {
  const { user } = useAuth();
  const [state, setState] = useState<JournalState>({
    entries: [],
    loading: true,
    error: null,
    page: 0,
  });

  useEffect(() => {
    if (!user?.id) {
      setState({
        entries: [],
        loading: false,
        error: null,
        page: 0,
      });
      return;
    }

    const init = async () => {
      try {
        const entries = await getJournalEntries(user.id, 50, 0);

        setState({
          entries,
          loading: false,
          error: null,
          page: 0,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load journal';
        setState((prev) => ({
          ...prev,
          loading: false,
          error: message,
        }));
      }
    };

    init();
  }, [user?.id]);

  async function refresh(): Promise<void> {
    if (!user?.id) return;

    try {
      setState((prev) => ({ ...prev, loading: true }));

      const entries = await getJournalEntries(user.id, 50, 0);

      setState({
        entries,
        loading: false,
        error: null,
        page: 0,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to refresh journal';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: message,
      }));
    }
  }

  async function loadMore(): Promise<void> {
    if (!user?.id) return;

    try {
      const nextPage = state.page + 1;
      const newEntries = await getJournalEntries(user.id, 50, nextPage * 50);

      setState((prev) => ({
        ...prev,
        entries: [...prev.entries, ...newEntries],
        page: nextPage,
      }));
    } catch (error) {
      console.error('Error loading more entries:', error);
    }
  }

  async function create(entry: {
    title: string;
    content: string;
    mood: 'terrible' | 'poor' | 'neutral' | 'good' | 'excellent';
    mood_score: number;
    tags: string[];
  }): Promise<JournalEntry | null> {
    if (!user?.id) return null;

    try {
      const newEntry = await createJournalEntry(user.id, entry);

      if (newEntry) {
        setState((prev) => ({
          ...prev,
          entries: [newEntry, ...prev.entries],
        }));
      }

      return newEntry;
    } catch (error) {
      console.error('Error creating journal entry:', error);
      return null;
    }
  }

  async function update(
    entryId: string,
    updates: Partial<Omit<JournalEntry, 'id' | 'user_id' | 'created_at'>>
  ): Promise<JournalEntry | null> {
    if (!user?.id) return null;

    try {
      const updated = await updateJournalEntry(user.id, entryId, updates);

      if (updated) {
        setState((prev) => ({
          ...prev,
          entries: prev.entries.map((e) => (e.id === entryId ? updated : e)),
        }));
      }

      return updated;
    } catch (error) {
      console.error('Error updating journal entry:', error);
      return null;
    }
  }

  async function remove(entryId: string): Promise<boolean> {
    if (!user?.id) return false;

    try {
      const success = await deleteJournalEntry(user.id, entryId);

      if (success) {
        setState((prev) => ({
          ...prev,
          entries: prev.entries.filter((e) => e.id !== entryId),
        }));
      }

      return success;
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      return false;
    }
  }

  return {
    ...state,
    refresh,
    loadMore,
    create,
    update,
    delete: remove,
  };
}
