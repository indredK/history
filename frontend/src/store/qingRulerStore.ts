/**
 * 清朝统治者状态管理Store
 * Qing Dynasty Ruler State Store
 * 
 * 管理清朝统治者数据、筛选、排序、搜索状态
 * 
 * Requirements: 4.7, 4.8, 6.3
 */

import { create } from 'zustand';
import type { QingRuler } from '@/services/person/qing/types';
import { qingRulerServiceHelper, type QingRulerSortBy } from '@/services/person/qing';
import { QING_PERIODS } from '@/services/person/qing/types';

interface QingRulerFilters {
  period: string;
  searchQuery: string;
  sortBy: QingRulerSortBy;
}

interface QingRulerState {
  rulers: QingRuler[];
  selectedRuler: QingRuler | null;
  loading: boolean;
  error: Error | null;
  filters: QingRulerFilters;

  // Actions
  setRulers: (rulers: QingRuler[]) => void;
  setSelectedRuler: (ruler: QingRuler | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  setPeriodFilter: (period: string) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: QingRulerSortBy) => void;
  getFilteredRulers: () => QingRuler[];
  getPeriodOptions: () => string[];
}

export const useQingRulerStore = create<QingRulerState>((set, get) => ({
  rulers: [],
  selectedRuler: null,
  loading: false,
  error: null,
  filters: {
    period: '全部',
    searchQuery: '',
    sortBy: 'reignStart',
  },

  setRulers: (rulers: QingRuler[]) => set({ rulers }),

  setSelectedRuler: (ruler: QingRuler | null) => set({ selectedRuler: ruler }),

  setLoading: (loading: boolean) => set({ loading }),

  setError: (error: Error | null) => set({ error }),

  setPeriodFilter: (period: string) => set((state) => ({
    filters: { ...state.filters, period },
  })),

  setSearchQuery: (query: string) => set((state) => ({
    filters: { ...state.filters, searchQuery: query },
  })),

  setSortBy: (sortBy: QingRulerSortBy) => set((state) => ({
    filters: { ...state.filters, sortBy },
  })),

  getFilteredRulers: () => {
    const { rulers, filters } = get();
    return qingRulerServiceHelper.filterAndSort(rulers, {
      period: filters.period,
      query: filters.searchQuery,
      sortBy: filters.sortBy,
    });
  },

  getPeriodOptions: () => {
    return ['全部', ...QING_PERIODS.map(p => p.name)];
  },
}));
