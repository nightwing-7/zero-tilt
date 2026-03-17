import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppStore {
  name: string;
  traderName: string;
  email: string;
  streak: number;
  bestStreak: number;
  relapses: number;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  currentRank: string;
  getRank: (days: number) => string;
  setName: (name: string) => void;
  setTraderName: (traderName: string) => void;
  setEmail: (email: string) => void;
  setStreak: (streak: number) => void;
  resetStreak: () => void;
  incrementStreak: () => void;
  setRelapses: (relapses: number) => void;
  incrementRelapses: () => void;
  login: (email: string, name: string) => void;
  logout: () => void;
  completeOnboarding: () => void;
  updateCurrentRank: () => void;
}

const getRankFromDays = (days: number): string => {
  if (days >= 365) return 'Legend';
  if (days >= 180) return 'Immortal';
  if (days >= 120) return 'Titan';
  if (days >= 90) return 'Elite';
  if (days >= 75) return 'Master';
  if (days >= 60) return 'Diamond';
  if (days >= 45) return 'Platinum';
  if (days >= 30) return 'Gold';
  if (days >= 21) return 'Silver';
  if (days >= 14) return 'Iron';
  if (days >= 7) return 'Bronze';
  if (days >= 3) return 'Ember';
  return 'Spark';
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      name: '',
      traderName: '',
      email: '',
      streak: 0,
      bestStreak: 0,
      relapses: 0,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      currentRank: 'Spark',

      getRank: (days: number) => getRankFromDays(days),

      setName: (name: string) => set({ name }),

      setTraderName: (traderName: string) => set({ traderName }),

      setEmail: (email: string) => set({ email }),

      setStreak: (streak: number) => {
        const bestStreak = Math.max(get().bestStreak, streak);
        set({
          streak,
          bestStreak,
          currentRank: getRankFromDays(streak),
        });
      },

      resetStreak: () => {
        const currentBestStreak = get().bestStreak;
        const currentRelapses = get().relapses;
        set({
          streak: 0,
          relapses: currentRelapses + 1,
          currentRank: 'Spark',
        });
      },

      incrementStreak: () => {
        const newStreak = get().streak + 1;
        const newBestStreak = Math.max(get().bestStreak, newStreak);
        set({
          streak: newStreak,
          bestStreak: newBestStreak,
          currentRank: getRankFromDays(newStreak),
        });
      },

      setRelapses: (relapses: number) => set({ relapses }),

      incrementRelapses: () => {
        set({
          relapses: get().relapses + 1,
          streak: 0,
          currentRank: 'Spark',
        });
      },

      login: (email: string, name: string) => {
        set({
          email,
          name,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          name: '',
          traderName: '',
          email: '',
          streak: 0,
          bestStreak: 0,
          relapses: 0,
          isAuthenticated: false,
          hasCompletedOnboarding: false,
          currentRank: 'Spark',
        });
      },

      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true });
      },

      updateCurrentRank: () => {
        const newRank = getRankFromDays(get().streak);
        set({ currentRank: newRank });
      },
    }),
    {
      name: 'tilt-app-store',
      partialize: (state) => ({
        name: state.name,
        traderName: state.traderName,
        email: state.email,
        streak: state.streak,
        bestStreak: state.bestStreak,
        relapses: state.relapses,
        isAuthenticated: state.isAuthenticated,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        currentRank: state.currentRank,
      }),
    }
  )
);
