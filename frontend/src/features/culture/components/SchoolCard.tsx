/**
 * 思想流派卡片组件
 * School Card Component
 * 
 * 显示思想流派基本信息：名称、创始人、创立时期、简介
 * 支持悬停效果
 * 
 * Requirements: 3.2, 3.3
 */

import { Box, Typography, Chip, CardContent, Avatar } from '@mui/material';
import { ResponsiveCard } from '@/components/ui/ResponsiveCard';
import type { PhilosophicalSchool } from '@/services/schools/types';

interface SchoolCardProps {
  school: PhilosophicalSchool;
  onClick: () => void;
}

/**
 * 思想流派卡片组件
 * 展示单个流派的名称、创始人、创立时期、简介
 */
export function SchoolCard({ school, onClick }: SchoolCardProps) {
  const firstChar = school.name.charAt(0);

  return (
    <ResponsiveCard
      glassEffect={true}
      onClick={onClick}
      role="article"
      aria-label={`思想流派: ${school.name}`}
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
        minHeight: '140px',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 'var(--shadow-lg)',
        },
        '&:focus-visible': {
          outline: '2px solid var(--color-primary)',
          outlineOffset: '2px',
        },
      }}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 1.5, '&:last-child': { pb: 1.5 } }}>
        {/* 图标和基本信息 */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          {/* 流派首字图标 */}
          <Avatar
            alt={school.name}
            sx={{
              width: 36,
              height: 36,
              mr: 1,
              backgroundColor: school.color || 'var(--color-primary)',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '1rem',
            }}
          >
            {firstChar}
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            {/* 名称 */}
            <Typography
              variant="subtitle2"
              component="h3"
              sx={{
                fontWeight: 'bold',
                color: 'var(--color-text-primary)',
                fontSize: '0.9rem',
                lineHeight: 1.2,
              }}
            >
              {school.name}
              <Typography
                component="span"
                sx={{
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.7rem',
                  ml: 0.5,
                }}
              >
                {school.name_en}
              </Typography>
            </Typography>
            
            {/* 创始人和时期 */}
            <Typography
              variant="caption"
              sx={{
                color: 'var(--color-text-secondary)',
                fontSize: '0.7rem',
              }}
            >
              {school.founder} · {school.foundingPeriod}
            </Typography>
          </Box>
        </Box>

        {/* 核心思想标签 */}
        <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
          {school.coreIdeas.slice(0, 5).map((idea, index) => (
            <Chip
              key={index}
              label={idea}
              size="small"
              sx={{
                fontSize: '0.6rem',
                height: '18px',
                backgroundColor: `${school.color}15` || 'rgba(158, 158, 158, 0.1)',
                color: school.color || 'var(--color-text-secondary)',
                '& .MuiChip-label': { px: 0.75 },
              }}
            />
          ))}
          {school.coreIdeas.length > 5 && (
            <Chip
              label={`+${school.coreIdeas.length - 5}`}
              size="small"
              sx={{
                fontSize: '0.6rem',
                height: '18px',
                backgroundColor: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-secondary)',
                '& .MuiChip-label': { px: 0.75 },
              }}
            />
          )}
        </Box>

        {/* 简介（截断显示） */}
        <Typography
          variant="body2"
          sx={{
            color: 'var(--color-text-secondary)',
            lineHeight: 1.5,
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: '0.75rem',
          }}
        >
          {school.description}
        </Typography>

        {/* 代表人物数量 */}
        <Typography
          variant="caption"
          sx={{
            color: 'var(--color-text-secondary)',
            fontSize: '0.65rem',
            mt: 0.5,
          }}
        >
          {school.representativeFigures.length}位代表 · {school.classicWorks.length}部著作
        </Typography>
      </CardContent>
    </ResponsiveCard>
  );
}

export default SchoolCard;
