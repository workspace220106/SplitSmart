'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Mission, Badge } from '../types';

interface UserState {
  user: User;
  missions: Mission[];
  badges: Badge[];

  // Actions
  addXP: (amount: number) => void;
  addTokens: (amount: number) => void;
  spendTokens: (amount: number) => boolean;
  updateBehaviorScore: (score: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  completeMission: (missionId: string) => void;
  addMission: (mission: Mission) => void;
  earnBadge: (badge: Badge) => void;
  setPremium: (isPremium: boolean) => void;
  getLevel: () => number;
  getXPForNextLevel: () => number;
  setUser: (user: User) => void;
  setMissions: (missions: Mission[]) => void;
  setBadges: (badges: Badge[]) => void;
}

const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 4000,
  5000, 6500, 8000, 10000, 12500, 15000, 18000, 22000, 27000, 33000,
  40000, 50000, 60000, 75000, 90000, 110000, 135000, 165000, 200000, 250000
];

const LEVEL_NAMES = [
  'Broke Beginner', 'Penny Picker', 'Coin Collector', 'Budget Buddy', 'Smart Saver',
  'Wealth Warrior', 'Finance Fighter', 'Money Master', 'Investment Idol', 'Capital King',
  'Wealth Wizard', 'Fortune Finder', 'Asset Ace', 'Profit Pro', 'Revenue Ruler',
  'Treasure Titan', 'Gold Guardian', 'Diamond Director', 'Emerald Emperor', 'Platinum President',
  'Wealth Builder', 'Money Mogul', 'Finance Phenom', 'Capital Champion', 'Investment Icon',
  'Wealth Wonder', 'Money Messiah', 'Fortune Founder', 'Prosperity Pro', 'Wealth Legend',
];

const DEFAULT_USER: User = {
  id: 'user_1',
  name: 'Student',
  email: 'student@splitsmart.app',
  xp: 0,
  level: 1,
  pacTokens: 100,
  behaviorScore: 50,
  streakDays: 0,
  longestStreak: 0,
  joinedAt: new Date(),
  isPremium: false,
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: DEFAULT_USER,
      missions: [],
      badges: [],

      addXP: (amount: number) => {
        set((state) => {
          const newXP = state.user.xp + amount;
          const newLevel = LEVEL_THRESHOLDS.findIndex(threshold => newXP < threshold);
          const actualLevel = newLevel === -1 ? LEVEL_THRESHOLDS.length : newLevel;

          return {
            user: {
              ...state.user,
              xp: newXP,
              level: Math.max(actualLevel, 1),
            },
          };
        });
      },

      addTokens: (amount: number) => {
        set((state) => ({
          user: {
            ...state.user,
            pacTokens: state.user.pacTokens + amount,
          },
        }));
      },

      spendTokens: (amount: number) => {
        const state = get();
        if (state.user.pacTokens < amount) return false;

        set((state) => ({
          user: {
            ...state.user,
            pacTokens: state.user.pacTokens - amount,
          },
        }));
        return true;
      },

      updateBehaviorScore: (score: number) => {
        set((state) => ({
          user: {
            ...state.user,
            behaviorScore: Math.min(100, Math.max(0, score)),
          },
        }));
      },

      incrementStreak: () => {
        set((state) => {
          const newStreak = state.user.streakDays + 1;
          return {
            user: {
              ...state.user,
              streakDays: newStreak,
              longestStreak: Math.max(newStreak, state.user.longestStreak),
            },
          };
        });
      },

      resetStreak: () => {
        set((state) => ({
          user: {
            ...state.user,
            streakDays: 0,
          },
        }));
      },

      completeMission: (missionId: string) => {
        const state = get();
        const mission = state.missions.find(m => m.id === missionId);
        if (!mission || mission.completed) return;

        set((state) => ({
          missions: state.missions.map(m =>
            m.id === missionId ? { ...m, completed: true, progress: m.target } : m
          ),
        }));

        get().addXP(mission.reward.xp);
        get().addTokens(mission.reward.tokens);
      },

      addMission: (mission: Mission) => {
        set((state) => ({
          missions: [...state.missions, mission],
        }));
      },

      earnBadge: (badge: Badge) => {
        set((state) => ({
          badges: [...state.badges, { ...badge, earnedAt: new Date() }],
        }));
      },

      setPremium: (isPremium: boolean) => {
        set((state) => ({
          user: {
            ...state.user,
            isPremium,
          },
        }));
      },

      getLevel: () => {
        return get().user.level;
      },

      getXPForNextLevel: () => {
        const level = get().user.level;
        return LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
      },

      setUser: (user) => {
        set({ user });
      },

      setMissions: (missions) => {
        set({ missions });
      },

      setBadges: (badges) => {
        set({ badges });
      },
    }),
    {
      name: 'splitsmart-user-storage',
    }
  )
);

export { LEVEL_NAMES, LEVEL_THRESHOLDS };
