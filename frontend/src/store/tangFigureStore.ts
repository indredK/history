/**
 * 唐朝人物状态管理Store
 */

import { create } from 'zustand';
import type { TangFigure, TangFigureRole } from '@/services/person/tang/types';
import { tangFigureService, type TangFigureSortBy } from '@/services/person/tang';
import { TANG_PERIODS } from '@/services/person/tang/types';

interface TangFigureFilters {
  role: TangFigureRole | '全部';
  period: string;
  searchQuery: string;
  sortBy: TangFigureSortBy;
}

interface TangFigureState {
  figures: TangFigure[];
  selectedFigure: TangFigure | null;
  loading: boolean;
  error: Error | null;
  filters: TangFigureFilters;
  setFigures: (figures: TangFigure[]) => void;
  setSelectedFigure: (figure: TangFigure | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  setRoleFilter: (role: TangFigureRole | '全部') => void;
  setPeriodFilter: (period: string) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: TangFigureSortBy) => void;
  getFilteredFigures: () => TangFigure[];
  getRoleOptions: () => string[];
  getPeriodOptions: () => string[];
}

export const useTangFigureStore = create<TangFigureState>((set, get) => ({
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
  setSortBy: (sortBy: TangFigureSortBy) => set((state) => ({ filters: { ...state.filters, sortBy } })),

  getFilteredFigures: () => {
    const { figures, filters } = get();
    return tangFigureService.filterAndSort(figures, {
      role: filters.role,
      period: filters.period,
      query: filters.searchQuery,
      sortBy: filters.sortBy,
    });
  },

  getRoleOptions: () => ['全部', 'emperor', 'chancellor', 'general', 'official', 'poet', 'other'],
  getPeriodOptions: () => ['全部', ...TANG_PERIODS.map(p => p.name)],
}));
