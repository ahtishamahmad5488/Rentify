import { create } from 'zustand';
import { Property } from '../utils/api/propertyApi';

type FavoriteState = {
  favorites: Property[];
  addFavorite: (property: Property) => void;
  removeFavorite: (propertyId: string) => void;
  toggleFavorite: (property: Property) => void;
  isFavorite: (propertyId: string) => boolean;
};

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  favorites: [],

  addFavorite: property =>
    set(state => {
      const exists = state.favorites.some(item => item._id === property._id);

      if (exists) return state;

      return {
        favorites: [property, ...state.favorites],
      };
    }),

  removeFavorite: propertyId =>
    set(state => ({
      favorites: state.favorites.filter(item => item._id !== propertyId),
    })),

  toggleFavorite: property => {
    const exists = get().favorites.some(item => item._id === property._id);

    if (exists) {
      get().removeFavorite(property._id);
    } else {
      get().addFavorite(property);
    }
  },

  isFavorite: propertyId =>
    get().favorites.some(item => item._id === propertyId),
}));
