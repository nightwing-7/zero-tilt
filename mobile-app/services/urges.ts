import { supabase } from './supabase';

export interface UrgeLog {
  id: string;
  user_id: string;
  intensity: number;
  trigger_type: string;
  trigger_details: string;
  coping_strategies: string[];
  outcome: 'resisted' | 'gave_in' | 'distracted' | 'used_panic';
  notes: string;
  created_at: string;
  updated_at: string;
  duration_seconds?: number;
}

export interface UrgeStats {
  totalUrges: number;
  resistRate: number;
  averageIntensity: number;
  mostCommonTrigger: string;
  mostUsedStrategy: string;
}

export async function logUrge(
  userId: string,
  urge: {
    intensity: number;
    trigger_type: string;
    trigger_details: string;
    coping_strategies: string[];
    outcome: 'resisted' | 'gave_in' | 'distracted' | 'used_panic';
    notes: string;
  }
): Promise<UrgeLog | null> {
  try {
    const { data, error } = await supabase
      .from('urge_logs')
      .insert({
        user_id: userId,
        ...urge,
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
    console.error('Error logging urge:', error);
    return null;
  }
}

export async function getUrgeHistory(
  userId: string,
  limit = 50,
  offset = 0
): Promise<UrgeLog[]> {
  try {
    const { data, error } = await supabase
      .from('urge_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching urge history:', error);
    return [];
  }
}

export async function getTodaysUrges(userId: string): Promise<UrgeLog[]> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.toISOString();
    const todayEnd = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('urge_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', todayStart)
      .lt('created_at', todayEnd)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching today\'s urges:', error);
    return [];
  }
}

export async function getUrgeStats(userId: string): Promise<UrgeStats> {
  try {
    const { data, error } = await supabase
      .from('urge_logs')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    const urges = data || [];

    if (urges.length === 0) {
      return {
        totalUrges: 0,
        resistRate: 0,
        averageIntensity: 0,
        mostCommonTrigger: 'N/A',
        mostUsedStrategy: 'N/A',
      };
    }

    const resistedCount = urges.filter((u) => u.outcome === 'resisted').length;
    const resistRate = (resistedCount / urges.length) * 100;

    const averageIntensity =
      urges.reduce((sum, u) => sum + (u.intensity || 0), 0) / urges.length;

    const triggerCounts: Record<string, number> = {};
    urges.forEach((u) => {
      triggerCounts[u.trigger_type] = (triggerCounts[u.trigger_type] || 0) + 1;
    });
    const mostCommonTrigger =
      Object.entries(triggerCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

    const strategyCounts: Record<string, number> = {};
    urges.forEach((u) => {
      u.coping_strategies?.forEach((strategy) => {
        strategyCounts[strategy] = (strategyCounts[strategy] || 0) + 1;
      });
    });
    const mostUsedStrategy =
      Object.entries(strategyCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

    return {
      totalUrges: urges.length,
      resistRate: Math.round(resistRate),
      averageIntensity: Math.round(averageIntensity * 10) / 10,
      mostCommonTrigger,
      mostUsedStrategy,
    };
  } catch (error) {
    console.error('Error fetching urge stats:', error);
    return {
      totalUrges: 0,
      resistRate: 0,
      averageIntensity: 0,
      mostCommonTrigger: 'N/A',
      mostUsedStrategy: 'N/A',
    };
  }
}

export async function deleteUrge(userId: string, urgeId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('urge_logs')
      .delete()
      .eq('id', urgeId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting urge:', error);
    return false;
  }
}
