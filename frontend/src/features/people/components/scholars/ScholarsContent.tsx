/**
 * 学者内容容器组件
 * Scholars Content Container Component
 */

import { useMemo } from 'react';

import { useScholarStore } from '@/store';
import { getScholars } from '@/services/person/scholars';
import type { Scholar } from '@/services/person/scholars/types';
import { useCollectionResource } from '@/hooks';
import { StateView } from '@/components/ui';

import { ScholarFilter, ScholarGrid, ScholarDetailModal } from '@/features/culture/components';

/**
 * 学者内容组件
 */
function ScholarsContent() {
  // Scholar store
  const {
    scholars,
    selectedScholar,
    loading: scholarLoading,
    error: scholarError,
    filters,
    setScholars,
    setSelectedScholar,
    setLoading: setScholarLoading,
    setError: setScholarError,
    setDynastyFilter,
    setSchoolFilter,
    getFilteredScholars,
  } = useScholarStore();

  // 加载学者数据
  const { reload: loadScholars, requestLoading: scholarsRequestLoading } =
    useCollectionResource({
      cacheKey: 'scholars',
      items: scholars,
      loading: scholarLoading,
      load: async () => {
        const result = await getScholars();
        return result.data;
      },
      setItems: setScholars,
      setLoading: setScholarLoading,
      setError: setScholarError,
      errorMessage: '获取学者数据失败:',
    });

  // 获取筛选后的学者列表
  const filteredScholars = useMemo(() => {
    return getFilteredScholars();
  }, [getFilteredScholars, scholars, filters]);

  // 获取筛选选项
  const dynastyOptions = useMemo(() => {
    const uniqueDynasties = [...new Set(
      scholars
        .map(s => s.dynasty || s.dynastyPeriod)
        .filter((dynasty): dynasty is string => Boolean(dynasty))
    )];
    return ['全部', ...uniqueDynasties];
  }, [scholars]);

  const schoolOptions = useMemo(() => {
    const uniqueSchools = [...new Set(
      scholars
        .map(s => s.schoolOfThought)
        .filter((school): school is string => Boolean(school))
    )];
    return ['全部', ...uniqueSchools];
  }, [scholars]);

  // 处理学者卡片点击
  const handleScholarClick = (scholar: Scholar) => {
    setSelectedScholar(scholar);
  };

  // 关闭学者详情弹窗
  const handleCloseScholarModal = () => {
    setSelectedScholar(null);
  };

  // 错误状态
  if (scholarError) {
    return (
      <StateView
        mode="error"
        title="加载失败"
        description={scholarError.message || '请检查网络连接后重试'}
        actionLabel="重试"
        onAction={loadScholars}
      />
    );
  }

  return (
    <>
      {/* 筛选器 */}
      <ScholarFilter
        selectedDynasty={filters.dynasty}
        selectedSchool={filters.schoolOfThought}
        onDynastyChange={setDynastyFilter}
        onSchoolChange={setSchoolFilter}
        dynastyOptions={dynastyOptions}
        schoolOptions={schoolOptions}
        resultCount={filteredScholars.length}
      />

      {/* 学者网格 */}
      <ScholarGrid
        scholars={filteredScholars}
        onScholarClick={handleScholarClick}
        loading={scholarLoading || scholarsRequestLoading}
      />

      {/* 学者详情弹窗 */}
      <ScholarDetailModal
        scholar={selectedScholar}
        open={selectedScholar !== null}
        onClose={handleCloseScholarModal}
      />
    </>
  );
}

export default ScholarsContent;
