/**
 * 宋朝人物内容容器组件
 */

import { useSongFigureStore } from '@/store/songFigureStore';
import { getSongFigures } from '@/services/person/song';
import type { SongFigure, SongFigureRole } from '@/services/person/song/types';
import type { SongFigureSortBy } from '@/services/person/song';
import { ROLE_LABELS } from '@/services/person/song/types';

import { PeopleCollectionContent, useFigureCollection } from '../common';
import { SongFigureGrid } from './SongFigureGrid';
import { SongFigureDetailModal } from './SongFigureDetailModal';

export function SongContent() {
  const store = useSongFigureStore();

  const {
    error, reload, requestLoading,
    searchQuery, onSearchChange, searchPlaceholder,
    filters, sortBy, sortOptions, onSortChange,
    resultCount, resultLabel,
    filteredItems, selectedItem, handleItemClick, handleCloseModal,
  } = useFigureCollection<SongFigure>({
    cacheKey: 'songFigures',
    store,
    loadData: getSongFigures,
    errorMessage: '获取宋朝人物数据失败:',
    searchPlaceholder: '搜索宋朝人物姓名、字号...',
    resultLabel: '位宋朝人物',
    filterConfigs: [
      {
        field: 'role',
        label: '角色',
        getOptions: () => store.getRoleOptions().map(role => ({
          value: role,
          label: role === '全部' ? '全部' : ROLE_LABELS[role as SongFigureRole] || role,
        })),
        setFilter: (value) => store.setRoleFilter(value as SongFigureRole | '全部'),
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
      onSortChange={(value) => onSortChange(value as SongFigureSortBy)}
      resultCount={resultCount}
      resultLabel={resultLabel}
      grid={
        <SongFigureGrid figures={filteredItems} onFigureClick={handleItemClick} loading={requestLoading} />
      }
      modal={
        <SongFigureDetailModal figure={selectedItem} open={selectedItem !== null} onClose={handleCloseModal} />
      }
    />
  );
}

export default SongContent;
