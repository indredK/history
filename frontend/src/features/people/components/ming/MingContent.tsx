/**
 * 明朝人物内容容器组件
 */

import { useMemo } from 'react';

import { useMingFigureStore } from '@/store';
import { getMingFigures } from '@/services/person/ming';
import type { MingFigure, MingFigureRole } from '@/services/person/ming/types';
import type { MingFigureSortBy } from '@/services/person/ming';
import { ROLE_LABELS } from '@/services/person/ming/types';
import { useCollectionResource } from '@/hooks';

import { PeopleCollectionContent } from '../common';
import { MingFigureGrid } from './MingFigureGrid';
import { MingFigureDetailModal } from './MingFigureDetailModal';

export function MingContent() {
  const {
    figures, selectedFigure, loading, error, filters,
    setFigures, setSelectedFigure, setLoading, setError,
    setRoleFilter, setPeriodFilter, setSearchQuery, setSortBy,
    getFilteredFigures, getRoleOptions, getPeriodOptions,
  } = useMingFigureStore();

  const { reload: loadFigures, requestLoading } = useCollectionResource({
    cacheKey: 'mingFigures',
    items: figures,
    loading,
    load: async () => {
      const result = await getMingFigures();
      return result.data;
    },
    setItems: setFigures,
    setLoading,
    setError,
    errorMessage: '获取明朝人物数据失败:',
  });

  const filteredFigures = useMemo(() => getFilteredFigures(), [getFilteredFigures, figures, filters]);
  const roleOptions = useMemo(() => getRoleOptions().map(role => ({ value: role, label: role === '全部' ? '全部' : ROLE_LABELS[role as MingFigureRole] || role })), [getRoleOptions]);
  const periodOptions = useMemo(() => getPeriodOptions().map(period => ({ value: period, label: period })), [getPeriodOptions]);

  const handleFigureClick = (figure: MingFigure) => setSelectedFigure(figure);
  const handleCloseModal = () => setSelectedFigure(null);

  return (
    <PeopleCollectionContent
      error={error}
      onRetry={loadFigures}
      searchQuery={filters.searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="搜索明朝人物姓名、字号..."
      filters={[
        { name: 'role', label: '角色', value: filters.role, options: roleOptions, onChange: (value) => setRoleFilter(value as MingFigureRole | '全部') },
        { name: 'period', label: '时期', value: filters.period, options: periodOptions, onChange: setPeriodFilter },
      ]}
      sortBy={filters.sortBy}
      sortOptions={[{ value: 'birthYear', label: '按出生年' }, { value: 'name', label: '按姓名' }, { value: 'role', label: '按角色' }]}
      onSortChange={(value) => setSortBy(value as MingFigureSortBy)}
      resultCount={filteredFigures.length}
      resultLabel="位明朝人物"
      grid={
        <MingFigureGrid figures={filteredFigures} onFigureClick={handleFigureClick} loading={loading || requestLoading} />
      }
      modal={
        <MingFigureDetailModal figure={selectedFigure} open={selectedFigure !== null} onClose={handleCloseModal} />
      }
    />
  );
}

export default MingContent;
