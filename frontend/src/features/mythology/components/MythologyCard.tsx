/**
 * 神话卡片组件
 * Mythology Card Component
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7
 */

import { IconButton, Tooltip } from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { ContentCard, type ContentTagColor } from '@/components/common';
import type { Mythology } from '@/services/mythology';
import { getCardHeight } from '@/config/responsive';

interface MythologyCardProps {
  mythology: Mythology;
  onClick: (mythology: Mythology) => void;
  onEdit: (mythology: Mythology) => void;
  onDelete: (mythology: Mythology) => void;
}

/**
 * 分类颜色映射
 */
const categoryColors: Record<string, ContentTagColor> = {
  '创世神话': { bg: 'rgba(156, 39, 176, 0.15)', text: 'var(--color-purple)' },
  '英雄神话': { bg: 'rgba(244, 67, 54, 0.15)', text: 'var(--color-error)' },
  '自然神话': { bg: 'rgba(76, 175, 80, 0.15)', text: 'var(--color-success)' },
  '爱情神话': { bg: 'rgba(233, 30, 99, 0.15)', text: 'var(--color-error)' },
  '神仙传说': { bg: 'rgba(33, 150, 243, 0.15)', text: 'var(--color-info)' },
  '民间传说': { bg: 'rgba(255, 152, 0, 0.15)', text: 'var(--color-warning)' },
};

const defaultColor: ContentTagColor = { bg: 'rgba(158, 158, 158, 0.15)', text: 'var(--color-gray-500)' };

/**
 * 神话卡片组件
 */
export function MythologyCard({
  mythology,
  onClick,
  onEdit,
  onDelete,
}: MythologyCardProps) {
  const categoryColor = categoryColors[mythology.category] || defaultColor;

  // 相关人物标签
  const footerTags = mythology.characters?.map(char => ({
    label: char,
    color: defaultColor,
  })) || [];

  return (
    <ContentCard
      title={mythology.title}
      primaryTag={{ label: mythology.category, color: categoryColor }}
      description={mythology.description}
      descriptionLines={3}
      footerTags={footerTags}
      footerTagsMax={3}
      footerText={[mythology.period, mythology.source].filter(Boolean).join(' / ')}
      actions={
        <>
          <Tooltip title="编辑">
            <IconButton
              size="small"
              aria-label={`编辑${mythology.title}`}
              onClick={(event) => {
                event.stopPropagation();
                onEdit(mythology);
              }}
              sx={{ color: 'var(--color-text-secondary)' }}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="删除">
            <IconButton
              size="small"
              aria-label={`删除${mythology.title}`}
              onClick={(event) => {
                event.stopPropagation();
                onDelete(mythology);
              }}
              sx={{ color: 'var(--color-text-secondary)' }}
            >
              <DeleteOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      }
      onClick={() => onClick(mythology)}
      minHeight={getCardHeight('content')}
    />
  );
}

export default MythologyCard;
