import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { useAnalytics } from './useAnalytics';
import { DailyPledge, signPledge as signPledgeService, getTodaysPledge } from '../services/pledges';
import { checkInToday } from '../services/streakEngine';
import { checkAndUnlockMilestones } from '../services/milestoneEngine';

export interface DailyPledgeState {
  todaysPledge: DailyPledge | null;
  hasPledged: boolean;
  loading: boolean;
  error: string | null;
}

export function useDailyPledge() {
  const { user } = useAuth();
  const { track } = useAnalytics();

  const [state, setState] = useState<DailyPledgeState>({
    todaysPledge: null,
    hasPledged: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!user?.id) {
      setState({
        todaysPledge: null,
        hasPledged: false,
        loading: false,
        error: null,
      });
      return;
    }

    const init = async () => {
      try {
        const pledge = await getTodaysPledge(user.id);
        setState({
          todaysPledge: pledge,
          hasPledged: !!pledge,
          loading: false,
          error: null,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load pledge';
        setState(prev => ({
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
      setState(prev => ({ ...prev, loading: true }));

      const pledge = await getTodaysPledge(user.id);
      setState({
        todaysPledge: pledge,
        hasPledged: !!pledge,
        loading: false,
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to refresh pledge';
      setState(prev => ({
        ...prev,
        loading: false,
        error: message,
      }));
    }
  }

  async function signPledge(pledgeText: string, signatureData: string): Promise<boolean> {
    if (!user?.id) {
      setState(prev => ({
        ...prev,
        error: 'User not found',
      }));
      return false;
    }

    try {
      setState(prev => ({ ...prev, loading: true }));

      const pledge = await signPledgeService(user.id, pledgeText, signatureData);

      if (pledge) {
        setState({
          todaysPledge: pledge,
          hasPledged: true,
          loading: false,
          error: null,
        });

        track('daily_pledge_completed', {
          pledge_length: pledgeText.length,
        });

        try {
          await checkInToday(user.id);
        } catch (error) {
          console.error('Error checking in:', error);
        }

        try {
          await checkAndUnlockMilestones(user.id);
        } catch (error) {
          console.error('Error checking milestones:', error);
        }

        return true;
      }

      throw new Error('Failed to sign pledge');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sign pledge';
      setState(prev => ({
        ...prev,
        loading: false,
        error: message,
      }));
      return false;
    }
  }

  return {
    ...state,
    refresh,
    signPledge,
  };
}
