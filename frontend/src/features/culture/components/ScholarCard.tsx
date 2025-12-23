/**
 * 学者卡片组件
 * Scholar Card Component
 * 
 * 显示学者基本信息：姓名、朝代、简介
 * 
 * Requirements: 3.1, 3.2, 3.3
 */

import { PersonCard, type TagColor } from '@/components/common';
import type { Scholar } from '@/services/scholar/types';

interface ScholarCardProps {
  scholar: Scholar;
  onClick: () => void;
}

/**
 * 朝代颜色映射
 */
const dynastyColors: Record<string, TagColor> = {
  '唐代': { bg: 'rgba(156, 39, 176, 0.15)', text: '#9c27b0' },
  '宋代': { bg: 'rgba(33, 150, 243, 0.15)', text: '#2196f3' },
};

const defaultColor: TagColor = { bg: 'rgba(158, 158, 158, 0.15)', text: '#9e9e9e' };

/**
 * 学者卡片组件
 */
export function ScholarCard({ scholar, onClick }: ScholarCardProps) {
  const dynastyColor = dynastyColors[scholar.dynasty] || defaultColor;

  // 构建次标签
  const secondaryTags = [
    { label: scholar.schoolOfThought, color: defaultColor, variant: 'outlined' as const },
    { label: `${scholar.birthYear}-${scholar.deathYear}`, color: defaultColor, variant: 'outlined' as const },
  ];

  // 构建信息行（代表作品数量）
  const infoLines = scholar.representativeWorks && scholar.representativeWorks.length > 0
    ? [{ value: `代表作品: ${scholar.representativeWorks.length}篇` }]
    : [];

  return (
    <PersonCard
      name={scholar.name}
      subtitle={scholar.name_en}
      portraitUrl={scholar.portraitUrl}
      primaryTag={{ label: scholar.dynasty, color: dynastyColor }}
      secondaryTags={secondaryTags}
      infoLines={infoLines}
      biography={scholar.biography}
      biographyLines={3}
      onClick={onClick}
      minHeight={180}
    />
  );
}

export default ScholarCard;
