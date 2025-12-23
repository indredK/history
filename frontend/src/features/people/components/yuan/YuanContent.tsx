/**
 * 元朝人物内容容器组件
 */

import { useEffect, useMemo } from 'react';
import { Box, Typography, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useRequest } from 'ahooks';

import { useYuanFigureStore } from '@/store/yuanFigureStore';
import { getYuanFigures } from '@/services/yuanFigure';
import type { YuanFigure, YuanFigureRole } from '@/services/yuanFigure/types';
import type { YuanFigureSortBy } from '@/services/yuanFigure';
import { ROLE_LABELS } from '@/services/yuanFigure/types';

import { PeopleFilter } from '../common/PeopleFilter';
import { YuanFigureGrid } from './YuanFigureGrid';
import { YuanFigureDetailModal } from './YuanFigureDetailModal';

export function YuanContent() {
  const {
    figures, selectedFigure, loading, error, filters,
    setFigures, setSelectedFigure, setLoading, setError,
    setRoleFilter, setPeriodFilter, setSearchQuery, setSortBy,
    getFilteredFigures, getRoleOptions, getPeriodOptions,
  } = useYuanFigureStore();

  const { run: loadFigures, loading: requestLoading } = useRequest(
    async () => {
      const result = await getYuanFigures();
      return result.data;
    },
    {
      manual: true,
      cacheKey: 'yuanFigures',
      onBefore: () => setLoading(true),
      onSuccess: (data) => { setFigures(data); setError(null); },
      onError: (err) => { console.error('获取元朝人物数据失败:', err); setError(err as Error); },
      onFinally: () => setLoading(false),
    }
  );

  useEffect(() => {
    if (figures.length === 0 && !loading) loadFigures();
  }, [figures.length, loading, loadFigures]);

  const filteredFigures = useMemo(() => getFilteredFigures(), [getFilteredFigures, figures, filters]);

  const roleOptions = useMemo(() => getRoleOptions().map(role => ({
    value: role,
    label: role === '全部' ? '全部' : ROLE_LABELS[role as YuanFigureRole] || role
  })), [getRoleOptions]);

  const periodOptions = useMemo(() => getPeriodOptions().map(period => ({ value: period, label: period })), [getPeriodOptions]);

  const handleFigureClick = (figure: YuanFigure) => setSelectedFigure(figure);
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
        />
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto', pr: 1 }}>
        <YuanFigureGrid figures={filteredFigures} onFigureClick={handleFigureClick} loading={loading || requestLoading} />
      </Box>
      <YuanFigureDetailModal figure={selectedFigure} open={selectedFigure !== null} onClose={handleCloseModal} />
    </Box>
  );
}

export default YuanContent;
