/**
 * 元朝人物内容容器组件
 */

import { useYuanFigureStore } from '@/store/yuanFigureStore';
import { getYuanFigures } from '@/services/person/yuan';
import type { YuanFigure, YuanFigureRole } from '@/services/person/yuan/types';
import type { YuanFigureSortBy } from '@/services/person/yuan';
import { ROLE_LABELS } from '@/services/person/yuan/types';

import { PeopleCollectionContent, useFigureCollection } from '../common';
import { YuanFigureGrid } from './YuanFigureGrid';
import { YuanFigureDetailModal } from './YuanFigureDetailModal';

export function YuanContent() {
  const store = useYuanFigureStore();

  const {
    error, reload, requestLoading,
    searchQuery, onSearchChange, searchPlaceholder,
    filters, sortBy, sortOptions, onSortChange,
    resultCount, resultLabel,
    filteredItems, selectedItem, handleItemClick, handleCloseModal,
  } = useFigureCollection<YuanFigure>({
    cacheKey: 'yuanFigures',
    store,
    loadData: getYuanFigures,
    errorMessage: '获取元朝人物数据失败:',
    searchPlaceholder: '搜索元朝人物姓名、字号...',
    resultLabel: '位元朝人物',
    filterConfigs: [
      {
        field: 'role',
        label: '角色',
        getOptions: () => store.getRoleOptions().map(role => ({
          value: role,
          label: role === '全部' ? '全部' : ROLE_LABELS[role as YuanFigureRole] || role,
        })),
        setFilter: (value) => store.setRoleFilter(value as YuanFigureRole | '全部'),
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
      onSortChange={(value) => onSortChange(value as YuanFigureSortBy)}
      resultCount={resultCount}
      resultLabel={resultLabel}
      grid={
        <YuanFigureGrid figures={filteredItems} onFigureClick={handleItemClick} loading={requestLoading} />
      }
      modal={
        <YuanFigureDetailModal figure={selectedItem} open={selectedItem !== null} onClose={handleCloseModal} />
      }
    />
  );
}

export default YuanContent;
