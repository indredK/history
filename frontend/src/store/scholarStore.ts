import { create } from 'zustand';
import type { Scholar } from '@/services/scholar/types';

interface ScholarFilters {
  dynasty: string;
  schoolOfThought: string;
}

interface ScholarState {
  scholars: Scholar[];
  selectedScholar: Scholar | null;
  loading: boolean;
  error: Error | null;
  filters: ScholarFilters;

  // Actions
  setScholars: (scholars: Scholar[]) => void;
  setSelectedScholar: (scholar: Scholar | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  setDynastyFilter: (dynasty: string) => void;
  setSchoolFilter: (school: string) => void;
  getFilteredScholars: () => Scholar[];
}

export const useScholarStore = create<ScholarState>((set, get) => ({
  scholars: [],
  selectedScholar: null,
  loading: false,
  error: null,
  filters: {
    dynasty: '全部',
    schoolOfThought: '全部',
  },

  setScholars: (scholars: Scholar[]) => set({ scholars }),

  setSelectedScholar: (scholar: Scholar | null) => set({ selectedScholar: scholar }),

  setLoading: (loading: boolean) => set({ loading }),

  setError: (error: Error | null) => set({ error }),

  setDynastyFilter: (dynasty: string) => set((state) => ({
    filters: { ...state.filters, dynasty },
  })),

  setSchoolFilter: (school: string) => set((state) => ({
    filters: { ...state.filters, schoolOfThought: school },
  })),

  getFilteredScholars: () => {
    const { scholars, filters } = get();
    
    return scholars.filter((scholar) => {
      // Check dynasty filter - must match if not "全部"
      const dynastyMatch = filters.dynasty === '全部' || scholar.dynasty === filters.dynasty;
      
      // Check school filter - must match if not "全部"
      const schoolMatch = filters.schoolOfThought === '全部' || scholar.schoolOfThought === filters.schoolOfThought;
      
      // Both filters must match (AND logic per Requirements 5.4)
      return dynastyMatch && schoolMatch;
    });
  },
}));
