import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { getCurrentStreak, getBestStreak, resetStreak as resetStreakService, getStreakHistory } from '../services/streaks';

export interface StreakState {
  currentStreak: number;
  bestStreak: number;
  loading: boolean;
  error: string | null;
}

export function useStreak() {
  const { user } = useAuth();
  const [state, setState] = useState<StreakState>({
    currentStreak: 0,
    bestStreak: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!user?.id) {
      setState({
        currentStreak: 0,
        bestStreak: 0,
        loading: false,
        error: null,
      });
      return;
    }

    const init = async () => {
      try {
        const streakData = await getCurrentStreak(user.id);
        const bestStreakData = await getBestStreak(user.id);

        setState({
          currentStreak: streakData?.current_days || 0,
          bestStreak: bestStreakData || 0,
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

      setState({
        currentStreak: streakData?.current_days || 0,
        bestStreak: bestStreakData || 0,
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

  async function resetCurrentStreak(): Promise<boolean> {
    if (!user?.id) return false;

    try {
      const result = await resetStreakService(user.id);

      if (result) {
        setState((prev) => ({
          ...prev,
          currentStreak: 0,
        }));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error resetting streak:', error);
      return false;
    }
  }

  return {
    ...state,
    refresh,
    resetStreak: resetCurrentStreak,
  };
}
