import { supabase } from './supabase';

export interface BreathingSession {
  id: string;
  user_id: string;
  exercise_type: string;
  duration_seconds: number;
  completed: boolean;
  calm_before: number;
  calm_after: number;
  created_at: string;
}

export async function logBreathingSession(
  userId: string,
  session: {
    exercise_type: string;
    duration_seconds: number;
    calm_before: number;
    calm_after: number;
  }
): Promise<BreathingSession | null> {
  try {
    const { data, error } = await supabase
      .from('breathing_sessions')
      .insert({
        user_id: userId,
        ...session,
        completed: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error logging breathing session:', error);
    return null;
  }
}

export async function getBreathingSessions(
  userId: string,
  limit = 50
): Promise<BreathingSession[]> {
  try {
    const { data, error } = await supabase
      .from('breathing_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching breathing sessions:', error);
    return [];
  }
}

export async function getBreathingStats(userId: string): Promise<{
  totalSessions: number;
  totalMinutes: number;
  averageCalmChange: number;
}> {
  try {
    const { data, error } = await supabase
      .from('breathing_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', true);

    if (error) {
      throw error;
    }

    const sessions = data || [];

    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalMinutes: 0,
        averageCalmChange: 0,
      };
    }

    const totalSeconds = sessions.reduce(
      (sum, session) => sum + (session.duration_seconds || 0),
      0
    );
    const totalMinutes = Math.round(totalSeconds / 60);

    const calmChanges = sessions.map(
      (session) => (session.calm_after || 0) - (session.calm_before || 0)
    );
    const averageCalmChange =
      calmChanges.reduce((sum, change) => sum + change, 0) / sessions.length;

    return {
      totalSessions: sessions.length,
      totalMinutes,
      averageCalmChange: Math.round(averageCalmChange * 10) / 10,
    };
  } catch (error) {
    console.error('Error fetching breathing stats:', error);
    return {
      totalSessions: 0,
      totalMinutes: 0,
      averageCalmChange: 0,
    };
  }
}
