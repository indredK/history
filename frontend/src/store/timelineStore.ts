import { create } from 'zustand';

interface TimelineState {
  startYear: number;
  endYear: number;
  setYears: (start: number, end: number) => void;
}

export const useTimelineStore = create<TimelineState>((set) => ({
  startYear: -500,
  endYear: 2000,
  setYears: (start, end) => set({ startYear: start, endYear: end }),
}));
