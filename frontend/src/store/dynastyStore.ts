import { create } from 'zustand';
import type { Dynasty } from '@/services/culture/types';

interface DynastyState {
  dynasties: Dynasty[];
  setDynasties: (_dynasties: Dynasty[]) => void;
  selectedDynasty: Dynasty | null;
  setSelectedDynasty: (_dynasty: Dynasty | null) => void;
}

export const useDynastyStore = create<DynastyState>((set) => ({
  dynasties: [],
  setDynasties: (_dynasties: Dynasty[]) => set({ dynasties: _dynasties }),
  selectedDynasty: null,
  setSelectedDynasty: (_dynasty: Dynasty | null) => set({ selectedDynasty: _dynasty }),
}));