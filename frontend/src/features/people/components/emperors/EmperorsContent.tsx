/**
 * 帝王内容容器组件
 */

import { useEmperorStore } from '@/store';
import { getEmperors } from '@/services/person/emperors';
import type { Emperor } from '@/services/person/emperors/types';
import type { EmperorSortBy } from '@/services/person/emperors';

import { PeopleCollectionContent, useFigureCollection } from '../common';
import { EmperorGrid } from './EmperorGrid';
import { EmperorDetailModal } from './EmperorDetailModal';

export function EmperorsContent() {
  const store = useEmperorStore();

  const {
    error, reload, requestLoading,
    searchQuery, onSearchChange, searchPlaceholder,
    filters, sortBy, sortOptions, onSortChange,
    resultCount, resultLabel,
    filteredItems, selectedItem, handleItemClick, handleCloseModal,
  } = useFigureCollection<Emperor>({
    cacheKey: 'emperors',
    store,
    loadData: getEmperors,
    errorMessage: '获取帝王数据失败:',
    searchPlaceholder: '搜索帝王姓名、年号...',
    resultLabel: '位帝王',
    filterConfigs: [
      {
        field: 'dynasty',
        label: '朝代',
        getOptions: () => store.getDynastyOptions().map(d => ({ value: d, label: d })),
        setFilter: store.setDynastyFilter,
      },
    ],
    sortOptions: [
      { value: 'dynasty', label: '按朝代' },
      { value: 'reignStart', label: '按在位时间' },
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
      onSortChange={(value) => onSortChange(value as EmperorSortBy)}
      resultCount={resultCount}
      resultLabel={resultLabel}
      grid={
        <EmperorGrid emperors={filteredItems} onEmperorClick={handleItemClick} loading={requestLoading} />
      }
      modal={
        <EmperorDetailModal emperor={selectedItem} open={selectedItem !== null} onClose={handleCloseModal} />
      }
    />
  );
}

export default EmperorsContent;
