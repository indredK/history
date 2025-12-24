/**
 * 清朝统治者网格组件
 * Qing Ruler Grid Component
 * 
 * 响应式网格布局
 * 
 * Requirements: 4.1, 5.1, 5.2, 5.3
 */

import { Box, Typography } from '@mui/material';
import type { QingRuler } from '@/services/person/qing/types';
import { QingRulerCard } from './QingRulerCard';
import { GridSkeleton } from '../common/GridSkeleton';

interface QingRulerGridProps {
  rulers: QingRuler[];
  onRulerClick: (ruler: QingRuler) => void;
  loading?: boolean;
}

/**
 * 清朝统治者网格组件
 */
export function QingRulerGrid({
  rulers,
  onRulerClick,
  loading = false,
}: QingRulerGridProps) {
  // 加载状态
  if (loading) {
    return <GridSkeleton />;
  }

  // 空状态
  if (rulers.length === 0) {
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
        <Typography variant="h6" sx={{ mb: 1 }}>
          暂无数据
        </Typography>
        <Typography variant="body2">
          没有找到符合条件的清朝统治者
        </Typography>
      </Box>
    );
  }

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
        pt: 1, // 顶部间距
        px: 0.5, // 左右间距
        pb: 2, // 底部间距
      }}
    >
      {rulers.map((ruler) => (
        <QingRulerCard
          key={ruler.id}
          ruler={ruler}
          onClick={() => onRulerClick(ruler)}
        />
      ))}
    </Box>
  );
}

export default QingRulerGrid;
