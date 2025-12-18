import { create } from 'zustand';
import type { Event } from '@/services/timeline/types';

interface EventsState {
  events: Event[];
  setEvents: (_events: Event[]) => void;
  favorites: string[];
  toggleFavorite: (_id: string) => void;
  searchQuery: string;
  setSearchQuery: (_q: string) => void;
}

export const useEventsStore = create<EventsState>((set) => ({
  events: [],
  setEvents: (_events) => set({ events: _events }),
  favorites: [],
  toggleFavorite: (_id) =>
    set((state) => ({
      favorites: state.favorites.includes(_id)
        ? state.favorites.filter((x) => x !== _id)
        : [...state.favorites, _id],
    })),
  searchQuery: '',
  setSearchQuery: (_q) => set({ searchQuery: _q }),
}));
