/**
 * 帝王内容容器组件
 */

import { useMemo } from 'react';

import { useEmperorStore } from '@/store';
import { getEmperors } from '@/services/person/emperors';
import type { Emperor } from '@/services/person/emperors/types';
import type { EmperorSortBy } from '@/services/person/emperors';
import { useCollectionResource } from '@/hooks';

import { PeopleCollectionContent } from '../common';
import { EmperorGrid } from './EmperorGrid';
import { EmperorDetailModal } from './EmperorDetailModal';

export function EmperorsContent() {
  const {
    emperors, selectedEmperor, loading, error, filters,
    setEmperors, setSelectedEmperor, setLoading, setError,
    setDynastyFilter, setSearchQuery, setSortBy,
    getFilteredEmperors, getDynastyOptions,
  } = useEmperorStore();

  const { reload: loadEmperors, requestLoading } = useCollectionResource({
    cacheKey: 'emperors',
    items: emperors,
    loading,
    load: async () => {
      const result = await getEmperors();
      return result.data;
    },
    setItems: setEmperors,
    setLoading,
    setError,
    errorMessage: '获取帝王数据失败:',
  });

  const filteredEmperors = useMemo(() => getFilteredEmperors(), [getFilteredEmperors, emperors, filters]);
  const dynastyOptions = useMemo(() => getDynastyOptions(), [getDynastyOptions, emperors]);

  const handleEmperorClick = (emperor: Emperor) => setSelectedEmperor(emperor);
  const handleCloseModal = () => setSelectedEmperor(null);

  return (
    <PeopleCollectionContent
      error={error}
      onRetry={loadEmperors}
      searchQuery={filters.searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="搜索帝王姓名、年号..."
      filters={[{ name: 'dynasty', label: '朝代', value: filters.dynasty, options: dynastyOptions.map((d) => ({ value: d, label: d })), onChange: setDynastyFilter }]}
      sortBy={filters.sortBy}
      sortOptions={[{ value: 'dynasty', label: '按朝代' }, { value: 'reignStart', label: '按在位时间' }]}
      onSortChange={(value) => setSortBy(value as EmperorSortBy)}
      resultCount={filteredEmperors.length}
      resultLabel="位帝王"
      grid={
        <EmperorGrid emperors={filteredEmperors} onEmperorClick={handleEmperorClick} loading={loading || requestLoading} />
      }
      modal={
        <EmperorDetailModal emperor={selectedEmperor} open={selectedEmperor !== null} onClose={handleCloseModal} />
      }
    />
  );
}

export default EmperorsContent;
