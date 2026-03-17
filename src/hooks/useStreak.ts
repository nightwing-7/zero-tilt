import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface Streak {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  days: number;
  is_current: boolean;
  ended_reason: string | null;
}

export function useStreak() {
  const [currentStreak, setCurrentStreak] = useState<Streak | null>(null);
  const [bestStreak, setBestStreak] = useState(0);
  const [totalRelapses, setTotalRelapses] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchStreak = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const userId = session.user.id;

      // Fetch current streak
      const { data: currentStreakData } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', userId)
        .eq('is_current', true)
        .single();

      if (currentStreakData) {
        // Calculate days from started_at to now
        const days = Math.floor(
          (Date.now() - new Date(currentStreakData.started_at).getTime()) / 86400000
        );
        const streak: Streak = {
          ...currentStreakData,
          days,
        };
        setCurrentStreak(streak);
      }

      // Fetch all streaks for history
      const { data: allStreaks } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (allStreaks && allStreaks.length > 0) {
        const best = Math.max(...allStreaks.map((s) => s.days || 0), 0);
        const relapses = allStreaks.filter((s) => !s.is_current && s.ended_reason).length;
        setBestStreak(best);
        setTotalRelapses(relapses);
      }
    } catch (err) {
      console.error('Error fetching streak:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetStreak = useCallback(async (reason: string = 'tilt') => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const userId = session.user.id;

      // End current streak
      const { error: endError } = await supabase
        .from('streaks')
        .update({
          is_current: false,
          ended_at: new Date().toISOString(),
          ended_reason: reason,
        })
        .eq('user_id', userId)
        .eq('is_current', true);

      if (endError) throw endError;

      // Create new streak
      const { data: newStreak, error: insertError } = await supabase
        .from('streaks')
        .insert({
          user_id: userId,
          started_at: new Date().toISOString(),
          days: 0,
          is_current: true,
          ended_reason: null,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      if (newStreak) {
        setCurrentStreak(newStreak);
        setTotalRelapses((prev) => prev + 1);
      }

      return newStreak;
    } catch (err) {
      console.error('Error resetting streak:', err);
    }
  }, []);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  return {
    streak: currentStreak?.days ?? 0,
    bestStreak,
    totalRelapses,
    startedAt: currentStreak?.started_at ?? null,
    loading,
    resetStreak,
    refreshStreak: fetchStreak,
  };
}
