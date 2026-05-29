/**
 * 三国人物内容容器组件
 */

import { useSanguoFigureStore } from '@/store/sanguoFigureStore';
import { getSanguoFigures } from '@/services/person/sanguo';
import type { SanguoFigure, SanguoFigureRole, SanguoKingdom } from '@/services/person/sanguo/types';
import type { SanguoFigureSortBy } from '@/services/person/sanguo';
import { ROLE_LABELS, KINGDOM_LABELS } from '@/services/person/sanguo/types';

import { PeopleCollectionContent, useFigureCollection } from '../common';
import { SanguoFigureGrid } from './SanguoFigureGrid';
import { SanguoFigureDetailModal } from './SanguoFigureDetailModal';

export function SanguoContent() {
  const store = useSanguoFigureStore();

  const {
    error, reload, requestLoading,
    searchQuery, onSearchChange, searchPlaceholder,
    filters, sortBy, sortOptions, onSortChange,
    resultCount, resultLabel,
    filteredItems, selectedItem, handleItemClick, handleCloseModal,
  } = useFigureCollection<SanguoFigure>({
    cacheKey: 'sanguoFigures',
    store,
    loadData: getSanguoFigures,
    errorMessage: '获取三国人物数据失败:',
    searchPlaceholder: '搜索三国人物姓名、字号...',
    resultLabel: '位三国人物',
    filterConfigs: [
      {
        field: 'role',
        label: '角色',
        getOptions: () => store.getRoleOptions().map(role => ({
          value: role,
          label: role === '全部' ? '全部' : ROLE_LABELS[role as SanguoFigureRole] || role,
        })),
        setFilter: (value) => store.setRoleFilter(value as SanguoFigureRole | '全部'),
      },
      {
        field: 'kingdom',
        label: '势力',
        getOptions: () => store.getKingdomOptions().map(kingdom => ({
          value: kingdom,
          label: kingdom === '全部' ? '全部' : KINGDOM_LABELS[kingdom as SanguoKingdom] || kingdom,
        })),
        setFilter: (value) => store.setKingdomFilter(value as SanguoKingdom | '全部'),
      },
    ],
    sortOptions: [
      { value: 'kingdom', label: '按势力' },
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
      onSortChange={(value) => onSortChange(value as SanguoFigureSortBy)}
      resultCount={resultCount}
      resultLabel={resultLabel}
      grid={
        <SanguoFigureGrid figures={filteredItems} onFigureClick={handleItemClick} loading={requestLoading} />
      }
      modal={
        <SanguoFigureDetailModal figure={selectedItem} open={selectedItem !== null} onClose={handleCloseModal} />
      }
    />
  );
}

export default SanguoContent;
