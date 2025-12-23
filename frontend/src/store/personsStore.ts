import { create } from 'zustand';
import type { CommonPerson } from '@/services/people/common/types';

interface PersonsState {
  persons: CommonPerson[];
  setPersons: (_persons: CommonPerson[]) => void;
  selectedPersonId: string | null;
  setSelectedPersonId: (_id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (_q: string) => void;
}

export const usePersonsStore = create<PersonsState>((set) => ({
  persons: [],
  setPersons: (_persons) => set({ persons: _persons }),
  selectedPersonId: null,
  setSelectedPersonId: (_id) => set({ selectedPersonId: _id }),
  searchQuery: '',
  setSearchQuery: (_q) => set({ searchQuery: _q }),
}));
