/**
 * 清朝统治者内容容器组件
 * Qing Content Component
 * 
 * 整合筛选、网格、弹窗
 * 
 * Requirements: 4.1-4.8
 */

import { useEffect, useMemo } from 'react';
import { Box, Typography, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useRequest } from 'ahooks';

import { useQingRulerStore } from '@/store';
import { getQingRulers } from '@/services/qingRuler';
import type { QingRuler } from '@/services/qingRuler/types';
import type { QingRulerSortBy } from '@/services/qingRuler';

import { PeopleFilter } from '../common/PeopleFilter';
import { QingRulerGrid } from './QingRulerGrid';
import { QingRulerDetailModal } from './QingRulerDetailModal';

/**
 * 清朝统治者内容容器组件
 */
export function QingContent() {
  const {
    rulers,
    selectedRuler,
    loading,
    error,
    filters,
    setRulers,
    setSelectedRuler,
    setLoading,
    setError,
    setPeriodFilter,
    setSearchQuery,
    setSortBy,
    getFilteredRulers,
    getPeriodOptions,
  } = useQingRulerStore();

  // 加载数据
  const { run: loadRulers, loading: requestLoading } = useRequest(
    async () => {
      const result = await getQingRulers();
      return result.data;
    },
    {
      manual: true,
      cacheKey: 'qingRulers',
      onBefore: () => setLoading(true),
      onSuccess: (data) => {
        setRulers(data);
        setError(null);
      },
      onError: (err) => {
        console.error('获取清朝统治者数据失败:', err);
        setError(err as Error);
      },
      onFinally: () => setLoading(false),
    }
  );

  // 首次加载数据
  useEffect(() => {
    if (rulers.length === 0 && !loading) {
      loadRulers();
    }
  }, [rulers.length, loading, loadRulers]);

  // 获取筛选后的统治者列表
  const filteredRulers = useMemo(() => {
    return getFilteredRulers();
  }, [getFilteredRulers, rulers, filters]);

  // 获取时期选项
  const periodOptions = useMemo(() => {
    return getPeriodOptions().map(period => ({
      value: period,
      label: period
    }));
  }, [getPeriodOptions]);

  // 处理统治者卡片点击
  const handleRulerClick = (ruler: QingRuler) => {
    setSelectedRuler(ruler);
  };

  // 关闭详情弹窗
  const handleCloseModal = () => {
    setSelectedRuler(null);
  };

  // 错误状态
  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
          color: 'var(--color-text-secondary)',
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          加载失败
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {error.message || '请检查网络连接后重试'}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => loadRulers()}
        >
          重试
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 筛选器 - 固定 */}
      <Box sx={{ flexShrink: 0 }}>
        <PeopleFilter
          searchQuery={filters.searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="搜索清朝统治者姓名、庙号、年号..."
          filters={[
            {
              name: 'period',
              label: '时期',
              value: filters.period,
              options: periodOptions,
              onChange: setPeriodFilter,
            },
          ]}
          sortBy={filters.sortBy}
          sortOptions={[
            { value: 'chronological', label: '按时间顺序' },
            { value: 'name', label: '按姓名' },
          ]}
          onSortChange={(value) => setSortBy(value as QingRulerSortBy)}
          resultCount={filteredRulers.length}
          resultLabel="位清朝统治者"
        />
      </Box>

      {/* 统治者网格 - 可滚动 */}
      <Box sx={{ flex: 1, overflow: 'auto', pr: 1 }}>
        <QingRulerGrid
          rulers={filteredRulers}
          onRulerClick={handleRulerClick}
          loading={loading || requestLoading}
        />
      </Box>

      {/* 详情弹窗 */}
      <QingRulerDetailModal
        ruler={selectedRuler}
        open={selectedRuler !== null}
        onClose={handleCloseModal}
      />
    </Box>
  );
}

export default QingContent;
