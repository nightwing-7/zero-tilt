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

export async function startPanicSession(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('breathing_sessions')
      .insert({
        user_id: userId,
        exercise_type: '4-7-8 Breathing',
        duration_seconds: 0,
        calm_before: 5,
        calm_after: 5,
        completed: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data?.id || null;
  } catch (error) {
    console.error('Error in startPanicSession:', error);
    return null;
  }
}

export async function completePanicSession(
  sessionId: string,
  durationSeconds: number,
  calmBefore: number,
  calmAfter: number
): Promise<BreathingSession | null> {
  try {
    const { data, error } = await supabase
      .from('breathing_sessions')
      .update({
        duration_seconds: durationSeconds,
        calm_before: calmBefore,
        calm_after: calmAfter,
        completed: true,
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error in completePanicSession:', error);
    return null;
  }
}

export async function abandonPanicSession(sessionId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('breathing_sessions')
      .update({
        completed: false,
      })
      .eq('id', sessionId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in abandonPanicSession:', error);
    return false;
  }
}

export async function logPanicUrge(
  userId: string,
  intensity: number,
  triggerType: string = 'panic',
  triggerDetails: string = 'After breathing session',
  notes: string = ''
): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('urge_logs')
      .insert({
        user_id: userId,
        intensity: Math.max(1, Math.min(10, intensity)),
        trigger_type: triggerType,
        trigger_details: triggerDetails,
        coping_strategies: ['Breathing Exercise'],
        outcome: 'used_panic',
        notes,
        duration_seconds: 0,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error in logPanicUrge:', error);
    return null;
  }
}
