/**
 * 神话页面
 * Mythology Page
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */

import { Box, Typography, Skeleton } from '@mui/material';
import { useRequest } from 'ahooks';
import { useMythologyStore } from '@/store/mythologyStore';
import { getMythologies } from '@/services/mythology';
import { CategoryFilter } from './components/CategoryFilter';
import { MythologyGrid } from './components/MythologyGrid';
import { MythologyDetailModal } from './components/MythologyDetailModal';
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
          sx={{
            p: 2,
            background: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-lg)',
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

  // 处理卡片点击
  const handleCardClick = (mythology: typeof mythologies[0]) => {
    setSelectedMythology(mythology);
  };

  // 处理弹窗关闭
  const handleModalClose = () => {
    setSelectedMythology(null);
  };

  return (
    <Box className="mythology-page">
      {/* 页面标题 */}
      <Typography
        variant="h4"
        component="h1"
        sx={{
          mb: 2,
          color: 'var(--color-text-primary)',
          fontWeight: 'bold',
        }}
      >
        中国神话
      </Typography>

      {/* 页面介绍 */}
      <Typography
        variant="body1"
        sx={{
          mb: 3,
          color: 'var(--color-text-secondary)',
          lineHeight: 1.6,
          maxWidth: '800px',
        }}
      >
        中国神话是中华民族智慧的结晶，蕴含着先民对自然、社会和人生的深刻思考。
        这里收录了流传千年的经典神话故事，从创世传说到英雄史诗，带你领略华夏文明的瑰丽想象。
      </Typography>

      {/* 分类筛选器 */}
      <CategoryFilter
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* 内容区域 */}
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
