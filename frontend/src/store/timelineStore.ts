import { create } from 'zustand';

interface TimelineState {
  startYear: number;
  endYear: number;
  setYears: (_start: number, _end: number) => void;
}

export const useTimelineStore = create<TimelineState>((set) => ({
  startYear: -500,
  endYear: 2000,
  setYears: (_start, _end) => set({ startYear: _start, endYear: _end }),
}));
