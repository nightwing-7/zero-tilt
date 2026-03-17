import { supabase } from './supabase';

export interface DailyCheckin {
  id: string;
  user_id: string;
  checkin_date: string;
  mood: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
  mood_score: number;
  energy_level: number;
  notes: string | null;
  created_at: string;
}

export async function getDailyCheckin(
  userId: string,
  date: string
): Promise<DailyCheckin | null> {
  try {
    const { data, error } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('user_id', userId)
      .eq('checkin_date', date)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching daily checkin:', error);
    return null;
  }
}

export async function createDailyCheckin(
  userId: string,
  checkin: {
    mood: DailyCheckin['mood'];
    mood_score: number;
    energy_level: number;
    notes?: string;
  }
): Promise<DailyCheckin | null> {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_checkins')
      .upsert({
        user_id: userId,
        checkin_date: today,
        mood: checkin.mood,
        mood_score: checkin.mood_score,
        energy_level: checkin.energy_level,
        notes: checkin.notes || null,
        created_at: new Date().toISOString(),
      }, { onConflict: 'user_id,checkin_date' })
      .select()
      .single();

    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error creating daily checkin:', error);
    return null;
  }
}

export async function getCheckinHistory(
  userId: string,
  days = 30
): Promise<DailyCheckin[]> {
  try {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('user_id', userId)
      .gte('checkin_date', since.toISOString().split('T')[0])
      .order('checkin_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching checkin history:', error);
    return [];
  }
}

export async function getCheckinStats(
  userId: string,
  days = 30
): Promise<{
  totalCheckins: number;
  averageMood: number;
  averageEnergy: number;
  moodDistribution: Record<string, number>;
}> {
  try {
    const checkins = await getCheckinHistory(userId, days);

    if (checkins.length === 0) {
      return {
        totalCheckins: 0,
        averageMood: 0,
        averageEnergy: 0,
        moodDistribution: {},
      };
    }

    const totalMood = checkins.reduce((sum, c) => sum + c.mood_score, 0);
    const totalEnergy = checkins.reduce((sum, c) => sum + c.energy_level, 0);

    const moodDistribution: Record<string, number> = {};
    checkins.forEach((c) => {
      moodDistribution[c.mood] = (moodDistribution[c.mood] || 0) + 1;
    });

    return {
      totalCheckins: checkins.length,
      averageMood: Math.round((totalMood / checkins.length) * 10) / 10,
      averageEnergy: Math.round((totalEnergy / checkins.length) * 10) / 10,
      moodDistribution,
    };
  } catch (error) {
    console.error('Error fetching checkin stats:', error);
    return {
      totalCheckins: 0,
      averageMood: 0,
      averageEnergy: 0,
      moodDistribution: {},
    };
  }
}
