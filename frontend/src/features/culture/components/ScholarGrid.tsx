/**
 * 学者网格组件
 * Scholar Grid Component
 * 
 * 响应式网格布局展示学者卡片
 * 支持加载骨架屏
 * 
 * Requirements: 6.4, 7.1
 */

import { Box, Typography, Skeleton, Card, CardContent } from '@mui/material';
import { ScholarCard } from './ScholarCard';
import type { Scholar } from '@/services/scholar/types';

interface ScholarGridProps {
  scholars: Scholar[];
  onScholarClick: (scholar: Scholar) => void;
  loading: boolean;
}

/**
 * 加载骨架屏组件
 * Requirements 7.1: 数据加载时显示骨架屏
 */
function ScholarGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)',
        },
        gap: { xs: 2, sm: 2, md: 2.5 },
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <Card
          key={index}
          sx={{
            height: '100%',
            minHeight: '180px',
            background: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <CardContent sx={{ p: 2 }}>
            {/* 头像和姓名骨架 */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
              <Skeleton
                variant="circular"
                width={48}
                height={48}
                sx={{ mr: 1.5 }}
              />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="40%" height={18} />
              </Box>
            </Box>
            
            {/* 标签骨架 */}
            <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5 }}>
              <Skeleton
                variant="rounded"
                width={50}
                height={22}
                sx={{ borderRadius: '11px' }}
              />
              <Skeleton
                variant="rounded"
                width={40}
                height={22}
                sx={{ borderRadius: '11px' }}
              />
              <Skeleton
                variant="rounded"
                width={70}
                height={22}
                sx={{ borderRadius: '11px' }}
              />
            </Box>
            
            {/* 简介骨架 */}
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="70%" />
            
            {/* 底部骨架 */}
            <Box sx={{ mt: 1.5, pt: 1, borderTop: '1px solid var(--color-border)' }}>
              <Skeleton variant="text" width="40%" height={18} />
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

/**
 * 学者网格组件
 * 
 * Requirements 6.4: 响应式布局
 * Requirements 7.1: 加载骨架屏
 */
export function ScholarGrid({
  scholars,
  onScholarClick,
  loading,
}: ScholarGridProps) {
  // 加载状态 - Requirements 7.1
  if (loading) {
    return <ScholarGridSkeleton />;
  }

  // 空状态处理
  if (scholars.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
          color: 'var(--color-text-secondary)',
          p: 4,
        }}
      >
        <Typography variant="h6" sx={{ mb: 1 }}>
          没有找到匹配的学者
        </Typography>
        <Typography variant="body2">
          请尝试调整筛选条件
        </Typography>
      </Box>
    );
  }

  // 响应式网格布局 - Requirements 6.4
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',              // 手机: 1列
          sm: 'repeat(2, 1fr)',   // 小平板: 2列
          md: 'repeat(3, 1fr)',   // 平板: 3列
          lg: 'repeat(4, 1fr)',   // 桌面: 4列
        },
        gap: { xs: 2, sm: 2, md: 2.5 },
        pt: 1, // 顶部间距
        px: 0.5, // 左右间距
        pb: 2, // 底部间距
        transition: 'all 0.3s ease-in-out',
      }}
    >
      {scholars.map((scholar) => (
        <ScholarCard
          key={scholar.id}
          scholar={scholar}
          onClick={() => onScholarClick(scholar)}
        />
      ))}
    </Box>
  );
}

export default ScholarGrid;
