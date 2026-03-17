import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { useAnalytics } from './useAnalytics';
import { startPanicSession, completePanicSession, logPanicUrge } from '../services/panicService';
import { BREATHING_PATTERN } from '../constants/config';

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

export interface PanicHookState {
  isBreathing: boolean;
  isPanicActive: boolean;
  currentPhase: BreathingPhase;
  cycleCount: number;
  totalCycles: number;
  secondsRemaining: number;
  sessionId: string | null;
  calmBefore: number | null;
  calmAfter: number | null;
  totalDuration: number;
  loading: boolean;
  error: string | null;
}

export function usePanic() {
  const { user } = useAuth();
  const { track } = useAnalytics();

  const [state, setState] = useState<PanicHookState>({
    isBreathing: false,
    isPanicActive: false,
    currentPhase: 'inhale',
    cycleCount: 0,
    totalCycles: 5,
    secondsRemaining: BREATHING_PATTERN.inhale,
    sessionId: null,
    calmBefore: null,
    calmAfter: null,
    totalDuration: 0,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!state.isBreathing) {
      return;
    }

    const phaseMap = {
      inhale: { duration: BREATHING_PATTERN.inhale, nextPhase: 'hold' as BreathingPhase },
      hold: { duration: BREATHING_PATTERN.hold, nextPhase: 'exhale' as BreathingPhase },
      exhale: { duration: BREATHING_PATTERN.exhale, nextPhase: 'rest' as BreathingPhase },
      rest: { duration: 1, nextPhase: 'inhale' as BreathingPhase },
    };

    const phaseConfig = phaseMap[state.currentPhase];
    const timer = setTimeout(() => {
      if (state.currentPhase === 'rest') {
        const nextCycle = state.cycleCount + 1;
        if (nextCycle >= state.totalCycles) {
          completeBreathing();
          return;
        }
        setState(prev => ({
          ...prev,
          cycleCount: nextCycle,
          currentPhase: phaseConfig.nextPhase,
          secondsRemaining:
            phaseConfig.nextPhase === 'inhale'
              ? BREATHING_PATTERN.inhale
              : phaseMap[phaseConfig.nextPhase].duration,
        }));
      } else {
        setState(prev => ({
          ...prev,
          currentPhase: phaseConfig.nextPhase,
          secondsRemaining:
            phaseConfig.nextPhase === 'inhale'
              ? BREATHING_PATTERN.inhale
              : phaseMap[phaseConfig.nextPhase].duration,
        }));
      }
    }, phaseConfig.duration * 1000);

    const countdownInterval = setInterval(() => {
      setState(prev => ({
        ...prev,
        secondsRemaining: Math.max(0, prev.secondsRemaining - 1),
        totalDuration: prev.totalDuration + 1,
      }));
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(countdownInterval);
    };
  }, [state.isBreathing, state.currentPhase, state.cycleCount]);

  async function startBreathing(calmBefore: number = 5): Promise<void> {
    if (!user?.id) {
      setState(prev => ({
        ...prev,
        error: 'User not found',
      }));
      return;
    }

    try {
      const sessionId = await startPanicSession(user.id);

      if (!sessionId) {
        throw new Error('Failed to start session');
      }

      setState(prev => ({
        ...prev,
        isBreathing: true,
        isPanicActive: true,
        currentPhase: 'inhale',
        secondsRemaining: BREATHING_PATTERN.inhale,
        cycleCount: 0,
        totalDuration: 0,
        sessionId,
        calmBefore,
        error: null,
      }));

      track('panic_button_pressed');
      track('breathing_started', { calm_before: calmBefore });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start breathing';
      setState(prev => ({
        ...prev,
        error: message,
      }));
    }
  }

  function stopBreathing(): void {
    setState(prev => ({
      ...prev,
      isBreathing: false,
      isPanicActive: false,
    }));
  }

  async function completeBreathing(): Promise<void> {
    setState(prev => ({
      ...prev,
      isBreathing: false,
    }));

    if (!user?.id || !state.sessionId) {
      return;
    }

    try {
      await completePanicSession(
        state.sessionId,
        state.totalDuration,
        state.calmBefore || 5,
        state.calmAfter || 5
      );

      track('breathing_completed', {
        duration_seconds: state.totalDuration,
        cycles: state.cycleCount + 1,
        calm_before: state.calmBefore,
        calm_after: state.calmAfter,
      });
    } catch (error) {
      console.error('Error completing breathing:', error);
    }
  }

  async function logUrge(
    intensity: number,
    triggerType?: string,
    notes?: string
  ): Promise<boolean> {
    if (!user?.id) {
      return false;
    }

    try {
      await logPanicUrge(user.id, intensity, triggerType || 'panic', 'After breathing session', notes || '');
      return true;
    } catch (error) {
      console.error('Error logging panic urge:', error);
      return false;
    }
  }

  function setCalmAfter(calm: number): void {
    setState(prev => ({
      ...prev,
      calmAfter: calm,
    }));
  }

  return {
    ...state,
    startBreathing,
    stopBreathing,
    completeBreathing,
    logUrge,
    setCalmAfter,
  };
}
