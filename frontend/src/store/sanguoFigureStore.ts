/**
 * 三国人物状态管理Store
 */

import { create } from 'zustand';
import type { SanguoFigure, SanguoFigureRole, SanguoKingdom } from '@/services/person/sanguo/types';
import { sanguoFigureService, type SanguoFigureSortBy } from '@/services/person/sanguo';

interface SanguoFigureFilters {
  role: SanguoFigureRole | '全部';
  kingdom: SanguoKingdom | '全部';
  searchQuery: string;
  sortBy: SanguoFigureSortBy;
}

interface SanguoFigureState {
  figures: SanguoFigure[];
  selectedFigure: SanguoFigure | null;
  loading: boolean;
  error: Error | null;
  filters: SanguoFigureFilters;
  setFigures: (figures: SanguoFigure[]) => void;
  setSelectedFigure: (figure: SanguoFigure | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  setRoleFilter: (role: SanguoFigureRole | '全部') => void;
  setKingdomFilter: (kingdom: SanguoKingdom | '全部') => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: SanguoFigureSortBy) => void;
  getFilteredFigures: () => SanguoFigure[];
  getRoleOptions: () => string[];
  getKingdomOptions: () => string[];
}

export const useSanguoFigureStore = create<SanguoFigureState>((set, get) => ({
  figures: [],
  selectedFigure: null,
  loading: false,
  error: null,
  filters: {
    role: '全部',
    kingdom: '全部',
    searchQuery: '',
    sortBy: 'kingdom',
  },

  setFigures: (figures) => set({ figures }),
  setSelectedFigure: (figure) => set({ selectedFigure: figure }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setRoleFilter: (role) => set((state) => ({ filters: { ...state.filters, role } })),
  setKingdomFilter: (kingdom) => set((state) => ({ filters: { ...state.filters, kingdom } })),
  setSearchQuery: (query) => set((state) => ({ filters: { ...state.filters, searchQuery: query } })),
  setSortBy: (sortBy) => set((state) => ({ filters: { ...state.filters, sortBy } })),

  getFilteredFigures: () => {
    const { figures, filters } = get();
    return sanguoFigureService.filterAndSort(figures, {
      role: filters.role,
      kingdom: filters.kingdom,
      query: filters.searchQuery,
      sortBy: filters.sortBy,
    });
  },

  getRoleOptions: () => ['全部', 'ruler', 'strategist', 'general', 'official', 'other'],
  getKingdomOptions: () => ['全部', '魏', '蜀', '吴', '其他'],
}));
