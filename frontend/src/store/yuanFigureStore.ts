/**
 * 元朝人物状态管理Store
 */

import { create } from 'zustand';
import type { YuanFigure, YuanFigureRole } from '@/services/person/yuan/types';
import { yuanFigureServiceHelper, type YuanFigureSortBy } from '@/services/person/yuan';
import { YUAN_PERIODS } from '@/services/person/yuan/types';

interface YuanFigureFilters {
  role: YuanFigureRole | '全部';
  period: string;
  searchQuery: string;
  sortBy: YuanFigureSortBy;
}

interface YuanFigureState {
  figures: YuanFigure[];
  selectedFigure: YuanFigure | null;
  loading: boolean;
  error: Error | null;
  filters: YuanFigureFilters;
  setFigures: (figures: YuanFigure[]) => void;
  setSelectedFigure: (figure: YuanFigure | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  setRoleFilter: (role: YuanFigureRole | '全部') => void;
  setPeriodFilter: (period: string) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: YuanFigureSortBy) => void;
  getFilteredFigures: () => YuanFigure[];
  getRoleOptions: () => string[];
  getPeriodOptions: () => string[];
}

export const useYuanFigureStore = create<YuanFigureState>((set, get) => ({
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

  setFigures: (figures) => set({ figures }),
  setSelectedFigure: (figure) => set({ selectedFigure: figure }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setRoleFilter: (role) => set((state) => ({ filters: { ...state.filters, role } })),
  setPeriodFilter: (period) => set((state) => ({ filters: { ...state.filters, period } })),
  setSearchQuery: (query) => set((state) => ({ filters: { ...state.filters, searchQuery: query } })),
  setSortBy: (sortBy: YuanFigureSortBy) => set((state) => ({ filters: { ...state.filters, sortBy } })),

  getFilteredFigures: () => {
    const { figures, filters } = get();
    return yuanFigureServiceHelper.filterAndSort(figures, {
      role: filters.role,
      period: filters.period,
      query: filters.searchQuery,
      sortBy: filters.sortBy,
    });
  },

  getRoleOptions: () => ['全部', 'emperor', 'chancellor', 'general', 'official', 'scholar', 'other'],
  getPeriodOptions: () => ['全部', ...YUAN_PERIODS.map(p => p.name)],
}));
