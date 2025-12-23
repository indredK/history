/**
 * 帝王状态管理Store
 * Emperor State Store
 * 
 * 管理帝王数据、筛选、排序、搜索状态
 * 
 * Requirements: 2.7, 2.8, 2.9, 6.3
 */

import { create } from 'zustand';
import type { Emperor } from '@/services/emperor/types';
import { emperorService, type EmperorSortBy } from '@/services/emperor';

interface EmperorFilters {
  dynasty: string;
  searchQuery: string;
  sortBy: EmperorSortBy;
}

interface EmperorState {
  emperors: Emperor[];
  selectedEmperor: Emperor | null;
  loading: boolean;
  error: Error | null;
  filters: EmperorFilters;

  // Actions
  setEmperors: (emperors: Emperor[]) => void;
  setSelectedEmperor: (emperor: Emperor | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  setDynastyFilter: (dynasty: string) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: EmperorSortBy) => void;
  getFilteredEmperors: () => Emperor[];
  getDynastyOptions: () => string[];
}

export const useEmperorStore = create<EmperorState>((set, get) => ({
  emperors: [],
  selectedEmperor: null,
  loading: false,
  error: null,
  filters: {
    dynasty: '全部',
    searchQuery: '',
    sortBy: 'dynasty',
  },

  setEmperors: (emperors: Emperor[]) => set({ emperors }),

  setSelectedEmperor: (emperor: Emperor | null) => set({ selectedEmperor: emperor }),

  setLoading: (loading: boolean) => set({ loading }),

  setError: (error: Error | null) => set({ error }),

  setDynastyFilter: (dynasty: string) => set((state) => ({
    filters: { ...state.filters, dynasty },
  })),

  setSearchQuery: (query: string) => set((state) => ({
    filters: { ...state.filters, searchQuery: query },
  })),

  setSortBy: (sortBy: EmperorSortBy) => set((state) => ({
    filters: { ...state.filters, sortBy },
  })),

  getFilteredEmperors: () => {
    const { emperors, filters } = get();
    return emperorService.filterAndSort(emperors, {
      dynasty: filters.dynasty,
      query: filters.searchQuery,
      sortBy: filters.sortBy,
    });
  },

  getDynastyOptions: () => {
    const { emperors } = get();
    const dynasties = [...new Set(emperors.map(e => e.dynasty))];
    return ['全部', ...dynasties];
  },
}));
