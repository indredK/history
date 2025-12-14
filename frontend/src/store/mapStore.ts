import { create } from 'zustand';

interface MapState {
  latitude: number;
  longitude: number;
  zoom: number;
  setLocation: (lat: number, lon: number, zoom: number) => void;
}

export const useMapStore = create<MapState>((set) => ({
  latitude: 34.34,
  longitude: 108.95,
  zoom: 4,
  setLocation: (lat, lon, zoom) => set({ latitude: lat, longitude: lon, zoom }),
}));
