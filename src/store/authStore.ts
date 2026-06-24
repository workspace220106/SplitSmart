import { create } from 'zustand';
import { User as FirebaseUser, signOut } from 'firebase/auth';
import { User } from '../types';
import {
  onAuthChange,
  updateUserData,
  subscribeToUserData,
} from '../services/firebaseService';
import { auth } from '../lib/firebase';
import { useUserStore } from './userStore';

interface AuthState {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  setFirebaseUser: (user: FirebaseUser | null) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initialize: () => () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  firebaseUser: null,
  user: null,
  isLoading: true,
  isInitialized: false,
  error: null,

  setFirebaseUser: (firebaseUser) => set({ firebaseUser }),
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  initialize: () => {
    set({ isLoading: true, isInitialized: false });

    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        set({ firebaseUser });

        // Subscribe to user data changes
        const unsubscribeUser = subscribeToUserData(firebaseUser.uid, (userData) => {
          if (userData) {
            set({ user: userData, isLoading: false, isInitialized: true });
            // Sync user data to Zustand userStore
            useUserStore.getState().setUser(userData);
          } else {
            // User document doesn't exist yet
            set({ user: null, isLoading: false, isInitialized: true });
          }
        });

        return () => {
          unsubscribeUser();
        };
      } else {
        set({
          firebaseUser: null,
          user: null,
          isLoading: false,
          isInitialized: true,
        });
      }
    });

    return unsubscribe;
  },

  updateProfile: async (data) => {
    const { firebaseUser } = get();
    if (!firebaseUser) {
      set({ error: 'No user logged in' });
      return;
    }

    try {
      set({ isLoading: true });
      await updateUserData(firebaseUser.uid, data);
      set({ isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    await signOut(auth);
    set({
      firebaseUser: null,
      user: null,
      isLoading: false,
    });
    
    // Clear localStorage to ensure clean state for next user login session
    localStorage.removeItem('splitsmart-user-storage');
    localStorage.removeItem('splitsmart-stocks-v2');
    localStorage.removeItem('splitsmart-split-storage');
    
    // Force a reload to sign-in page to clean state
    window.location.href = '/auth';
  },
}));
