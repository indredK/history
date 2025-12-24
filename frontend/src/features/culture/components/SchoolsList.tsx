/**
 * 思想流派列表组件
 * Schools List Component
 * 
 * 响应式网格布局展示思想流派卡片
 * 支持加载骨架屏
 * 
 * Requirements: 3.1, 3.4, 5.1
 */

import { Box, Typography, Skeleton, Card, CardContent } from '@mui/material';
import { SchoolCard } from './SchoolCard';
import type { PhilosophicalSchool } from '@/services/school/types';

interface SchoolsListProps {
  schools: PhilosophicalSchool[];
  onSchoolClick: (school: PhilosophicalSchool) => void;
  loading: boolean;
}

/**
 * 加载骨架屏组件
 * Requirements 5.1: 数据加载时显示骨架屏
 */
function SchoolsListSkeleton({ count = 10 }: { count?: number }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
        },
        gap: { xs: 2, sm: 2, md: 3 },
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <Card
          key={index}
          sx={{
            height: '100%',
            minHeight: '200px',
            background: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <CardContent sx={{ p: 2 }}>
            {/* 图标和名称骨架 */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
              <Skeleton
                variant="circular"
                width={48}
                height={48}
                sx={{ mr: 1.5 }}
              />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="50%" height={24} />
                <Skeleton variant="text" width="40%" height={18} />
              </Box>
            </Box>
            
            {/* 创始人和时期标签骨架 */}
            <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5 }}>
              <Skeleton
                variant="rounded"
                width={80}
                height={22}
                sx={{ borderRadius: '11px' }}
              />
              <Skeleton
                variant="rounded"
                width={60}
                height={22}
                sx={{ borderRadius: '11px' }}
              />
            </Box>
            
            {/* 核心思想标签骨架 */}
            <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5, flexWrap: 'wrap' }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rounded"
                  width={30}
                  height={20}
                  sx={{ borderRadius: '10px' }}
                />
              ))}
            </Box>
            
            {/* 简介骨架 */}
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="70%" />
            
            {/* 底部骨架 */}
            <Box sx={{ mt: 1.5, pt: 1, borderTop: '1px solid var(--color-border)' }}>
              <Skeleton variant="text" width="50%" height={18} />
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

/**
 * 思想流派列表组件
 * 
 * Requirements 3.1: 显示流派卡片网格
 * Requirements 3.4: 响应式布局
 * Requirements 5.1: 加载骨架屏
 */
export function SchoolsList({
  schools,
  onSchoolClick,
  loading,
}: SchoolsListProps) {
  // 加载状态 - Requirements 5.1
  if (loading) {
    return <SchoolsListSkeleton />;
  }

  // 空状态处理
  if (schools.length === 0) {
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
          暂无思想流派数据
        </Typography>
        <Typography variant="body2">
          请稍后再试
        </Typography>
      </Box>
    );
  }

  // 响应式网格布局 - Requirements 3.4
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',              // 手机: 1列
          sm: 'repeat(2, 1fr)',   // 平板: 2列
          md: 'repeat(3, 1fr)',   // 桌面: 3列
        },
        gap: { xs: 2, sm: 2, md: 3 },
        pt: 1, // 顶部间距
        px: 0.5, // 左右间距
        pb: 2, // 底部间距
        transition: 'all 0.3s ease-in-out',
      }}
    >
      {schools.map((school) => (
        <SchoolCard
          key={school.id}
          school={school}
          onClick={() => onSchoolClick(school)}
        />
      ))}
    </Box>
  );
}

export default SchoolsList;
