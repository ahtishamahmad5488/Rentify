import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Property } from '../utils/api/propertyApi';

export interface ViewedEntry {
  _id: string;
  city: string;
  area: string;
  propertyType: string;
  price: number;
  facilities: string[];
}

interface ActivityState {
  viewedIds: string[];
  recentViews: ViewedEntry[];
  recordView: (property: Property) => void;
  clearActivity: () => void;
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set, get) => ({
      viewedIds: [],
      recentViews: [],

      recordView: (property: Property) => {
        const { viewedIds, recentViews } = get();
        const id = property._id;
        const entry: ViewedEntry = {
          _id: id,
          city: property.city || '',
          area: property.area || '',
          propertyType: property.propertyType || '',
          price: property.price || 0,
          facilities: Array.isArray(property.facilities) ? property.facilities : [],
        };
        set({
          viewedIds: [id, ...viewedIds.filter(v => v !== id)].slice(0, 20),
          recentViews: [entry, ...recentViews.filter(v => v._id !== id)].slice(0, 10),
        });
      },

      clearActivity: () => set({ viewedIds: [], recentViews: [] }),
    }),
    {
      name: 'activity-storage',
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
