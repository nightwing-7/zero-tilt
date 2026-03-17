import { MMKV } from 'react-native-mmkv';

export interface JournalDraft {
  entryId?: string;
  title: string;
  content: string;
  mood?: string;
  tags?: string[];
  savedAt: number;
}

const storage = new MMKV();
const DRAFT_KEY = 'journal_draft_current';
const DRAFT_HISTORY_KEY = 'journal_draft_history';

export async function saveDraft(
  entryId: string | undefined,
  title: string,
  content: string,
  mood?: string,
  tags?: string[]
): Promise<void> {
  try {
    const draft: JournalDraft = {
      entryId,
      title,
      content,
      mood,
      tags,
      savedAt: Date.now(),
    };

    storage.set(DRAFT_KEY, JSON.stringify(draft));

    const historyStr = storage.getString(DRAFT_HISTORY_KEY);
    const history: string[] = historyStr ? JSON.parse(historyStr) : [];

    history.push(entryId || 'new');
    const uniqueHistory = Array.from(new Set(history)).slice(-10);
    storage.set(DRAFT_HISTORY_KEY, JSON.stringify(uniqueHistory));
  } catch (error) {
    console.error('Error saving draft:', error);
  }
}

export async function getDraft(entryId?: string): Promise<JournalDraft | null> {
  try {
    const draftStr = storage.getString(DRAFT_KEY);
    if (!draftStr) {
      return null;
    }

    const draft: JournalDraft = JSON.parse(draftStr);

    if (entryId && draft.entryId !== entryId) {
      return null;
    }

    return draft;
  } catch (error) {
    console.error('Error retrieving draft:', error);
    return null;
  }
}

export async function clearDraft(entryId?: string): Promise<void> {
  try {
    const draftStr = storage.getString(DRAFT_KEY);
    if (!draftStr) {
      return;
    }

    const draft: JournalDraft = JSON.parse(draftStr);

    if (!entryId || draft.entryId === entryId) {
      storage.delete(DRAFT_KEY);
    }
  } catch (error) {
    console.error('Error clearing draft:', error);
  }
}

export async function hasDraft(): Promise<boolean> {
  try {
    const draftStr = storage.getString(DRAFT_KEY);
    return !!draftStr;
  } catch (error) {
    console.error('Error checking draft existence:', error);
    return false;
  }
}

export async function getDraftSaveTime(): Promise<number | null> {
  try {
    const draftStr = storage.getString(DRAFT_KEY);
    if (!draftStr) {
      return null;
    }

    const draft: JournalDraft = JSON.parse(draftStr);
    return draft.savedAt;
  } catch (error) {
    console.error('Error getting draft save time:', error);
    return null;
  }
}

export async function getDraftHistory(): Promise<string[]> {
  try {
    const historyStr = storage.getString(DRAFT_HISTORY_KEY);
    return historyStr ? JSON.parse(historyStr) : [];
  } catch (error) {
    console.error('Error getting draft history:', error);
    return [];
  }
}

export async function clearAllDrafts(): Promise<void> {
  try {
    storage.delete(DRAFT_KEY);
    storage.delete(DRAFT_HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing all drafts:', error);
  }
}
