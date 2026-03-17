import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { useAnalytics } from './useAnalytics';
import { UrgeLog, UrgeStats, logUrge, getUrgeHistory, getUrgeStats, getTodaysUrges } from '../services/urges';
import { checkAndUnlockMilestones } from '../services/milestoneEngine';

export interface UsesUrgeState {
  urges: UrgeLog[];
  todaysUrges: UrgeLog[];
  stats: UrgeStats | null;
  loading: boolean;
  error: string | null;
}

export function useUrges() {
  const { user } = useAuth();
  const { track } = useAnalytics();

  const [state, setState] = useState<UsesUrgeState>({
    urges: [],
    todaysUrges: [],
    stats: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!user?.id) {
      setState({
        urges: [],
        todaysUrges: [],
        stats: null,
        loading: false,
        error: null,
      });
      return;
    }

    const init = async () => {
      try {
        const [urges, todaysUrges, stats] = await Promise.all([
          getUrgeHistory(user.id, 50),
          getTodaysUrges(user.id),
          getUrgeStats(user.id),
        ]);

        setState({
          urges,
          todaysUrges,
          stats,
          loading: false,
          error: null,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load urges';
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

      const [urges, todaysUrges, stats] = await Promise.all([
        getUrgeHistory(user.id, 50),
        getTodaysUrges(user.id),
        getUrgeStats(user.id),
      ]);

      setState({
        urges,
        todaysUrges,
        stats,
        loading: false,
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to refresh urges';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: message,
      }));
    }
  }

  async function log(urge: {
    intensity: number;
    trigger_type: string;
    trigger_details: string;
    coping_strategies: string[];
    outcome: 'resisted' | 'gave_in' | 'distracted' | 'used_panic';
    notes: string;
  }): Promise<UrgeLog | null> {
    if (!user?.id) return null;

    try {
      const newUrge = await logUrge(user.id, urge);

      if (newUrge) {
        setState((prev) => ({
          ...prev,
          urges: [newUrge, ...prev.urges],
          todaysUrges: [newUrge, ...prev.todaysUrges],
        }));

        track('urge_logged', {
          intensity: urge.intensity,
          trigger_type: urge.trigger_type,
          outcome: urge.outcome,
        });

        try {
          await checkAndUnlockMilestones(user.id);
        } catch (error) {
          console.error('Error checking milestones:', error);
        }

        await refresh();
      }

      return newUrge;
    } catch (error) {
      console.error('Error logging urge:', error);
      return null;
    }
  }

  return {
    ...state,
    refresh,
    logUrge: log,
  };
}
