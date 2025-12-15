import { create } from 'zustand';
import type { Dynasty } from '../services/culture/types';

interface DynastyState {
  dynasties: Dynasty[];
  setDynasties: (dynasties: Dynasty[]) => void;
  selectedDynasty: Dynasty | null;
  setSelectedDynasty: (dynasty: Dynasty | null) => void;
}

export const useDynastyStore = create<DynastyState>((set) => ({
  dynasties: [],
  setDynasties: (dynasties) => set({ dynasties }),
  selectedDynasty: null,
  setSelectedDynasty: (dynasty) => set({ selectedDynasty: dynasty }),
}));