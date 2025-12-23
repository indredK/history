/**
 * 三国人物内容容器组件
 */

import { useEffect, useMemo } from 'react';
import { Box, Typography, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useRequest } from 'ahooks';

import { useSanguoFigureStore } from '@/store/sanguoFigureStore';
import { getSanguoFigures } from '@/services/sanguoFigure';
import type { SanguoFigure, SanguoFigureRole, SanguoKingdom } from '@/services/sanguoFigure/types';
import type { SanguoFigureSortBy } from '@/services/sanguoFigure';
import { ROLE_LABELS, KINGDOM_LABELS } from '@/services/sanguoFigure/types';

import { PeopleFilter } from '../common/PeopleFilter';
import { SanguoFigureGrid } from './SanguoFigureGrid';
import { SanguoFigureDetailModal } from './SanguoFigureDetailModal';

export function SanguoContent() {
  const {
    figures, selectedFigure, loading, error, filters,
    setFigures, setSelectedFigure, setLoading, setError,
    setRoleFilter, setKingdomFilter, setSearchQuery, setSortBy,
    getFilteredFigures, getRoleOptions, getKingdomOptions,
  } = useSanguoFigureStore();

  const { run: loadFigures, loading: requestLoading } = useRequest(
    async () => {
      const result = await getSanguoFigures();
      return result.data;
    },
    {
      manual: true,
      cacheKey: 'sanguoFigures',
      onBefore: () => setLoading(true),
      onSuccess: (data) => { setFigures(data); setError(null); },
      onError: (err) => { console.error('获取三国人物数据失败:', err); setError(err as Error); },
      onFinally: () => setLoading(false),
    }
  );

  useEffect(() => {
    if (figures.length === 0 && !loading) loadFigures();
  }, [figures.length, loading, loadFigures]);

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

  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', color: 'var(--color-text-secondary)' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>加载失败</Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>{error.message || '请检查网络连接后重试'}</Typography>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => loadFigures()}>重试</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ flexShrink: 0 }}>
        <PeopleFilter
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
        />
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto', pr: 1 }}>
        <SanguoFigureGrid figures={filteredFigures} onFigureClick={handleFigureClick} loading={loading || requestLoading} />
      </Box>
      <SanguoFigureDetailModal figure={selectedFigure} open={selectedFigure !== null} onClose={handleCloseModal} />
    </Box>
  );
}

export default SanguoContent;
