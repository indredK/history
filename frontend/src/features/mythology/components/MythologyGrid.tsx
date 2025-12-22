/**
 * 神话卡片网格组件
 * Mythology Card Grid Component
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */

import { Box, Typography } from '@mui/material';
import { MythologyCard } from './MythologyCard';
import type { Mythology } from '@/services/mythology';

interface MythologyGridProps {
  mythologies: Mythology[];
  onCardClick: (mythology: Mythology) => void;
}

/**
 * 神话卡片网格组件
 * 响应式布局：桌面3列、平板2列、手机1列
 */
export function MythologyGrid({ mythologies, onCardClick }: MythologyGridProps) {
  // 空状态处理
  if (mythologies.length === 0) {
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
          暂无神话故事
        </Typography>
        <Typography variant="body2">
          请尝试选择其他分类
        </Typography>
      </Box>
    );
  }

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
        gap: { xs: 1.5, sm: 1.5, md: 2 },
        transition: 'all 0.3s ease-in-out',
      }}
    >
      {mythologies.map((mythology) => (
        <MythologyCard
          key={mythology.id}
          mythology={mythology}
          onClick={onCardClick}
        />
      ))}
    </Box>
  );
}

export default MythologyGrid;
