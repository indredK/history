/**
 * 三国人物内容容器组件
 */

import { useMemo } from 'react';

import { useSanguoFigureStore } from '@/store/sanguoFigureStore';
import { getSanguoFigures } from '@/services/person/sanguo';
import type { SanguoFigure, SanguoFigureRole, SanguoKingdom } from '@/services/person/sanguo/types';
import type { SanguoFigureSortBy } from '@/services/person/sanguo';
import { ROLE_LABELS, KINGDOM_LABELS } from '@/services/person/sanguo/types';
import { useCollectionResource } from '@/hooks';

import { PeopleCollectionContent } from '../common';
import { SanguoFigureGrid } from './SanguoFigureGrid';
import { SanguoFigureDetailModal } from './SanguoFigureDetailModal';

export function SanguoContent() {
  const {
    figures, selectedFigure, loading, error, filters,
    setFigures, setSelectedFigure, setLoading, setError,
    setRoleFilter, setKingdomFilter, setSearchQuery, setSortBy,
    getFilteredFigures, getRoleOptions, getKingdomOptions,
  } = useSanguoFigureStore();

  const { reload: loadFigures, requestLoading } = useCollectionResource({
    cacheKey: 'sanguoFigures',
    items: figures,
    loading,
    load: async () => {
      const result = await getSanguoFigures();
      return result.data;
    },
    setItems: setFigures,
    setLoading,
    setError,
    errorMessage: '获取三国人物数据失败:',
  });

  const filteredFigures = useMemo(() => getFilteredFigures(), [getFilteredFigures, figures, filters]);

  const roleOptions = useMemo(() => getRoleOptions().map(role => ({
    value: role,
    label: role === '全部' ? '全部' : ROLE_LABELS[role as SanguoFigureRole] || role
  })), [getRoleOptions]);

  const kingdomOptions = useMemo(() => getKingdomOptions().map(kingdom => ({
    value: kingdom,
    label: kingdom === '全部' ? '全部' : KINGDOM_LABELS[kingdom as SanguoKingdom] || kingdom
  })), [getKingdomOptions]);

  const handleFigureClick = (figure: SanguoFigure) => setSelectedFigure(figure);
  const handleCloseModal = () => setSelectedFigure(null);

  return (
    <PeopleCollectionContent
      error={error}
      onRetry={loadFigures}
      searchQuery={filters.searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="搜索三国人物姓名、字号..."
      filters={[
        { name: 'role', label: '角色', value: filters.role, options: roleOptions, onChange: (value) => setRoleFilter(value as SanguoFigureRole | '全部') },
        { name: 'kingdom', label: '势力', value: filters.kingdom, options: kingdomOptions, onChange: (value) => setKingdomFilter(value as SanguoKingdom | '全部') },
      ]}
      sortBy={filters.sortBy}
      sortOptions={[
        { value: 'kingdom', label: '按势力' },
        { value: 'birthYear', label: '按出生年' },
        { value: 'name', label: '按姓名' },
        { value: 'role', label: '按角色' },
      ]}
      onSortChange={(value) => setSortBy(value as SanguoFigureSortBy)}
      resultCount={filteredFigures.length}
      resultLabel="位三国人物"
      grid={
        <SanguoFigureGrid figures={filteredFigures} onFigureClick={handleFigureClick} loading={loading || requestLoading} />
      }
      modal={
        <SanguoFigureDetailModal figure={selectedFigure} open={selectedFigure !== null} onClose={handleCloseModal} />
      }
    />
  );
}

export default SanguoContent;
