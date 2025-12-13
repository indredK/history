import { create } from 'zustand';
import type { Event } from './types/models';
import type { Dynasty } from './features/events/utils/dynastyUtils';

interface DynastyState {
  selectedDynasty: Dynasty | null;
  setSelectedDynasty: (dynasty: Dynasty | null) => void;
}

interface TimelineState {
  startYear: number;
  endYear: number;
  setYears: (start: number, end: number) => void;
}

interface MapState {
  latitude: number;
  longitude: number;
  zoom: number;
  setLocation: (lat: number, lon: number, zoom: number) => void;
}

interface EventsState {
  events: Event[];
  setEvents: (events: Event[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const useTimelineStore = create<TimelineState>((set) => ({
  startYear: -500,
  endYear: 2000,
  setYears: (start, end) => set({ startYear: start, endYear: end }),
}));

export const useMapStore = create<MapState>((set) => ({
  latitude: 34.34,
  longitude: 108.95,
  zoom: 4,
  setLocation: (lat, lon, zoom) => set({ latitude: lat, longitude: lon, zoom }),
}));

export const useEventsStore = create<EventsState>((set) => ({
  events: [],
  setEvents: (events) => set({ events }),
  loading: false,
  setLoading: (loading) => set({ loading }),
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

export const useDynastyStore = create<DynastyState>((set) => ({
  selectedDynasty: null,
  setSelectedDynasty: (dynasty) => set({ selectedDynasty: dynasty }),
}));

