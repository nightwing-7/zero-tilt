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

function getDraftKey(userId: string): string {
  return `journal_draft_${userId}`;
}

function getHistoryKey(userId: string): string {
  return `journal_draft_history_${userId}`;
}

export async function saveDraft(
  userId: string,
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

    storage.set(getDraftKey(userId), JSON.stringify(draft));

    const historyStr = storage.getString(getHistoryKey(userId));
    const history: string[] = historyStr ? JSON.parse(historyStr) : [];

    history.push(entryId || 'new');
    const uniqueHistory = Array.from(new Set(history)).slice(-10);
    storage.set(getHistoryKey(userId), JSON.stringify(uniqueHistory));
  } catch (error) {
    console.error('Error saving draft:', error);
  }
}

export async function getDraft(userId: string, entryId?: string): Promise<JournalDraft | null> {
  try {
    const draftStr = storage.getString(getDraftKey(userId));
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

export async function clearDraft(userId: string, entryId?: string): Promise<void> {
  try {
    const draftStr = storage.getString(getDraftKey(userId));
    if (!draftStr) {
      return;
    }

    const draft: JournalDraft = JSON.parse(draftStr);

    if (!entryId || draft.entryId === entryId) {
      storage.delete(getDraftKey(userId));
    }
  } catch (error) {
    console.error('Error clearing draft:', error);
  }
}

export async function hasDraft(userId: string): Promise<boolean> {
  try {
    const draftStr = storage.getString(getDraftKey(userId));
    return !!draftStr;
  } catch (error) {
    console.error('Error checking draft existence:', error);
    return false;
  }
}

export async function getDraftSaveTime(userId: string): Promise<number | null> {
  try {
    const draftStr = storage.getString(getDraftKey(userId));
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

export async function getDraftHistory(userId: string): Promise<string[]> {
  try {
    const historyStr = storage.getString(getHistoryKey(userId));
    return historyStr ? JSON.parse(historyStr) : [];
  } catch (error) {
    console.error('Error getting draft history:', error);
    return [];
  }
}

export async function clearAllDrafts(userId: string): Promise<void> {
  try {
    storage.delete(getDraftKey(userId));
    storage.delete(getHistoryKey(userId));
  } catch (error) {
    console.error('Error clearing all drafts:', error);
  }
}
