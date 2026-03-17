import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { useAnalytics } from './useAnalytics';
import {
  getCurrentStreak,
  getBestStreak,
  checkInToday,
  resetStreakWithRelapse,
  getStreakHistory,
  getDateInTimezone,
  dateToIsoDate,
} from '../services/streakEngine';
import { getRelapseHistory } from '../services/relapseService';
import { checkAndUnlockMilestones } from '../services/milestoneEngine';

export interface StreakState {
  currentStreak: number;
  bestStreak: number;
  lastCheckIn: string | null;
  isCheckedInToday: boolean;
  relapseHistory: any[];
  loading: boolean;
  error: string | null;
}

export function useStreak() {
  const { user } = useAuth();
  const { track } = useAnalytics();

  const [state, setState] = useState<StreakState>({
    currentStreak: 0,
    bestStreak: 0,
    lastCheckIn: null,
    isCheckedInToday: false,
    relapseHistory: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!user?.id) {
      setState({
        currentStreak: 0,
        bestStreak: 0,
        lastCheckIn: null,
        isCheckedInToday: false,
        relapseHistory: [],
        loading: false,
        error: null,
      });
      return;
    }

    const init = async () => {
      try {
        const streakData = await getCurrentStreak(user.id);
        const bestStreakData = await getBestStreak(user.id);
        const relapseData = await getRelapseHistory(user.id, 10);

        const lastCheckinDate = streakData?.last_checkin ? streakData.last_checkin.split('T')[0] : null;
        const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';
        const today = dateToIsoDate(getDateInTimezone(deviceTimezone));
        const isCheckedIn = lastCheckinDate === today;

        setState({
          currentStreak: streakData?.current_days || 0,
          bestStreak: bestStreakData || 0,
          lastCheckIn: lastCheckinDate,
          isCheckedInToday: isCheckedIn,
          relapseHistory: relapseData,
          loading: false,
          error: null,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load streak';
        setState((prev) => ({
          ...prev,
          loading: false,
          error: message,
        }));
      }
    };

    init();
  }, [user?.id]);

  async function refresh(): Promise<void> {
    if (!user?.id) return;

    try {
      setState((prev) => ({ ...prev, loading: true }));

      const streakData = await getCurrentStreak(user.id);
      const bestStreakData = await getBestStreak(user.id);
      const relapseData = await getRelapseHistory(user.id, 10);

      const lastCheckinDate = streakData?.last_checkin ? streakData.last_checkin.split('T')[0] : null;
      const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';
      const today = dateToIsoDate(getDateInTimezone(deviceTimezone));
      const isCheckedIn = lastCheckinDate === today;

      setState({
        currentStreak: streakData?.current_days || 0,
        bestStreak: bestStreakData || 0,
        lastCheckIn: lastCheckinDate,
        isCheckedInToday: isCheckedIn,
        relapseHistory: relapseData,
        loading: false,
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to refresh streak';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: message,
      }));
    }
  }

  async function checkIn(): Promise<boolean> {
    if (!user?.id || state.isCheckedInToday) {
      return false;
    }

    try {
      const result = await checkInToday(user.id);

      setState((prev) => ({
        ...prev,
        currentStreak: result.current_days,
        bestStreak: result.best_streak,
        isCheckedInToday: true,
        lastCheckIn: new Date().toISOString().split('T')[0],
      }));

      track('streak_updated', {
        current_days: result.current_days,
        best_streak: result.best_streak,
      });

      try {
        await checkAndUnlockMilestones(user.id);
      } catch (error) {
        console.error('Error checking milestones:', error);
      }

      return true;
    } catch (error) {
      console.error('Error checking in:', error);
      return false;
    }
  }

  async function logRelapse(
    triggerCategory: string = 'unknown',
    emotionalState: string = 'frustrated',
    notes: string = '',
    severity: 'mild' | 'moderate' | 'severe' = 'moderate'
  ): Promise<boolean> {
    if (!user?.id) return false;

    try {
      const result = await resetStreakWithRelapse(
        user.id,
        triggerCategory,
        emotionalState,
        notes,
        severity
      );

      setState((prev) => ({
        ...prev,
        currentStreak: 0,
      }));

      track('relapse_logged', {
        trigger_category: triggerCategory,
        emotional_state: emotionalState,
        severity,
        previous_streak: result.previous_streak,
      });

      await refresh();

      return true;
    } catch (error) {
      console.error('Error logging relapse:', error);
      return false;
    }
  }

  return {
    ...state,
    refresh,
    checkIn,
    logRelapse,
  };
}
