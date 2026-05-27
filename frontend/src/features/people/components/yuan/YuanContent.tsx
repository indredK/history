/**
 * 元朝人物内容容器组件
 */

import { useMemo } from 'react';

import { useYuanFigureStore } from '@/store/yuanFigureStore';
import { getYuanFigures } from '@/services/person/yuan';
import type { YuanFigure, YuanFigureRole } from '@/services/person/yuan/types';
import type { YuanFigureSortBy } from '@/services/person/yuan';
import { ROLE_LABELS } from '@/services/person/yuan/types';
import { useCollectionResource } from '@/hooks';

import { PeopleCollectionContent } from '../common';
import { YuanFigureGrid } from './YuanFigureGrid';
import { YuanFigureDetailModal } from './YuanFigureDetailModal';

export function YuanContent() {
  const {
    figures, selectedFigure, loading, error, filters,
    setFigures, setSelectedFigure, setLoading, setError,
    setRoleFilter, setPeriodFilter, setSearchQuery, setSortBy,
    getFilteredFigures, getRoleOptions, getPeriodOptions,
  } = useYuanFigureStore();

  const { reload: loadFigures, requestLoading } = useCollectionResource({
    cacheKey: 'yuanFigures',
    items: figures,
    loading,
    load: async () => {
      const result = await getYuanFigures();
      return result.data;
    },
    setItems: setFigures,
    setLoading,
    setError,
    errorMessage: '获取元朝人物数据失败:',
  });

  const filteredFigures = useMemo(() => getFilteredFigures(), [getFilteredFigures, figures, filters]);

  const roleOptions = useMemo(() => getRoleOptions().map(role => ({
    value: role,
    label: role === '全部' ? '全部' : ROLE_LABELS[role as YuanFigureRole] || role
  })), [getRoleOptions]);

  const periodOptions = useMemo(() => getPeriodOptions().map(period => ({ value: period, label: period })), [getPeriodOptions]);

  const handleFigureClick = (figure: YuanFigure) => setSelectedFigure(figure);
  const handleCloseModal = () => setSelectedFigure(null);

  return (
    <PeopleCollectionContent
      error={error}
      onRetry={loadFigures}
      searchQuery={filters.searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="搜索元朝人物姓名、字号..."
      filters={[
        { name: 'role', label: '角色', value: filters.role, options: roleOptions, onChange: (value) => setRoleFilter(value as YuanFigureRole | '全部') },
        { name: 'period', label: '时期', value: filters.period, options: periodOptions, onChange: setPeriodFilter },
      ]}
      sortBy={filters.sortBy}
      sortOptions={[
        { value: 'birthYear', label: '按出生年' },
        { value: 'name', label: '按姓名' },
        { value: 'role', label: '按角色' },
      ]}
      onSortChange={(value) => setSortBy(value as YuanFigureSortBy)}
      resultCount={filteredFigures.length}
      resultLabel="位元朝人物"
      grid={
        <YuanFigureGrid figures={filteredFigures} onFigureClick={handleFigureClick} loading={loading || requestLoading} />
      }
      modal={
        <YuanFigureDetailModal figure={selectedFigure} open={selectedFigure !== null} onClose={handleCloseModal} />
      }
    />
  );
}

export default YuanContent;
