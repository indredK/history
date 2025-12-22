/**
 * 神话卡片组件
 * Mythology Card Component
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7
 */

import { Box, Typography, Chip, CardContent } from '@mui/material';
import { ResponsiveCard } from '@/components/ui/ResponsiveCard';
import type { Mythology } from '@/services/mythology';

interface MythologyCardProps {
  mythology: Mythology;
  onClick: (mythology: Mythology) => void;
}

/**
 * 分类颜色映射
 */
const categoryColors: Record<string, { bg: string; text: string }> = {
  '创世神话': { bg: 'rgba(156, 39, 176, 0.15)', text: '#9c27b0' },
  '英雄神话': { bg: 'rgba(244, 67, 54, 0.15)', text: '#f44336' },
  '自然神话': { bg: 'rgba(76, 175, 80, 0.15)', text: '#4caf50' },
  '爱情神话': { bg: 'rgba(233, 30, 99, 0.15)', text: '#e91e63' },
};

/**
 * 神话卡片组件
 * 展示单个神话故事的标题、分类、简介和相关人物
 */
export function MythologyCard({ mythology, onClick }: MythologyCardProps) {
  const categoryColor = categoryColors[mythology.category] || { 
    bg: 'rgba(158, 158, 158, 0.15)', 
    text: '#9e9e9e' 
  };

  return (
    <ResponsiveCard
      glassEffect={true}
      onClick={() => onClick(mythology)}
      role="article"
      aria-label={`神话故事: ${mythology.title}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(mythology);
        }
      }}
      sx={{
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 'var(--shadow-lg)',
        },
        '&:focus-visible': {
          outline: '2px solid var(--color-primary)',
          outlineOffset: '2px',
        },
      }}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* 标题和分类 */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 'bold',
              color: 'var(--color-text-primary)',
              mb: 1,
            }}
          >
            {mythology.title}
          </Typography>
          
          {/* 分类标签 */}
          <Chip
            label={mythology.category}
            size="small"
            sx={{
              backgroundColor: categoryColor.bg,
              color: categoryColor.text,
              fontWeight: 500,
              fontSize: '0.75rem',
            }}
          />
        </Box>

        {/* 描述（截断显示） */}
        <Typography
          variant="body2"
          sx={{
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
            mb: 2,
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {mythology.description}
        </Typography>

        {/* 相关人物标签 */}
        {mythology.characters && mythology.characters.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {mythology.characters.slice(0, 4).map((character, index) => (
              <Chip
                key={index}
                label={character}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: '0.7rem',
                  height: '24px',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-secondary)',
                }}
              />
            ))}
            {mythology.characters.length > 4 && (
              <Chip
                label={`+${mythology.characters.length - 4}`}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: '0.7rem',
                  height: '24px',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-secondary)',
                }}
              />
            )}
          </Box>
        )}
      </CardContent>
    </ResponsiveCard>
  );
}

export default MythologyCard;
