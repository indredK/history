import { create } from 'zustand';
import type { Dynasty } from '../types/models';

interface DynastyState {
  selectedDynasty: Dynasty | null;
  setSelectedDynasty: (dynasty: Dynasty | null) => void;
}

export const useDynastyStore = create<DynastyState>((set) => ({
  selectedDynasty: null,
  setSelectedDynasty: (dynasty) => set({ selectedDynasty: dynasty }),
}));
