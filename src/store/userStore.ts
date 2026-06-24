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

import { auth } from '../lib/firebase';
import { updateUserData } from '../services/firebaseService';

const syncUserToFirestore = (updatedUser: Partial<User>) => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    updateUserData(currentUser.uid, updatedUser).catch(err => console.error("Firestore sync error:", err));
  }
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

          const updated = {
            xp: newXP,
            level: Math.max(actualLevel, 1),
          };
          syncUserToFirestore(updated);

          return {
            user: {
              ...state.user,
              ...updated,
            },
          };
        });
      },

      addTokens: (amount: number) => {
        set((state) => {
          const updated = {
            pacTokens: state.user.pacTokens + amount,
          };
          syncUserToFirestore(updated);
          return {
            user: {
              ...state.user,
              ...updated,
            },
          };
        });
      },

      spendTokens: (amount: number) => {
        const state = get();
        if (state.user.pacTokens < amount) return false;

        set((state) => {
          const updated = {
            pacTokens: state.user.pacTokens - amount,
          };
          syncUserToFirestore(updated);
          return {
            user: {
              ...state.user,
              ...updated,
            },
          };
        });
        return true;
      },

      updateBehaviorScore: (score: number) => {
        set((state) => {
          const updated = {
            behaviorScore: Math.min(100, Math.max(0, score)),
          };
          syncUserToFirestore(updated);
          return {
            user: {
              ...state.user,
              ...updated,
            },
          };
        });
      },

      incrementStreak: () => {
        set((state) => {
          const newStreak = state.user.streakDays + 1;
          const updated = {
            streakDays: newStreak,
            longestStreak: Math.max(newStreak, state.user.longestStreak),
          };
          syncUserToFirestore(updated);
          return {
            user: {
              ...state.user,
              ...updated,
            },
          };
        });
      },

      resetStreak: () => {
        set((state) => {
          const updated = {
            streakDays: 0,
          };
          syncUserToFirestore(updated);
          return {
            user: {
              ...state.user,
              ...updated,
            },
          };
        });
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
        set((state) => {
          const updated = {
            isPremium,
          };
          syncUserToFirestore(updated);
          return {
            user: {
              ...state.user,
              ...updated,
            },
          };
        });
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
