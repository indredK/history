/**
 * 公共人物集合 Hook
 * 封装所有 Content 组件的重复逻辑：store 解构、数据加载、过滤、选项映射、事件处理
 */

import { useMemo, useCallback } from 'react';

import { useCollectionResource } from '@/hooks';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  name: string;
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}

export interface SortOption {
  value: string;
  label: string;
}

export interface FigureCollectionOptions<T> {
  cacheKey: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  store: any;
  loadData: () => Promise<{ data: T[] }>;
  errorMessage: string;
  searchPlaceholder: string;
  resultLabel: string;
  filterConfigs: Array<{
    field: string;
    label: string;
    getOptions: () => Array<{ value: string; label: string }>;
    setFilter: (value: string) => void;
  }>;
  sortOptions: SortOption[];
}

export function useFigureCollection<T>(options: FigureCollectionOptions<T>) {
  const {
    cacheKey,
    store,
    loadData,
    errorMessage,
    searchPlaceholder,
    resultLabel,
    filterConfigs,
    sortOptions,
  } = options;

  const { reload, requestLoading } = useCollectionResource({
    cacheKey,
    items: store.items,
    loading: store.loading,
    load: async () => {
      const result = await loadData();
      return result.data;
    },
    setItems: store.setItems,
    setLoading: store.setLoading,
    setError: store.setError,
    errorMessage,
  });

  const filteredItems = useMemo(
    () => store.getFilteredItems(),
    [store.getFilteredItems, store.items, store.filters]
  );

  const filters = useMemo(
    () =>
      filterConfigs.map((config) => ({
        name: config.field,
        label: config.label,
        value: store.filters[config.field] || '全部',
        options: config.getOptions(),
        onChange: config.setFilter,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store.filters, store.items]
  );

  const handleItemClick = useCallback(
    (item: T) => store.setSelectedItem(item),
    [store.setSelectedItem]
  );

  const handleCloseModal = useCallback(
    () => store.setSelectedItem(null),
    [store.setSelectedItem]
  );

  return {
    error: store.error,
    reload,
    requestLoading,
    searchQuery: store.filters['searchQuery'] || '',
    onSearchChange: store.setSearchQuery,
    searchPlaceholder,
    filters,
    sortBy: store.filters['sortBy'] || '',
    sortOptions,
    onSortChange: store.setSortBy,
    resultCount: filteredItems.length,
    resultLabel,
    filteredItems,
    selectedItem: store.selectedItem,
    handleItemClick,
    handleCloseModal,
  };
}
