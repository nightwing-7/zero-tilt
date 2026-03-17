import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { UrgeLog, UrgeStats, logUrge, getUrgeHistory, getUrgeStats } from '../services/urges';

export interface UsesUrgeState {
  urges: UrgeLog[];
  stats: UrgeStats | null;
  loading: boolean;
  error: string | null;
}

export function useUrges() {
  const { user } = useAuth();
  const [state, setState] = useState<UsesUrgeState>({
    urges: [],
    stats: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!user?.id) {
      setState({
        urges: [],
        stats: null,
        loading: false,
        error: null,
      });
      return;
    }

    const init = async () => {
      try {
        const [urges, stats] = await Promise.all([
          getUrgeHistory(user.id, 50),
          getUrgeStats(user.id),
        ]);

        setState({
          urges,
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

      const [urges, stats] = await Promise.all([
        getUrgeHistory(user.id, 50),
        getUrgeStats(user.id),
      ]);

      setState({
        urges,
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
    outcome: 'Resisted' | 'Gave in' | 'Distracted';
    notes: string;
  }): Promise<UrgeLog | null> {
    if (!user?.id) return null;

    try {
      const newUrge = await logUrge(user.id, urge);

      if (newUrge) {
        setState((prev) => ({
          ...prev,
          urges: [newUrge, ...prev.urges],
        }));

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
