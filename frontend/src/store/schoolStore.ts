import { create } from 'zustand';
import type { PhilosophicalSchool } from '@/services/school/types';

interface SchoolsState {
  schools: PhilosophicalSchool[];
  selectedSchool: PhilosophicalSchool | null;
  loading: boolean;
  error: Error | null;

  // Actions
  setSchools: (schools: PhilosophicalSchool[]) => void;
  addSchool: (school: PhilosophicalSchool) => void;
  updateSchool: (school: PhilosophicalSchool) => void;
  removeSchool: (id: string) => void;
  setSelectedSchool: (school: PhilosophicalSchool | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
}

export const useSchoolStore = create<SchoolsState>((set) => ({
  schools: [],
  selectedSchool: null,
  loading: false,
  error: null,

  setSchools: (schools: PhilosophicalSchool[]) => set({ schools }),

  addSchool: (school: PhilosophicalSchool) =>
    set((state) => ({ schools: [school, ...state.schools] })),

  updateSchool: (school: PhilosophicalSchool) =>
    set((state) => ({
      schools: state.schools.map((item) =>
        item.id === school.id ? school : item,
      ),
      selectedSchool:
        state.selectedSchool?.id === school.id ? school : state.selectedSchool,
    })),

  removeSchool: (id: string) =>
    set((state) => ({
      schools: state.schools.filter((school) => school.id !== id),
      selectedSchool:
        state.selectedSchool?.id === id ? null : state.selectedSchool,
    })),

  setSelectedSchool: (school: PhilosophicalSchool | null) => set({ selectedSchool: school }),

  setLoading: (loading: boolean) => set({ loading }),

  setError: (error: Error | null) => set({ error }),
}));
