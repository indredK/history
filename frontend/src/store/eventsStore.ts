import { create } from 'zustand';
import type { Event } from '../types/models';

interface EventsState {
  events: Event[];
  setEvents: (events: Event[]) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const useEventsStore = create<EventsState>((set) => ({
  events: [],
  setEvents: (events) => set({ events }),
  favorites: [],
  toggleFavorite: (id) =>
    set((state) => ({
      favorites: state.favorites.includes(id)
        ? state.favorites.filter((x) => x !== id)
        : [...state.favorites, id],
    })),
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
}));
