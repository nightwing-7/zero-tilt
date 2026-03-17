import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { Milestone, MilestoneUnlock, getMilestones, getMilestoneUnlocks } from '../services/milestones';

export interface MilestoneState {
  milestones: Milestone[];
  unlocks: MilestoneUnlock[];
  loading: boolean;
  error: string | null;
}

export function useMilestones() {
  const { user } = useAuth();
  const [state, setState] = useState<MilestoneState>({
    milestones: [],
    unlocks: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!user?.id) {
      setState({
        milestones: [],
        unlocks: [],
        loading: false,
        error: null,
      });
      return;
    }

    const init = async () => {
      try {
        const [milestones, unlocks] = await Promise.all([
          getMilestones(),
          getMilestoneUnlocks(user.id),
        ]);

        setState({
          milestones,
          unlocks,
          loading: false,
          error: null,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load milestones';
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

      const [milestones, unlocks] = await Promise.all([
        getMilestones(),
        getMilestoneUnlocks(user.id),
      ]);

      setState({
        milestones,
        unlocks,
        loading: false,
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to refresh milestones';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: message,
      }));
    }
  }

  function getMilestoneUnlock(milestoneId: string): MilestoneUnlock | undefined {
    return state.unlocks.find((u) => u.milestone_id === milestoneId);
  }

  function isMilestoneUnlocked(milestoneId: string): boolean {
    const unlock = getMilestoneUnlock(milestoneId);
    return unlock?.unlocked_at !== null && unlock?.unlocked_at !== undefined;
  }

  function getProgress(milestoneId: string): number {
    const unlock = getMilestoneUnlock(milestoneId);
    return unlock?.progress || 0;
  }

  return {
    ...state,
    refresh,
    getMilestoneUnlock,
    isMilestoneUnlocked,
    getProgress,
  };
}
