/**
 * 明朝人物状态管理Store
 * Ming Dynasty Figure State Store
 * 
 * 管理明朝人物数据、筛选、排序、搜索状态
 * 
 * Requirements: 3.7, 3.8, 3.9, 6.3
 */

import { create } from 'zustand';
import type { MingFigure, MingFigureRole } from '@/services/person/ming/types';
import { mingService, type MingFigureSortBy } from '@/services/person/ming';
import { MING_PERIODS } from '@/services/person/ming/types';

interface MingFigureFilters {
  role: MingFigureRole | '全部';
  period: string;
  searchQuery: string;
  sortBy: MingFigureSortBy;
}

interface MingFigureState {
  figures: MingFigure[];
  selectedFigure: MingFigure | null;
  loading: boolean;
  error: Error | null;
  filters: MingFigureFilters;

  // Actions
  setFigures: (figures: MingFigure[]) => void;
  setSelectedFigure: (figure: MingFigure | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  setRoleFilter: (role: MingFigureRole | '全部') => void;
  setPeriodFilter: (period: string) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: MingFigureSortBy) => void;
  getFilteredFigures: () => MingFigure[];
  getRoleOptions: () => string[];
  getPeriodOptions: () => string[];
}

export const useMingFigureStore = create<MingFigureState>((set, get) => ({
  figures: [],
  selectedFigure: null,
  loading: false,
  error: null,
  filters: {
    role: '全部',
    period: '全部',
    searchQuery: '',
    sortBy: 'birthYear',
  },

  setFigures: (figures: MingFigure[]) => set({ figures }),

  setSelectedFigure: (figure: MingFigure | null) => set({ selectedFigure: figure }),

  setLoading: (loading: boolean) => set({ loading }),

  setError: (error: Error | null) => set({ error }),

  setRoleFilter: (role: MingFigureRole | '全部') => set((state) => ({
    filters: { ...state.filters, role },
  })),

  setPeriodFilter: (period: string) => set((state) => ({
    filters: { ...state.filters, period },
  })),

  setSearchQuery: (query: string) => set((state) => ({
    filters: { ...state.filters, searchQuery: query },
  })),

  setSortBy: (sortBy: MingFigureSortBy) => set((state) => ({
    filters: { ...state.filters, sortBy },
  })),

  getFilteredFigures: () => {
    const { figures, filters } = get();
    return mingService.filterAndSort(figures, {
      role: filters.role,
      period: filters.period,
      query: filters.searchQuery,
      sortBy: filters.sortBy,
    });
  },

  getRoleOptions: () => {
    return ['全部', 'emperor', 'cabinet', 'general', 'official', 'eunuch', 'other'];
  },

  getPeriodOptions: () => {
    return ['全部', ...MING_PERIODS.map(p => p.name)];
  },
}));
