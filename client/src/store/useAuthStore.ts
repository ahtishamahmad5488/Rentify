import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role?: string;
  firebaseUid?: string; // populated after Firebase login
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  setUser: (user: AuthUser, token: string) => void;
  updateUser: (partial: Partial<AuthUser>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      setUser: (user, token) => set({ user, token }),

      updateUser: (partial) => {
        const current = get().user;
        if (current) set({ user: { ...current, ...partial } });
      },

      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage',
      storage: {
        getItem: async (name: string) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name: string, value: any) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name: string) => {
          await AsyncStorage.removeItem(name);
        },
      },
    },
  ),
);
