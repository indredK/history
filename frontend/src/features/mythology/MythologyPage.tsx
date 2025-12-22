/**
 * 神话页面
 * Mythology Page
 * 
 * Requirements: 1.1-1.5, 2.1-2.6, 3.1-3.5, 5.1
 */

import { useState, useCallback } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import { useRequest } from 'ahooks';
import { useMythologyStore } from '@/store/mythologyStore';
import { getMythologies } from '@/services/mythology';
import { ScrollContainer } from '@/components/ui/ScrollContainer';
import { CategoryTabs, type MythologyViewType } from './components/CategoryTabs';
import { CategoryFilter } from './components/CategoryFilter';
import { MythologyGrid } from './components/MythologyGrid';
import { MythologyDetailModal } from './components/MythologyDetailModal';
import { ReligionGraph } from './components/ReligionGraph';
import './MythologyPage.css';

/**
 * 加载骨架屏组件
 */
function LoadingSkeleton() {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: '1fr',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)',
        },
        gap: { xs: 2, sm: 2, md: 3 },
      }}
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <Box
          key={index}
          className="glass-card-dark"
          sx={{
            p: 2,
            borderRadius: 'var(--radius-lg)',
            animation: `fadeIn 0.3s ease-out ${index * 0.1}s both`,
          }}
        >
          <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" width={80} height={24} sx={{ mb: 2, borderRadius: 1 }} />
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="80%" sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Skeleton variant="rectangular" width={50} height={24} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={50} height={24} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={50} height={24} sx={{ borderRadius: 1 }} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

/**
 * 神话页面组件
 */
function MythologyPage() {
  const [activeTab, setActiveTab] = useState<MythologyViewType>('mythology');
  
  const {
    mythologies,
    setMythologies,
    selectedMythology,
    setSelectedMythology,
    activeCategory,
    setActiveCategory,
    getFilteredMythologies,
  } = useMythologyStore();

  // 使用 ahooks 的 useRequest 获取数据
  const { loading, error } = useRequest(
    async () => {
      const result = await getMythologies();
      if (!result.success) {
        throw new Error(result.message || '获取数据失败');
      }
      return result.data;
    },
    {
      cacheKey: 'mythologies',
      manual: false,
      onSuccess: (data) => setMythologies(data),
    }
  );

  // 获取筛选后的神话列表
  const filteredMythologies = getFilteredMythologies();

  // 处理标签页切换
  const handleTabChange = useCallback((tab: MythologyViewType) => {
    setActiveTab(tab);
  }, []);

  // 处理卡片点击
  const handleCardClick = useCallback((mythology: typeof mythologies[0]) => {
    setSelectedMythology(mythology);
  }, [setSelectedMythology]);

  // 处理弹窗关闭
  const handleModalClose = useCallback(() => {
    setSelectedMythology(null);
  }, [setSelectedMythology]);

  return (
    <Box className={`mythology-page ${activeTab === 'religion' ? 'religion-view' : ''}`}>
      {/* 分类标签页 */}
      <Box className="mythology-tabs">
        <CategoryTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </Box>

      {/* 内容区域 */}
      <Box className="mythology-content">
        {activeTab === 'mythology' ? (
          // 神话故事视图
          <Box className="mythology-stories-view">
            {/* 分类筛选器 - 固定在顶部 */}
            <Box className="mythology-filter-bar">
              <CategoryFilter
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
            </Box>

            {/* 卡片滚动区域 */}
            <ScrollContainer 
              className="mythology-scroll-view"
              preserveScrollKey="mythology-stories"
              showEndIndicator
            >
              <Box className="mythology-view-enter">
                {/* 神话卡片网格 */}
                {loading ? (
                  <LoadingSkeleton />
                ) : error ? (
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
                    <Typography variant="body2">
                      {error.message || '请检查网络连接后重试'}
                    </Typography>
                  </Box>
                ) : (
                  <MythologyGrid
                    mythologies={filteredMythologies}
                    onCardClick={handleCardClick}
                  />
                )}
              </Box>
            </ScrollContainer>
          </Box>
        ) : (
          // 宗教关系视图 - 直接渲染，不使用滚动容器
          <Box className="mythology-view-enter religion-graph-view">
            <ReligionGraph />
          </Box>
        )}
      </Box>

      {/* 详情弹窗 */}
      <MythologyDetailModal
        mythology={selectedMythology}
        open={selectedMythology !== null}
        onClose={handleModalClose}
      />
    </Box>
  );
}

export default MythologyPage;
