/**
 * 唐朝人物内容容器组件
 */

import { useMemo } from 'react';

import { useTangFigureStore } from '@/store/tangFigureStore';
import { getTangFigures } from '@/services/person/tang';
import type { TangFigure, TangFigureRole } from '@/services/person/tang/types';
import type { TangFigureSortBy } from '@/services/person/tang';
import { ROLE_LABELS } from '@/services/person/tang/types';

import { PeopleCollectionContent, useFigureCollection } from '../common';
import { TangFigureGrid } from './TangFigureGrid';
import { TangFigureDetailModal } from './TangFigureDetailModal';

export function TangContent() {
  const store = useTangFigureStore();

  const adaptedStore = useMemo(() => ({
    items: store.figures,
    selectedItem: store.selectedFigure,
    loading: store.loading,
    error: store.error,
    filters: store.filters,
    setItems: store.setFigures,
    setSelectedItem: store.setSelectedFigure,
    setLoading: store.setLoading,
    setError: store.setError,
    setSearchQuery: store.setSearchQuery,
    setSortBy: store.setSortBy,
    getFilteredItems: store.getFilteredFigures,
    getRoleOptions: store.getRoleOptions,
    getPeriodOptions: store.getPeriodOptions,
    setRoleFilter: store.setRoleFilter,
    setPeriodFilter: store.setPeriodFilter,
  }), [store]);

  const {
    error, reload, requestLoading,
    searchQuery, onSearchChange, searchPlaceholder,
    filters, sortBy, sortOptions, onSortChange,
    resultCount, resultLabel,
    filteredItems, selectedItem, handleItemClick, handleCloseModal,
  } = useFigureCollection<TangFigure, TangFigureSortBy>({
    cacheKey: 'tangFigures',
    store: adaptedStore,
    loadData: getTangFigures,
    errorMessage: '获取唐朝人物数据失败:',
    searchPlaceholder: '搜索唐朝人物姓名、字号...',
    resultLabel: '位唐朝人物',
    filterConfigs: [
      {
        field: 'role',
        label: '角色',
        getOptions: () => store.getRoleOptions().map(role => ({
          value: role,
          label: role === '全部' ? '全部' : ROLE_LABELS[role as TangFigureRole] || role,
        })),
        setFilter: (value) => store.setRoleFilter(value as TangFigureRole | '全部'),
      },
      {
        field: 'period',
        label: '时期',
        getOptions: () => store.getPeriodOptions().map(period => ({ value: period, label: period })),
        setFilter: store.setPeriodFilter,
      },
    ],
    sortOptions: [
      { value: 'birthYear', label: '按出生年' },
      { value: 'name', label: '按姓名' },
      { value: 'role', label: '按角色' },
    ],
  });

  return (
    <PeopleCollectionContent
      error={error}
      onRetry={reload}
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      searchPlaceholder={searchPlaceholder}
      filters={filters}
      sortBy={sortBy}
      sortOptions={sortOptions}
      onSortChange={(value) => onSortChange(value as TangFigureSortBy)}
      resultCount={resultCount}
      resultLabel={resultLabel}
      grid={
        <TangFigureGrid figures={filteredItems} onFigureClick={handleItemClick} loading={requestLoading} />
      }
      modal={
        <TangFigureDetailModal figure={selectedItem} open={selectedItem !== null} onClose={handleCloseModal} />
      }
    />
  );
}

export default TangContent;
