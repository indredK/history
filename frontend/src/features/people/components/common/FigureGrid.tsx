/**
 * 公共人物网格组件
 * 统一所有人物子模块的网格布局样式
 */

import { Box, Typography } from '@mui/material';
import { GridSkeleton } from './GridSkeleton';

/** 统一的网格 sx 样式 */
export const FIGURE_GRID_SX = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
  gap: { xs: 2, sm: 2, md: 2.5 },
  pt: 1,
  px: 0.5,
  pb: 2,
  transition: 'all 0.3s ease-in-out',
} as const;

interface FigureGridProps<T> {
  items: T[];
  loading: boolean;
  emptyTitle: string;
  emptySubtitle?: string;
  skeletonCount?: number;
  renderCard: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

/**
 * 公共人物网格组件
 * 替代各子模块重复的 Grid 组件
 */
export function FigureGrid<T>({
  items,
  loading,
  emptyTitle,
  emptySubtitle = '请尝试调整搜索条件或筛选条件',
  skeletonCount = 8,
  renderCard,
  keyExtractor,
}: FigureGridProps<T>) {
  if (loading) return <GridSkeleton count={skeletonCount} />;

  if (items.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', color: 'var(--color-text-secondary)', p: 4 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>{emptyTitle}</Typography>
        <Typography variant="body2">{emptySubtitle}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={FIGURE_GRID_SX}>
      {items.map((item) => (
        <Box key={keyExtractor(item)}>
          {renderCard(item)}
        </Box>
      ))}
    </Box>
  );
}

export default FigureGrid;
