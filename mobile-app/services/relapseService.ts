import { supabase } from './supabase';
import { resetStreakWithRelapse } from './streakEngine';

export interface RelapseEvent {
  id: string;
  user_id: string;
  streak_before: number;
  trigger_category: string;
  emotional_state: string;
  notes: string;
  severity: 'mild' | 'moderate' | 'severe';
  created_at: string;
}

export async function logRelapse(
  userId: string,
  triggerCategory: string = 'unknown',
  emotionalState: string = 'frustrated',
  notes: string = '',
  severity: 'mild' | 'moderate' | 'severe' = 'moderate'
): Promise<{ relapse_id: string; previous_streak: number; message: string }> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.toISOString();
    const todayEnd = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString();

    const { data: todaysRelapses, error: countError } = await supabase
      .from('relapse_events')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', todayStart)
      .lt('created_at', todayEnd);

    if (countError && countError.code !== 'PGRST116') {
      throw countError;
    }

    if (todaysRelapses && todaysRelapses.length > 0) {
      return {
        relapse_id: todaysRelapses[0].id,
        previous_streak: 0,
        message: 'You already logged a relapse today. Focus on recovery.',
      };
    }

    const result = await resetStreakWithRelapse(
      userId,
      triggerCategory,
      emotionalState,
      notes,
      severity
    );

    return result;
  } catch (error) {
    console.error('Error in logRelapse:', error);
    throw error;
  }
}

export async function getRelapseHistory(userId: string, limit: number = 50): Promise<RelapseEvent[]> {
  try {
    const { data, error } = await supabase
      .from('relapse_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getRelapseHistory:', error);
    return [];
  }
}

export async function getTodaysRelapses(userId: string): Promise<number> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.toISOString();
    const todayEnd = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('relapse_events')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', todayStart)
      .lt('created_at', todayEnd);

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data?.length || 0;
  } catch (error) {
    console.error('Error in getTodaysRelapses:', error);
    return 0;
  }
}

export async function getRelapseStats(userId: string): Promise<{
  totalRelapses: number;
  mildCount: number;
  moderateCount: number;
  severeCount: number;
  mostCommonTrigger: string;
}> {
  try {
    const { data, error } = await supabase
      .from('relapse_events')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    const relapses = data || [];

    if (relapses.length === 0) {
      return {
        totalRelapses: 0,
        mildCount: 0,
        moderateCount: 0,
        severeCount: 0,
        mostCommonTrigger: 'N/A',
      };
    }

    const mildCount = relapses.filter(r => r.severity === 'mild').length;
    const moderateCount = relapses.filter(r => r.severity === 'moderate').length;
    const severeCount = relapses.filter(r => r.severity === 'severe').length;

    const triggerCounts: Record<string, number> = {};
    relapses.forEach(r => {
      triggerCounts[r.trigger_category] = (triggerCounts[r.trigger_category] || 0) + 1;
    });

    const mostCommonTrigger =
      Object.entries(triggerCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

    return {
      totalRelapses: relapses.length,
      mildCount,
      moderateCount,
      severeCount,
      mostCommonTrigger,
    };
  } catch (error) {
    console.error('Error in getRelapseStats:', error);
    return {
      totalRelapses: 0,
      mildCount: 0,
      moderateCount: 0,
      severeCount: 0,
      mostCommonTrigger: 'N/A',
    };
  }
}
