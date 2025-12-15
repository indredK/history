import { create } from 'zustand';
import type { Person } from '../services/person/types';

interface PersonsState {
  persons: Person[];
  setPersons: (persons: Person[]) => void;
  selectedPersonId: string | null;
  setSelectedPersonId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const usePersonsStore = create<PersonsState>((set) => ({
  persons: [],
  setPersons: (persons) => set({ persons }),
  selectedPersonId: null,
  setSelectedPersonId: (id) => set({ selectedPersonId: id }),
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
}));
