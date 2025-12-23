/**
 * 通用内容卡片组件
 * Generic Content Card Component
 * 
 * 适用于无头像的内容展示卡片，如：
 * - 思想流派
 * - 神话故事
 * - 文章/概念类内容
 * 
 * 支持：
 * - 标题和副标题
 * - 图标（可选，首字母或自定义）
 * - 主标签和多个次标签
 * - 描述文本
 * - 底部信息/统计
 * - 标签云（如核心思想）
 */

import { Card, CardContent, Box, Typography, Chip, Avatar } from '@mui/material';

/**
 * 颜色配置
 */
export interface ContentTagColor {
  bg: string;
  text: string;
}

/**
 * 标签配置
 */
export interface ContentTagConfig {
  label: string;
  color?: ContentTagColor;
  variant?: 'filled' | 'outlined';
}

/**
 * ContentCard 组件属性
 */
export interface ContentCardProps {
  /** 标题 */
  title: string;
  /** 副标题 */
  subtitle?: string | undefined;
  /** 图标配置（可选） */
  icon?: {
    char: string;
    color?: string;
    bgColor?: string;
  } | undefined;
  /** 主标签 */
  primaryTag?: ContentTagConfig | undefined;
  /** 标签云（如核心思想） */
  tagCloud?: ContentTagConfig[] | undefined;
  /** 标签云最大显示数量 */
  tagCloudMax?: number | undefined;
  /** 描述文本 */
  description?: string | undefined;
  /** 描述显示行数，默认2行 */
  descriptionLines?: number | undefined;
  /** 底部信息文本 */
  footerText?: string | undefined;
  /** 底部标签列表（如相关人物） */
  footerTags?: ContentTagConfig[] | undefined;
  /** 底部标签最大显示数量 */
  footerTagsMax?: number | undefined;
  /** 点击回调 */
  onClick: () => void;
  /** 卡片最小高度 */
  minHeight?: number | string | undefined;
  /** 是否使用玻璃效果 */
  glassEffect?: boolean | undefined;
}

const defaultColor: ContentTagColor = {
  bg: 'rgba(158, 158, 158, 0.15)',
  text: '#9e9e9e',
};

/**
 * 通用内容卡片组件
 */
export function ContentCard({
  title,
  subtitle,
  icon,
  primaryTag,
  tagCloud = [],
  tagCloudMax = 5,
  description,
  descriptionLines = 2,
  footerText,
  footerTags = [],
  footerTagsMax = 3,
  onClick,
  minHeight = 140,
  glassEffect = true,
}: ContentCardProps) {
  const visibleTagCloud = tagCloud.slice(0, tagCloudMax);
  const remainingTagCloud = tagCloud.length - tagCloudMax;
  const visibleFooterTags = footerTags.slice(0, footerTagsMax);
  const remainingFooterTags = footerTags.length - footerTagsMax;

  return (
    <Card
      onClick={onClick}
      role="article"
      aria-label={title}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      sx={{
        height: '100%',
        minHeight,
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        background: glassEffect ? 'var(--color-bg-card)' : undefined,
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid transparent',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: 'var(--shadow-lg)',
          borderColor: primaryTag?.color?.text || icon?.color || 'var(--color-primary)',
        },
        '&:focus-visible': {
          outline: '2px solid var(--color-primary)',
          outlineOffset: '2px',
        },
      }}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 1.5, '&:last-child': { pb: 1.5 } }}>
        {/* 头部：图标 + 标题 */}
        <Box sx={{ display: 'flex', alignItems: icon ? 'center' : 'flex-start', mb: 1 }}>
          {icon && (
            <Avatar
              sx={{
                width: 36,
                height: 36,
                mr: 1,
                backgroundColor: icon.bgColor || icon.color || 'var(--color-primary)',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '1rem',
              }}
            >
              {icon.char}
            </Avatar>
          )}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle1"
              component="h3"
              sx={{
                fontWeight: 'bold',
                color: 'var(--color-text-primary)',
                fontSize: icon ? '0.9rem' : '0.95rem',
                lineHeight: 1.3,
              }}
            >
              {title}
              {subtitle && (
                <Typography
                  component="span"
                  sx={{
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.7rem',
                    ml: 0.5,
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Typography>
            {/* 主标签（无图标时显示在标题下方） */}
            {!icon && primaryTag && (
              <Chip
                label={primaryTag.label}
                size="small"
                sx={{
                  mt: 0.5,
                  backgroundColor: primaryTag.color?.bg || defaultColor.bg,
                  color: primaryTag.color?.text || defaultColor.text,
                  fontWeight: 500,
                  fontSize: '0.65rem',
                  height: '20px',
                }}
              />
            )}
          </Box>
        </Box>

        {/* 图标模式下的副标题行 */}
        {icon && subtitle && (
          <Typography
            variant="caption"
            sx={{
              color: 'var(--color-text-secondary)',
              fontSize: '0.7rem',
              mb: 1,
              mt: -0.5,
              ml: 5.5,
            }}
          >
            {subtitle}
          </Typography>
        )}

        {/* 标签云 */}
        {tagCloud.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
            {visibleTagCloud.map((tag, index) => (
              <Chip
                key={index}
                label={tag.label}
                size="small"
                sx={{
                  fontSize: '0.6rem',
                  height: '18px',
                  backgroundColor: tag.color?.bg || defaultColor.bg,
                  color: tag.color?.text || defaultColor.text,
                  '& .MuiChip-label': { px: 0.75 },
                }}
              />
            ))}
            {remainingTagCloud > 0 && (
              <Chip
                label={`+${remainingTagCloud}`}
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
        )}

        {/* 描述 */}
        {description && (
          <Typography
            variant="body2"
            sx={{
              color: 'var(--color-text-secondary)',
              lineHeight: 1.5,
              flex: 1,
              display: '-webkit-box',
              WebkitLineClamp: descriptionLines,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: '0.8rem',
            }}
          >
            {description}
          </Typography>
        )}

        {/* 底部标签 */}
        {footerTags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
            {visibleFooterTags.map((tag, index) => (
              <Chip
                key={index}
                label={tag.label}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: '0.65rem',
                  height: '20px',
                  borderColor: tag.color?.text || 'var(--color-border)',
                  color: tag.color?.text || 'var(--color-text-secondary)',
                }}
              />
            ))}
            {remainingFooterTags > 0 && (
              <Chip
                label={`+${remainingFooterTags}`}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: '0.65rem',
                  height: '20px',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-secondary)',
                }}
              />
            )}
          </Box>
        )}

        {/* 底部文本 */}
        {footerText && (
          <Typography
            variant="caption"
            sx={{
              color: 'var(--color-text-secondary)',
              fontSize: '0.65rem',
              mt: footerTags.length > 0 ? 0.5 : 1,
            }}
          >
            {footerText}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default ContentCard;
