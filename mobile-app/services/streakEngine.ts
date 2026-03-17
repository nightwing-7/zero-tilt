import { supabase } from './supabase';
import { getProfile } from './profile';

export interface StreakData {
  current_days: number;
  best_streak: number;
  start_date: string;
  last_checkin: string;
}

export interface CheckInResult {
  isNewCheckIn: boolean;
  current_days: number;
  best_streak: number;
  message: string;
}

export function getDateInTimezone(timezone: string): Date {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const now = new Date();
  const parts = formatter.formatToParts(now);
  const year = parseInt(parts.find(p => p.type === 'year')?.value || '2024');
  const month = parseInt(parts.find(p => p.type === 'month')?.value || '1') - 1;
  const day = parseInt(parts.find(p => p.type === 'day')?.value || '1');

  const localDate = new Date(year, month, day);
  return localDate;
}

export function dateToIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isoDateToDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export async function getCurrentStreak(userId: string): Promise<StreakData | null> {
  try {
    const { data, error } = await supabase.rpc('get_current_streak', {
      p_user_id: userId,
    });

    if (error) {
      console.error('Error fetching current streak:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    return data[0];
  } catch (error) {
    console.error('Error in getCurrentStreak:', error);
    return null;
  }
}

export async function getBestStreak(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('get_best_streak', {
      p_user_id: userId,
    });

    if (error) {
      console.error('Error fetching best streak:', error);
      return 0;
    }

    return data || 0;
  } catch (error) {
    console.error('Error in getBestStreak:', error);
    return 0;
  }
}

export async function checkInToday(userId: string): Promise<CheckInResult> {
  try {
    const profile = await getProfile(userId);
    const userTimezone = profile?.timezone || 'America/New_York';

    const today = getDateInTimezone(userTimezone);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayIso = dateToIsoDate(today);
    const yesterdayIso = dateToIsoDate(yesterday);

    const streak = await getCurrentStreak(userId);

    if (!streak) {
      const { data, error } = await supabase
        .from('streaks')
        .insert({
          user_id: userId,
          current_days: 1,
          best_streak: 1,
          start_date: todayIso,
          last_checkin: todayIso,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        isNewCheckIn: true,
        current_days: 1,
        best_streak: 1,
        message: 'Streak started! Keep it up!',
      };
    }

    const lastCheckinIso = streak.last_checkin.split('T')[0];

    if (lastCheckinIso === todayIso) {
      return {
        isNewCheckIn: false,
        current_days: streak.current_days,
        best_streak: streak.best_streak,
        message: 'You already checked in today!',
      };
    }

    let newCurrentDays = 1;
    let newStartDate = todayIso;

    if (lastCheckinIso === yesterdayIso) {
      newCurrentDays = streak.current_days + 1;
      newStartDate = streak.start_date;
    }

    const newBest = Math.max(newCurrentDays, streak.best_streak);

    const { data, error } = await supabase
      .from('streaks')
      .update({
        current_days: newCurrentDays,
        best_streak: newBest,
        start_date: newStartDate,
        last_checkin: todayIso,
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (newCurrentDays === 1 && lastCheckinIso !== yesterdayIso) {
      return {
        isNewCheckIn: true,
        current_days: 1,
        best_streak: newBest,
        message: 'Streak restarted. Keep pushing forward!',
      };
    }

    return {
      isNewCheckIn: true,
      current_days: newCurrentDays,
      best_streak: newBest,
      message: `Excellent! Day ${newCurrentDays} of your streak!`,
    };
  } catch (error) {
    console.error('Error in checkInToday:', error);
    throw error;
  }
}

export async function resetStreakWithRelapse(
  userId: string,
  triggerCategory: string = 'unknown',
  emotionalState: string = 'frustrated',
  notes: string = '',
  severity: 'mild' | 'moderate' | 'severe' = 'moderate'
): Promise<{ relapse_id: string; previous_streak: number; message: string }> {
  try {
    const { data, error } = await supabase.rpc('reset_streak', {
      p_user_id: userId,
      p_trigger_category: triggerCategory,
      p_emotional_state: emotionalState,
      p_notes: notes,
      p_severity: severity,
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in resetStreakWithRelapse:', error);
    throw error;
  }
}

export async function getStreakHistory(userId: string): Promise<any[]> {
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
    console.error('Error in getStreakHistory:', error);
    return [];
  }
}
