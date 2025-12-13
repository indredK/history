import { create } from 'zustand';

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
  events: any[];
  setEvents: (events: any[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
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
}));
