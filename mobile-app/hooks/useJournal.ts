import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { useAnalytics } from './useAnalytics';
import {
  JournalEntry,
  getJournalEntries,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
} from '../services/journal';
import {
  saveDraft,
  getDraft,
  clearDraft,
  hasDraft,
  JournalDraft,
} from '../services/journalDraft';
import { checkAndUnlockMilestones } from '../services/milestoneEngine';

export interface JournalState {
  entries: JournalEntry[];
  draft: JournalDraft | null;
  hasPendingDraft: boolean;
  loading: boolean;
  error: string | null;
  page: number;
}

export function useJournal() {
  const { user } = useAuth();
  const { track } = useAnalytics();

  const [state, setState] = useState<JournalState>({
    entries: [],
    draft: null,
    hasPendingDraft: false,
    loading: true,
    error: null,
    page: 0,
  });

  useEffect(() => {
    if (!user?.id) {
      setState({
        entries: [],
        draft: null,
        hasPendingDraft: false,
        loading: false,
        error: null,
        page: 0,
      });
      return;
    }

    const init = async () => {
      try {
        const [entries, draftExists, draft] = await Promise.all([
          getJournalEntries(user.id, 50, 0),
          hasDraft(user.id),
          getDraft(user.id),
        ]);

        setState({
          entries,
          draft,
          hasPendingDraft: draftExists,
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

  async function saveDraftLocal(
    entryId: string | undefined,
    title: string,
    content: string,
    mood?: string,
    tags?: string[]
  ): Promise<void> {
    if (!user?.id) return;
    try {
      await saveDraft(user.id, entryId, title, content, mood, tags);
      setState((prev) => ({
        ...prev,
        hasPendingDraft: true,
        draft: { entryId, title, content, mood, tags, savedAt: Date.now() },
      }));
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  }

  async function loadDraft(entryId?: string): Promise<JournalDraft | null> {
    if (!user?.id) return null;
    try {
      const draft = await getDraft(user.id, entryId);
      if (draft) {
        setState((prev) => ({
          ...prev,
          draft,
          hasPendingDraft: true,
        }));
      }
      return draft;
    } catch (error) {
      console.error('Error loading draft:', error);
      return null;
    }
  }

  async function clearDraftLocal(entryId?: string): Promise<void> {
    if (!user?.id) return;
    try {
      await clearDraft(user.id, entryId);
      setState((prev) => ({
        ...prev,
        draft: null,
        hasPendingDraft: false,
      }));
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  }

  async function create(entry: {
    title: string;
    content: string;
    mood: 'terrible' | 'bad' | 'neutral' | 'good' | 'great';
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
          draft: null,
          hasPendingDraft: false,
        }));

        track('journal_entry_created', {
          mood: entry.mood,
          word_count: newEntry.word_count,
        });

        await clearDraftLocal();

        try {
          await checkAndUnlockMilestones(user.id);
        } catch (error) {
          console.error('Error checking milestones:', error);
        }
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

        track('journal_entry_updated', {
          word_count: updated.word_count,
        });

        try {
          await checkAndUnlockMilestones(user.id);
        } catch (error) {
          console.error('Error checking milestones:', error);
        }
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
    saveDraft: saveDraftLocal,
    loadDraft,
    clearDraft: clearDraftLocal,
  };
}
