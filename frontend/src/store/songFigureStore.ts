/**
 * 宋朝人物状态管理Store
 */

import { create } from 'zustand';
import type { SongFigure, SongFigureRole } from '@/services/person/song/types';
import { songFigureServiceHelper, type SongFigureSortBy } from '@/services/person/song';
import { SONG_PERIODS } from '@/services/person/song/types';

interface SongFigureFilters {
  role: SongFigureRole | '全部';
  period: string;
  searchQuery: string;
  sortBy: SongFigureSortBy;
}

interface SongFigureState {
  figures: SongFigure[];
  selectedFigure: SongFigure | null;
  loading: boolean;
  error: Error | null;
  filters: SongFigureFilters;
  setFigures: (figures: SongFigure[]) => void;
  setSelectedFigure: (figure: SongFigure | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  setRoleFilter: (role: SongFigureRole | '全部') => void;
  setPeriodFilter: (period: string) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: SongFigureSortBy) => void;
  getFilteredFigures: () => SongFigure[];
  getRoleOptions: () => string[];
  getPeriodOptions: () => string[];
}

export const useSongFigureStore = create<SongFigureState>((set, get) => ({
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
  setSortBy: (sortBy: SongFigureSortBy) => set((state) => ({ filters: { ...state.filters, sortBy } })),

  getFilteredFigures: () => {
    const { figures, filters } = get();
    return songFigureServiceHelper.filterAndSort(figures, {
      role: filters.role,
      period: filters.period,
      query: filters.searchQuery,
      sortBy: filters.sortBy,
    });
  },

  getRoleOptions: () => ['全部', 'emperor', 'chancellor', 'general', 'official', 'scholar', 'other'],
  getPeriodOptions: () => ['全部', ...SONG_PERIODS.map(p => p.name)],
}));
