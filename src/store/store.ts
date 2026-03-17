import { create } from 'zustand';

interface UserState {
  name: string;
  traderName: string;
  email: string;
  streak: number;
  currentRank: number;
  setName: (name: string) => void;
  setTraderName: (traderName: string) => void;
  setEmail: (email: string) => void;
  setStreak: (streak: number) => void;
  setCurrentRank: (rank: number) => void;
}

export const useStore = create<UserState>((set) => ({
  name: 'John Trader',
  traderName: 'JohnT',
  email: 'john@example.com',
  streak: 42,
  currentRank: 12,
  setName: (name: string) => set({ name }),
  setTraderName: (traderName: string) => set({ traderName }),
  setEmail: (email: string) => set({ email }),
  setStreak: (streak: number) => set({ streak }),
  setCurrentRank: (rank: number) => set({ currentRank: rank }),
}));
