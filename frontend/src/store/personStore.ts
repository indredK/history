import { create } from 'zustand';
import type { CommonPerson } from '@/services/person/common';

export type PersonSortBy = 'birthYear' | 'deathYear' | 'name' | 'dynasty';

interface PersonFilters {
  dynasty: string;
  role: string;
  gender: string;
  searchQuery: string;
  sortBy: PersonSortBy;
}

interface PersonState {
  persons: CommonPerson[];
  selectedPerson: CommonPerson | null;
  editingPerson: CommonPerson | null;
  loading: boolean;
  error: Error | null;
  filters: PersonFilters;

  setPersons: (persons: CommonPerson[]) => void;
  addPerson: (person: CommonPerson) => void;
  updatePerson: (person: CommonPerson) => void;
  removePerson: (id: string) => void;
  setSelectedPerson: (person: CommonPerson | null) => void;
  setEditingPerson: (person: CommonPerson | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  setDynastyFilter: (dynasty: string) => void;
  setRoleFilter: (role: string) => void;
  setGenderFilter: (gender: string) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: PersonSortBy) => void;
  getFilteredPersons: () => CommonPerson[];
  getDynastyOptions: () => string[];
  getRoleOptions: () => string[];
}

function includesText(value: string | undefined, query: string): boolean {
  return Boolean(value?.toLowerCase().includes(query));
}

export const usePersonStore = create<PersonState>((set, get) => ({
  persons: [],
  selectedPerson: null,
  editingPerson: null,
  loading: false,
  error: null,
  filters: {
    dynasty: '全部',
    role: '全部',
    gender: '全部',
    searchQuery: '',
    sortBy: 'birthYear',
  },

  setPersons: (persons) => set({ persons }),
  addPerson: (person) =>
    set((state) => ({ persons: [person, ...state.persons] })),
  updatePerson: (person) =>
    set((state) => ({
      persons: state.persons.map((item) => (item.id === person.id ? person : item)),
      selectedPerson:
        state.selectedPerson?.id === person.id ? person : state.selectedPerson,
    })),
  removePerson: (id) =>
    set((state) => ({
      persons: state.persons.filter((person) => person.id !== id),
      selectedPerson:
        state.selectedPerson?.id === id ? null : state.selectedPerson,
      editingPerson:
        state.editingPerson?.id === id ? null : state.editingPerson,
    })),
  setSelectedPerson: (person) => set({ selectedPerson: person }),
  setEditingPerson: (person) => set({ editingPerson: person }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setDynastyFilter: (dynasty) =>
    set((state) => ({ filters: { ...state.filters, dynasty } })),
  setRoleFilter: (role) =>
    set((state) => ({ filters: { ...state.filters, role } })),
  setGenderFilter: (gender) =>
    set((state) => ({ filters: { ...state.filters, gender } })),
  setSearchQuery: (searchQuery) =>
    set((state) => ({ filters: { ...state.filters, searchQuery } })),
  setSortBy: (sortBy) =>
    set((state) => ({ filters: { ...state.filters, sortBy } })),

  getFilteredPersons: () => {
    const { persons, filters } = get();
    const query = filters.searchQuery.trim().toLowerCase();

    return persons
      .filter((person) => {
        const dynastyMatch =
          filters.dynasty === '全部' || person.dynasty === filters.dynasty;
        const roleMatch =
          filters.role === '全部' || person.roles?.includes(filters.role);
        const genderMatch =
          filters.gender === '全部' || person.gender === filters.gender;
        const searchMatch =
          !query ||
          includesText(person.name, query) ||
          includesText(person.nameEn, query) ||
          includesText(person.name_en, query) ||
          includesText(person.courtesy, query) ||
          includesText(person.birthplace, query) ||
          includesText(person.biography, query) ||
          Boolean(person.aliases?.some((alias) => includesText(alias, query))) ||
          Boolean(person.achievements?.some((achievement) => includesText(achievement, query))) ||
          Boolean(person.works?.some((work) => includesText(work, query)));

        return dynastyMatch && roleMatch && genderMatch && searchMatch;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'name':
            return a.name.localeCompare(b.name, 'zh-CN');
          case 'deathYear':
            return (a.deathYear ?? Number.MAX_SAFE_INTEGER) -
              (b.deathYear ?? Number.MAX_SAFE_INTEGER);
          case 'dynasty':
            return `${a.dynasty ?? ''}${a.birthYear ?? ''}`.localeCompare(
              `${b.dynasty ?? ''}${b.birthYear ?? ''}`,
              'zh-CN',
            );
          case 'birthYear':
          default:
            return (a.birthYear ?? Number.MAX_SAFE_INTEGER) -
              (b.birthYear ?? Number.MAX_SAFE_INTEGER);
        }
      });
  },

  getDynastyOptions: () => {
    const dynasties = Array.from(
      new Set(get().persons.map((person) => person.dynasty).filter(Boolean)),
    ) as string[];
    return ['全部', ...dynasties];
  },

  getRoleOptions: () => {
    const roles = Array.from(
      new Set(get().persons.flatMap((person) => person.roles ?? [])),
    );
    return ['全部', ...roles];
  },
}));
