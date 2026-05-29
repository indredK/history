/**
 * 清朝统治者内容容器组件
 */

import { useMemo } from 'react';

import { useQingRulerStore } from '@/store';
import { getQingRulers } from '@/services/person/qing';
import type { QingRuler } from '@/services/person/qing/types';
import type { QingRulerSortBy } from '@/services/person/qing';

import { PeopleCollectionContent, useFigureCollection } from '../common';
import { QingRulerGrid } from './QingRulerGrid';
import { QingRulerDetailModal } from './QingRulerDetailModal';

export function QingContent() {
  const store = useQingRulerStore();

  const adaptedStore = useMemo(() => ({
    items: store.rulers,
    selectedItem: store.selectedRuler,
    loading: store.loading,
    error: store.error,
    filters: store.filters,
    setItems: store.setRulers,
    setSelectedItem: store.setSelectedRuler,
    setLoading: store.setLoading,
    setError: store.setError,
    setSearchQuery: store.setSearchQuery,
    setSortBy: store.setSortBy,
    getFilteredItems: store.getFilteredRulers,
    getPeriodOptions: store.getPeriodOptions,
    setPeriodFilter: store.setPeriodFilter,
  }), [store]);

  const {
    error, reload, requestLoading,
    searchQuery, onSearchChange, searchPlaceholder,
    filters, sortBy, sortOptions, onSortChange,
    resultCount, resultLabel,
    filteredItems, selectedItem, handleItemClick, handleCloseModal,
  } = useFigureCollection<QingRuler>({
    cacheKey: 'qingRulers',
    store: adaptedStore,
    loadData: getQingRulers,
    errorMessage: '获取清朝统治者数据失败:',
    searchPlaceholder: '搜索清朝统治者姓名、庙号、年号...',
    resultLabel: '位清朝统治者',
    filterConfigs: [
      {
        field: 'period',
        label: '时期',
        getOptions: () => store.getPeriodOptions().map(period => ({ value: period, label: period })),
        setFilter: store.setPeriodFilter,
      },
    ],
    sortOptions: [
      { value: 'chronological', label: '按时间顺序' },
      { value: 'name', label: '按姓名' },
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
      onSortChange={(value) => onSortChange(value as QingRulerSortBy)}
      resultCount={resultCount}
      resultLabel={resultLabel}
      grid={
        <QingRulerGrid rulers={filteredItems} onRulerClick={handleItemClick} loading={requestLoading} />
      }
      modal={
        <QingRulerDetailModal ruler={selectedItem} open={selectedItem !== null} onClose={handleCloseModal} />
      }
    />
  );
}

export default QingContent;
