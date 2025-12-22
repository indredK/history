import { create } from 'zustand';
import type { PhilosophicalSchool } from '@/services/schools/types';

interface SchoolsState {
  schools: PhilosophicalSchool[];
  selectedSchool: PhilosophicalSchool | null;
  loading: boolean;
  error: Error | null;

  // Actions
  setSchools: (schools: PhilosophicalSchool[]) => void;
  setSelectedSchool: (school: PhilosophicalSchool | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
}

export const useSchoolsStore = create<SchoolsState>((set) => ({
  schools: [],
  selectedSchool: null,
  loading: false,
  error: null,

  setSchools: (schools: PhilosophicalSchool[]) => set({ schools }),

  setSelectedSchool: (school: PhilosophicalSchool | null) => set({ selectedSchool: school }),

  setLoading: (loading: boolean) => set({ loading }),

  setError: (error: Error | null) => set({ error }),
}));
