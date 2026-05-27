/**
 * 清朝统治者内容容器组件
 * Qing Content Component
 * 
 * 整合筛选、网格、弹窗
 * 
 * Requirements: 4.1-4.8
 */

import { useMemo } from 'react';

import { useQingRulerStore } from '@/store';
import { getQingRulers } from '@/services/person/qing';
import type { QingRuler } from '@/services/person/qing/types';
import type { QingRulerSortBy } from '@/services/person/qing';
import { useCollectionResource } from '@/hooks';

import { PeopleCollectionContent } from '../common';
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
  const { reload: loadRulers, requestLoading } = useCollectionResource({
    cacheKey: 'qingRulers',
    items: rulers,
    loading,
    load: async () => {
      const result = await getQingRulers();
      return result.data;
    },
    setItems: setRulers,
    setLoading,
    setError,
    errorMessage: '获取清朝统治者数据失败:',
  });

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

  return (
    <PeopleCollectionContent
      error={error}
      onRetry={loadRulers}
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
      grid={
        <QingRulerGrid
          rulers={filteredRulers}
          onRulerClick={handleRulerClick}
          loading={loading || requestLoading}
        />
      }
      modal={
        <QingRulerDetailModal
          ruler={selectedRuler}
          open={selectedRuler !== null}
          onClose={handleCloseModal}
        />
      }
    />
  );
}

export default QingContent;
