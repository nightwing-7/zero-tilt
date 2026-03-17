import { supabase } from './supabase';

export interface JournalEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood: 'great' | 'good' | 'neutral' | 'bad' | 'terrible' | 'poor' | 'excellent';
  mood_score: number;
  tags: string[];
  word_count: number;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export async function getJournalEntries(
  userId: string,
  limit = 50,
  offset = 0
): Promise<JournalEntry[]> {
  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return [];
  }
}

export async function getJournalEntryById(
  userId: string,
  entryId: string
): Promise<JournalEntry | null> {
  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('id', entryId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    return null;
  }
}

export async function createJournalEntry(
  userId: string,
  entry: {
    title: string;
    content: string;
    mood: 'terrible' | 'poor' | 'neutral' | 'good' | 'excellent';
    mood_score: number;
    tags: string[];
  }
): Promise<JournalEntry | null> {
  try {
    const wordCount = entry.content.split(/\s+/).filter((word) => word.length > 0).length;

    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: userId,
        ...entry,
        word_count: wordCount,
        is_favorite: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error creating journal entry:', error);
    return null;
  }
}

export async function updateJournalEntry(
  userId: string,
  entryId: string,
  updates: Partial<Omit<JournalEntry, 'id' | 'user_id' | 'created_at'>>
): Promise<JournalEntry | null> {
  try {
    const wordCount = updates.content
      ? updates.content.split(/\s+/).filter((word) => word.length > 0).length
      : undefined;

    const { data, error } = await supabase
      .from('journal_entries')
      .update({
        ...updates,
        ...(wordCount !== undefined && { word_count: wordCount }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', entryId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error updating journal entry:', error);
    return null;
  }
}

export async function deleteJournalEntry(
  userId: string,
  entryId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', entryId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    return false;
  }
}

export async function toggleFavorite(
  userId: string,
  entryId: string,
  isFavorite: boolean
): Promise<JournalEntry | null> {
  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .update({
        is_favorite: isFavorite,
        updated_at: new Date().toISOString(),
      })
      .eq('id', entryId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return null;
  }
}

export async function getJournalStats(userId: string): Promise<{
  totalEntries: number;
  totalWords: number;
  averageMoodScore: number;
}> {
  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('word_count, mood_score')
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    const entries = data || [];
    const totalWords = entries.reduce((sum, entry) => sum + (entry.word_count || 0), 0);
    const averageMoodScore =
      entries.length > 0
        ? entries.reduce((sum, entry) => sum + (entry.mood_score || 0), 0) / entries.length
        : 0;

    return {
      totalEntries: entries.length,
      totalWords,
      averageMoodScore,
    };
  } catch (error) {
    console.error('Error fetching journal stats:', error);
    return {
      totalEntries: 0,
      totalWords: 0,
      averageMoodScore: 0,
    };
  }
}
