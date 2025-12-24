/**
 * 神话状态管理 Store
 * Mythology State Management Store
 * 
 * Requirements: 4.3
 */

import { create } from 'zustand';
import type { Mythology, MythologyCategory, MythologyStore } from '@/services/mythology';
import { filterByCategory } from '@/services/mythology';

export const useMythologyStore = create<MythologyStore>((set, get) => ({
  // 状态
  mythologies: [],
  selectedMythology: null,
  activeCategory: null,
  loading: false,
  error: null,

  // 操作
  setMythologies: (mythologies: Mythology[]) => {
    set({ mythologies });
  },

  setSelectedMythology: (mythology: Mythology | null) => {
    set({ selectedMythology: mythology });
  },

  setActiveCategory: (category: MythologyCategory | null) => {
    set({ activeCategory: category });
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  // 计算属性：获取筛选后的神话列表
  getFilteredMythologies: () => {
    const { mythologies, activeCategory } = get();
    if (!activeCategory) return mythologies;
    return filterByCategory(mythologies, activeCategory);
  },
}));

/**
 * 便捷 Hook：获取神话状态和操作
 */
export const useMythology = () => useMythologyStore();

/**
 * 便捷 Hook：仅获取筛选后的神话列表
 */
export const useFilteredMythologies = () => {
  const store = useMythologyStore();
  return store.getFilteredMythologies();
};

/**
 * 便捷 Hook：获取当前选中的神话
 */
export const useSelectedMythology = () => {
  return useMythologyStore(state => state.selectedMythology);
};

/**
 * 便捷 Hook：获取当前活动分类
 */
export const useActiveCategory = () => {
  return useMythologyStore(state => state.activeCategory);
};
