/**
 * 学者卡片组件
 * Scholar Card Component
 * 
 * 显示学者基本信息：姓名、朝代、简介
 * 支持头像或首字占位符
 * 悬停效果
 * 
 * Requirements: 3.1, 3.2, 3.3
 */

import { Box, Typography, Chip, CardContent, Avatar } from '@mui/material';
import { ResponsiveCard } from '@/components/ui/ResponsiveCard';
import type { Scholar } from '@/services/scholar/types';

interface ScholarCardProps {
  scholar: Scholar;
  onClick: () => void;
}

/**
 * 朝代颜色映射
 */
const dynastyColors: Record<string, { bg: string; text: string }> = {
  '唐代': { bg: 'rgba(156, 39, 176, 0.15)', text: '#9c27b0' },
  '宋代': { bg: 'rgba(33, 150, 243, 0.15)', text: '#2196f3' },
};

/**
 * 学者卡片组件
 * 展示单个学者的姓名、朝代、简介
 * 
 * Property 7: Portrait Fallback
 * - 如果 portraitUrl 为空或未定义，显示学者姓名首字作为占位符
 */
export function ScholarCard({ scholar, onClick }: ScholarCardProps) {
  const dynastyColor = dynastyColors[scholar.dynasty] || { 
    bg: 'rgba(158, 158, 158, 0.15)', 
    text: '#9e9e9e' 
  };

  // Property 7: Portrait Fallback - 如果没有头像URL，使用首字占位符
  const hasPortrait = scholar.portraitUrl && scholar.portraitUrl.trim() !== '';
  const firstChar = scholar.name.charAt(0);

  return (
    <ResponsiveCard
      glassEffect={true}
      onClick={onClick}
      role="article"
      aria-label={`学者: ${scholar.name}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      sx={{
        cursor: 'pointer',
        height: '100%',
        minHeight: '180px',
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
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2, '&:last-child': { pb: 2 } }}>
        {/* 头像和基本信息 */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
          {/* 头像或首字占位符 */}
          <Avatar
            {...(hasPortrait ? { src: scholar.portraitUrl } : {})}
            alt={scholar.name}
            sx={{
              width: 48,
              height: 48,
              mr: 1.5,
              backgroundColor: dynastyColor.bg,
              color: dynastyColor.text,
              fontWeight: 'bold',
              fontSize: '1.2rem',
              border: `2px solid ${dynastyColor.text}`,
            }}
          >
            {!hasPortrait && firstChar}
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            {/* 姓名 */}
            <Typography
              variant="subtitle1"
              component="h3"
              sx={{
                fontWeight: 'bold',
                color: 'var(--color-text-primary)',
                fontSize: '1rem',
                lineHeight: 1.3,
              }}
            >
              {scholar.name}
            </Typography>
            
            {/* 英文名 */}
            <Typography
              variant="caption"
              sx={{
                color: 'var(--color-text-secondary)',
                fontSize: '0.75rem',
              }}
            >
              {scholar.name_en}
            </Typography>
          </Box>
        </Box>

        {/* 朝代和学派标签 */}
        <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5, flexWrap: 'wrap' }}>
          <Chip
            label={scholar.dynasty}
            size="small"
            sx={{
              backgroundColor: dynastyColor.bg,
              color: dynastyColor.text,
              fontWeight: 500,
              fontSize: '0.7rem',
              height: '22px',
            }}
          />
          <Chip
            label={scholar.schoolOfThought}
            size="small"
            variant="outlined"
            sx={{
              fontSize: '0.7rem',
              height: '22px',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-secondary)',
            }}
          />
          <Chip
            label={`${scholar.birthYear}-${scholar.deathYear}`}
            size="small"
            variant="outlined"
            sx={{
              fontSize: '0.65rem',
              height: '22px',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-secondary)',
            }}
          />
        </Box>

        {/* 简介（截断显示） */}
        <Typography
          variant="body2"
          sx={{
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: '0.85rem',
          }}
        >
          {scholar.biography}
        </Typography>

        {/* 代表作品数量 */}
        {scholar.representativeWorks && scholar.representativeWorks.length > 0 && (
          <Box sx={{ mt: 1.5, pt: 1, borderTop: '1px solid var(--color-border)' }}>
            <Typography
              variant="caption"
              sx={{
                color: 'var(--color-text-secondary)',
                fontSize: '0.75rem',
              }}
            >
              代表作品: {scholar.representativeWorks.length}篇
            </Typography>
          </Box>
        )}
      </CardContent>
    </ResponsiveCard>
  );
}

export default ScholarCard;
