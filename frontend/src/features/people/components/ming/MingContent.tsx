/**
 * 明朝人物内容容器组件
 */

import { useMingFigureStore } from '@/store';
import { getMingFigures } from '@/services/person/ming';
import type { MingFigure, MingFigureRole } from '@/services/person/ming/types';
import type { MingFigureSortBy } from '@/services/person/ming';
import { ROLE_LABELS } from '@/services/person/ming/types';

import { PeopleCollectionContent, useFigureCollection } from '../common';
import { MingFigureGrid } from './MingFigureGrid';
import { MingFigureDetailModal } from './MingFigureDetailModal';

export function MingContent() {
  const store = useMingFigureStore();

  const {
    error, reload, requestLoading,
    searchQuery, onSearchChange, searchPlaceholder,
    filters, sortBy, sortOptions, onSortChange,
    resultCount, resultLabel,
    filteredItems, selectedItem, handleItemClick, handleCloseModal,
  } = useFigureCollection<MingFigure>({
    cacheKey: 'mingFigures',
    store,
    loadData: getMingFigures,
    errorMessage: '获取明朝人物数据失败:',
    searchPlaceholder: '搜索明朝人物姓名、字号...',
    resultLabel: '位明朝人物',
    filterConfigs: [
      {
        field: 'role',
        label: '角色',
        getOptions: () => store.getRoleOptions().map(role => ({
          value: role,
          label: role === '全部' ? '全部' : ROLE_LABELS[role as MingFigureRole] || role,
        })),
        setFilter: (value) => store.setRoleFilter(value as MingFigureRole | '全部'),
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
      onSortChange={(value) => onSortChange(value as MingFigureSortBy)}
      resultCount={resultCount}
      resultLabel={resultLabel}
      grid={
        <MingFigureGrid figures={filteredItems} onFigureClick={handleItemClick} loading={requestLoading} />
      }
      modal={
        <MingFigureDetailModal figure={selectedItem} open={selectedItem !== null} onClose={handleCloseModal} />
      }
    />
  );
}

export default MingContent;
