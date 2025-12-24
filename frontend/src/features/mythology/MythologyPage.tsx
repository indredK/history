/**
 * 神话页面
 * Mythology Page
 * 
 * Requirements: 1.1-1.5, 2.1-2.6, 3.1-3.5, 5.1
 */

import { useState, useCallback } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import { useRequest } from 'ahooks';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

import { useMythologyStore } from '@/store/mythologyStore';
import { getMythologies } from '@/services/mythology';
import { FixedTabsPage, type FixedTabConfig } from '@/components/common';
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
  const [activeTab, setActiveTab] = useState<string>('mythology');
  
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

  // 处理卡片点击
  const handleCardClick = useCallback((mythology: typeof mythologies[0]) => {
    setSelectedMythology(mythology);
  }, [setSelectedMythology]);

  // 处理弹窗关闭
  const handleModalClose = useCallback(() => {
    setSelectedMythology(null);
  }, [setSelectedMythology]);

  // 神话故事内容
  const renderMythologyContent = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 分类筛选器 - 固定 */}
      <Box sx={{ flexShrink: 0 }}>
        <CategoryFilter
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </Box>

      {/* 卡片滚动区域 */}
      <Box sx={{ flex: 1, overflow: 'auto', pr: 1 }}>
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
    </Box>
  );

  // 宗教关系内容
  const renderReligionContent = () => (
    <Box sx={{ height: '100%' }}>
      <ReligionGraph />
    </Box>
  );

  // 定义标签页配置
  const tabs: FixedTabConfig[] = [
    {
      value: 'mythology',
      label: '神话故事',
      icon: <AutoStoriesIcon />,
      content: renderMythologyContent(),
    },
    {
      value: 'religion',
      label: '宗教关系',
      icon: <AccountTreeIcon />,
      content: renderReligionContent(),
    },
  ];

  return (
    <>
      <FixedTabsPage
        tabs={tabs}
        defaultTab="mythology"
        className={`mythology-page ${activeTab === 'religion' ? 'religion-view' : ''}`}
        onTabChange={setActiveTab}
      />

      {/* 详情弹窗 */}
      <MythologyDetailModal
        mythology={selectedMythology}
        open={selectedMythology !== null}
        onClose={handleModalClose}
      />
    </>
  );
}

export default MythologyPage;
