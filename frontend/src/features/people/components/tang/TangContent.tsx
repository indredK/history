/**
 * 唐朝人物内容容器组件
 */

import { useMemo } from 'react';

import { useTangFigureStore } from '@/store/tangFigureStore';
import { getTangFigures } from '@/services/person/tang';
import type { TangFigure, TangFigureRole } from '@/services/person/tang/types';
import type { TangFigureSortBy } from '@/services/person/tang';
import { ROLE_LABELS } from '@/services/person/tang/types';
import { useCollectionResource } from '@/hooks';

import { PeopleCollectionContent } from '../common';
import { TangFigureGrid } from './TangFigureGrid';
import { TangFigureDetailModal } from './TangFigureDetailModal';

export function TangContent() {
  const {
    figures, selectedFigure, loading, error, filters,
    setFigures, setSelectedFigure, setLoading, setError,
    setRoleFilter, setPeriodFilter, setSearchQuery, setSortBy,
    getFilteredFigures, getRoleOptions, getPeriodOptions,
  } = useTangFigureStore();

  const { reload: loadFigures, requestLoading } = useCollectionResource({
    cacheKey: 'tangFigures',
    items: figures,
    loading,
    load: async () => {
      const result = await getTangFigures();
      return result.data;
    },
    setItems: setFigures,
    setLoading,
    setError,
    errorMessage: '获取唐朝人物数据失败:',
  });

  const filteredFigures = useMemo(() => getFilteredFigures(), [getFilteredFigures, figures, filters]);
  const roleOptions = useMemo(() => getRoleOptions().map(role => ({ value: role, label: role === '全部' ? '全部' : ROLE_LABELS[role as TangFigureRole] || role })), [getRoleOptions]);
  const periodOptions = useMemo(() => getPeriodOptions().map(period => ({ value: period, label: period })), [getPeriodOptions]);

  const handleFigureClick = (figure: TangFigure) => setSelectedFigure(figure);
  const handleCloseModal = () => setSelectedFigure(null);

  return (
    <PeopleCollectionContent
      error={error}
      onRetry={loadFigures}
      searchQuery={filters.searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="搜索唐朝人物姓名、字号..."
      filters={[
        { name: 'role', label: '角色', value: filters.role, options: roleOptions, onChange: (value) => setRoleFilter(value as TangFigureRole | '全部') },
        { name: 'period', label: '时期', value: filters.period, options: periodOptions, onChange: setPeriodFilter },
      ]}
      sortBy={filters.sortBy}
      sortOptions={[{ value: 'birthYear', label: '按出生年' }, { value: 'name', label: '按姓名' }, { value: 'role', label: '按角色' }]}
      onSortChange={(value) => setSortBy(value as TangFigureSortBy)}
      resultCount={filteredFigures.length}
      resultLabel="位唐朝人物"
      grid={
        <TangFigureGrid figures={filteredFigures} onFigureClick={handleFigureClick} loading={loading || requestLoading} />
      }
      modal={
        <TangFigureDetailModal figure={selectedFigure} open={selectedFigure !== null} onClose={handleCloseModal} />
      }
    />
  );
}

export default TangContent;
