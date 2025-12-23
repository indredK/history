/**
 * 通用人物卡片组件
 * Generic Person Card Component
 * 
 * 可复用的人物信息展示卡片，支持：
 * - 头像（图片或首字母）
 * - 姓名和副标题
 * - 主标签和次标签
 * - 多行信息展示
 * - 简介预览
 */

import { Card, CardContent, Box, Typography, Chip, Avatar } from '@mui/material';

/**
 * 颜色配置
 */
export interface TagColor {
  bg: string;
  text: string;
}

/**
 * 标签配置
 */
export interface TagConfig {
  label: string;
  color: TagColor;
  variant?: 'filled' | 'outlined';
}

/**
 * 信息行配置
 */
export interface InfoLine {
  label?: string;      // 可选的标签前缀，如 "在位："
  value: string;
  truncate?: boolean;  // 是否截断
}

/**
 * PersonCard 组件属性
 */
export interface PersonCardProps {
  /** 姓名 */
  name: string;
  /** 副标题（庙号、字、称号等） */
  subtitle?: string | undefined;
  /** 头像URL */
  portraitUrl?: string | undefined;
  /** 主标签（朝代、角色、时期等） */
  primaryTag: TagConfig;
  /** 次标签列表（年号、派系等） */
  secondaryTags?: TagConfig[] | undefined;
  /** 信息行列表 */
  infoLines?: InfoLine[] | undefined;
  /** 简介文本 */
  biography?: string | undefined;
  /** 简介显示行数，默认2行 */
  biographyLines?: number | undefined;
  /** 点击回调 */
  onClick: () => void;
  /** 卡片最小高度 */
  minHeight?: number | string | undefined;
  /** 自定义头像背景色 */
  avatarColor?: TagColor | undefined;
}

const defaultColor: TagColor = {
  bg: 'rgba(158, 158, 158, 0.15)',
  text: '#9e9e9e',
};

// Re-export for external use
export { defaultColor as DEFAULT_TAG_COLOR };

/**
 * 通用人物卡片组件
 */
export function PersonCard({
  name,
  subtitle,
  portraitUrl,
  primaryTag,
  secondaryTags = [],
  infoLines = [],
  biography,
  biographyLines = 2,
  onClick,
  minHeight = 200,
  avatarColor,
}: PersonCardProps) {
  const hasPortrait = portraitUrl && portraitUrl.trim() !== '';
  const firstChar = name.charAt(0);
  const borderColor = avatarColor?.text || primaryTag.color.text;
  const avatarBg = avatarColor || primaryTag.color;

  return (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        minHeight,
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        cursor: 'pointer',
        transition: 'all var(--transition-normal)',
        border: '1px solid transparent',
        '&:hover': {
          boxShadow: 'var(--shadow-lg)',
          transform: 'translateY(-4px)',
          borderColor,
        },
      }}
    >
      <CardContent sx={{ p: 2 }}>
        {/* 头像和姓名 */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
          <Avatar
            {...(hasPortrait ? { src: portraitUrl } : {})}
            alt={name}
            sx={{
              width: 56,
              height: 56,
              mr: 1.5,
              backgroundColor: avatarBg.bg,
              color: avatarBg.text,
              fontWeight: 'bold',
              fontSize: '1.5rem',
              border: `2px solid ${avatarBg.text}`,
              flexShrink: 0,
            }}
          >
            {!hasPortrait && firstChar}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontWeight: 'bold',
                color: 'var(--color-text-primary)',
                fontSize: '1.1rem',
                lineHeight: 1.3,
              }}
            >
              {name}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                sx={{
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.85rem',
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>

        {/* 标签区域 */}
        <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5, flexWrap: 'wrap' }}>
          <Chip
            label={primaryTag.label}
            size="small"
            variant={primaryTag.variant === 'outlined' ? 'outlined' : 'filled'}
            sx={{
              backgroundColor: primaryTag.variant === 'outlined' ? 'transparent' : primaryTag.color.bg,
              color: primaryTag.color.text,
              fontWeight: 500,
              fontSize: '0.75rem',
              ...(primaryTag.variant === 'outlined' && {
                borderColor: primaryTag.color.text,
              }),
            }}
          />
          {secondaryTags.map((tag, index) => (
            <Chip
              key={index}
              label={tag.label}
              size="small"
              variant={tag.variant === 'outlined' ? 'outlined' : 'filled'}
              sx={{
                fontSize: '0.75rem',
                ...(tag.variant === 'outlined' || !tag.color
                  ? {
                      borderColor: tag.color?.text || 'var(--color-border)',
                      color: tag.color?.text || 'var(--color-text-secondary)',
                      backgroundColor: 'transparent',
                    }
                  : {
                      backgroundColor: tag.color.bg,
                      color: tag.color.text,
                    }),
              }}
            />
          ))}
        </Box>

        {/* 信息行 */}
        {infoLines.map((line, index) => (
          <Typography
            key={index}
            variant="body2"
            sx={{
              color: 'var(--color-text-secondary)',
              fontSize: index === 0 ? '0.85rem' : '0.8rem',
              mb: index < infoLines.length - 1 ? 1 : 0,
              ...(line.truncate && {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }),
            }}
          >
            {line.label}{line.value}
          </Typography>
        ))}

        {/* 简介预览 */}
        {biography && (
          <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid var(--color-border)' }}>
            <Typography
              variant="body2"
              sx={{
                color: 'var(--color-text-secondary)',
                fontSize: '0.8rem',
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: biographyLines,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {biography}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default PersonCard;
