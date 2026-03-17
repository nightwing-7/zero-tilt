import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useAnalytics } from './useAnalytics';
import {
  Goal,
  getUserGoals,
  createGoal,
  deleteGoal,
  toggleGoalCheckin,
  getGoalCheckinsForDate,
  getWeeklyGoalProgress,
} from '../services/goals';

export function useGoals() {
  const { user } = useAuth();
  const { track } = useAnalytics();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [checkedGoalIds, setCheckedGoalIds] = useState<Set<string>>(new Set());
  const [weeklyProgress, setWeeklyProgress] = useState({ totalGoals: 0, completedDays: 0, completionRate: 0 });
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  const loadGoals = useCallback(async () => {
    if (!user) return;
    try {
      const [goalsData, checkinsData, progressData] = await Promise.all([
        getUserGoals(user.id),
        getGoalCheckinsForDate(user.id, today),
        getWeeklyGoalProgress(user.id),
      ]);
      setGoals(goalsData);
      setCheckedGoalIds(new Set(checkinsData));
      setWeeklyProgress(progressData);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  }, [user, today]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const toggleCheckin = useCallback(async (goalId: string) => {
    if (!user) return;

    const isNowChecked = await toggleGoalCheckin(goalId, user.id, today);
    const goal = goals.find(g => g.id === goalId);

    setCheckedGoalIds(prev => {
      const next = new Set(prev);
      if (isNowChecked) {
        next.add(goalId);
      } else {
        next.delete(goalId);
      }

      // Check if all goals are now complete
      if (next.size === goals.length && goals.length > 0) {
        track('goals_daily_complete', { goal_count: goals.length });
      }

      return next;
    });

    track('goal_checkin_toggled', {
      goal_title: goal?.title,
      is_checked: isNowChecked,
      is_custom: goal?.is_custom,
    });
  }, [user, today, goals, track]);

  const addGoal = useCallback(async (title: string, options?: {
    description?: string;
    icon?: string;
    color?: string;
  }) => {
    if (!user) return null;
    const goal = await createGoal(user.id, {
      title,
      ...options,
      is_custom: true,
    });
    if (goal) {
      track('goal_created', { title });
      await loadGoals();
    }
    return goal;
  }, [user, track, loadGoals]);

  const removeGoal = useCallback(async (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    const success = await deleteGoal(goalId);
    if (success) {
      track('goal_deleted', { is_custom: goal?.is_custom });
      setGoals(prev => prev.filter(g => g.id !== goalId));
    }
    return success;
  }, [goals, track]);

  return {
    goals,
    checkedGoalIds,
    weeklyProgress,
    loading,
    refresh: loadGoals,
    toggleCheckin,
    addGoal,
    removeGoal,
    allCompleteToday: goals.length > 0 && checkedGoalIds.size === goals.length,
  };
}
