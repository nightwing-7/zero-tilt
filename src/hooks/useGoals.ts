import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { GoalRow, GoalCheckinRow } from '@/types/database';

type Goal = GoalRow;
type GoalCheckin = GoalCheckinRow;

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [checkins, setCheckins] = useState<GoalCheckin[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [goalsRes, checkinsRes] = await Promise.all([
        supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('sort_order'),
        supabase
          .from('goal_checkins')
          .select('*')
          .eq('user_id', user.id)
          .gte('checked_date', getWeekStart())
          .order('checked_date'),
      ]);

      if (goalsRes.data) setGoals(goalsRes.data);
      if (checkinsRes.data) setCheckins(checkinsRes.data);
    } catch (err) {
      console.error('Error fetching goals:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleGoalDay = useCallback(async (goalId: string, date: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const existing = checkins.find(
      (c) => c.goal_id === goalId && c.checked_date === date
    );

    if (existing) {
      await supabase.from('goal_checkins').delete().eq('id', existing.id);
      setCheckins((prev) => prev.filter((c) => c.id !== existing.id));
    } else {
      const { data } = await supabase
        .from('goal_checkins')
        .insert({ user_id: user.id, goal_id: goalId, checked_date: date })
        .select()
        .single();
      if (data) setCheckins((prev) => [...prev, data]);
    }
  }, [checkins]);

  const addGoal = useCallback(async (label: string, icon: string, color: string, isCustom = false) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        label,
        icon,
        color,
        is_custom: isCustom,
        sort_order: goals.length,
      })
      .select()
      .single();

    if (data) setGoals((prev) => [...prev, data]);
    return data;
  }, [goals.length]);

  const removeGoal = useCallback(async (goalId: string) => {
    await supabase.from('goals').update({ is_active: false }).eq('id', goalId);
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  }, []);

  // Get progress for a goal (weekdays only)
  const getGoalProgress = useCallback((goalId: string) => {
    const tradingDays = getTradingDays();
    const goalCheckins = checkins.filter((c) => c.goal_id === goalId);
    const checked = tradingDays.filter((d) =>
      goalCheckins.some((c) => c.checked_date === d.key)
    ).length;
    return Math.round((checked / tradingDays.length) * 100);
  }, [checkins]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  return {
    goals,
    checkins,
    loading,
    toggleGoalDay,
    addGoal,
    removeGoal,
    getGoalProgress,
    refresh: fetchGoals,
  };
}

// Helper: get last 5 trading days (Mon-Fri)
export function getTradingDays() {
  const days: { key: string; dayLabel: string; dayNum: number; isToday: boolean }[] = [];
  const today = new Date();
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  let offset = 0;

  while (days.length < 5) {
    const check = new Date(today);
    check.setDate(check.getDate() - offset);
    const dow = check.getDay();
    if (dow !== 0 && dow !== 6) {
      days.unshift({
        key: check.toISOString().split('T')[0],
        dayLabel: dayLabels[dow],
        dayNum: check.getDate(),
        isToday: offset === 0,
      });
    }
    offset++;
  }
  return days;
}

function getWeekStart() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff - 7)); // Go back extra week for safety
  return monday.toISOString().split('T')[0];
}
