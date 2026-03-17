import { supabase } from './supabase';

export interface Streak {
  id: string;
  user_id: string;
  current_days: number;
  best_streak: number;
  is_active: boolean;
  started_at: string;
  last_check_in: string;
  created_at: string;
  updated_at: string;
}

export async function getCurrentStreak(userId: string): Promise<Streak | null> {
  try {
    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error fetching current streak:', error);
    return null;
  }
}

export async function getBestStreak(userId: string): Promise<number> {
  try {
    const streak = await getCurrentStreak(userId);
    return streak?.best_streak || 0;
  } catch (error) {
    console.error('Error fetching best streak:', error);
    return 0;
  }
}

export async function resetStreak(userId: string): Promise<Streak | null> {
  try {
    const { data, error } = await supabase
      .from('streaks')
      .update({
        current_days: 0,
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error resetting streak:', error);
    return null;
  }
}

export async function incrementStreak(userId: string): Promise<Streak | null> {
  try {
    const currentStreak = await getCurrentStreak(userId);

    if (!currentStreak) {
      const { data, error } = await supabase
        .from('streaks')
        .insert({
          user_id: userId,
          current_days: 1,
          best_streak: 1,
          is_active: true,
          started_at: new Date().toISOString(),
          last_check_in: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data || null;
    }

    const newCurrent = currentStreak.current_days + 1;
    const newBest = Math.max(newCurrent, currentStreak.best_streak);

    const { data, error } = await supabase
      .from('streaks')
      .update({
        current_days: newCurrent,
        best_streak: newBest,
        is_active: true,
        last_check_in: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error incrementing streak:', error);
    return null;
  }
}

export async function getStreakHistory(userId: string): Promise<Streak[]> {
  try {
    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching streak history:', error);
    return [];
  }
}
