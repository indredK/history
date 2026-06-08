/**
 * 学者卡片组件
 * Scholar Card Component
 * 
 * 显示学者基本信息：姓名、朝代、简介
 * 
 * Requirements: 3.1, 3.2, 3.3
 */

import { PersonCard, type TagColor } from '@/components/common';
import type { Scholar } from '@/services/person/scholars/types';
import { formatScholarLifespan } from './scholarYearFormat';

interface ScholarCardProps {
  scholar: Scholar;
  onClick: () => void;
}

/**
 * 朝代颜色映射
 */
const dynastyColors: Record<string, TagColor> = {
  '春秋': { bg: 'rgba(46, 125, 50, 0.15)', text: '#2e7d32' },
  '春秋时期': { bg: 'rgba(46, 125, 50, 0.15)', text: '#2e7d32' },
  '战国': { bg: 'rgba(217, 119, 6, 0.15)', text: '#b45309' },
  '战国时期': { bg: 'rgba(217, 119, 6, 0.15)', text: '#b45309' },
  '秦代': { bg: 'rgba(97, 97, 97, 0.15)', text: '#616161' },
  '汉代': { bg: 'rgba(21, 101, 192, 0.15)', text: '#1565c0' },
  '唐代': { bg: 'rgba(156, 39, 176, 0.15)', text: '#9c27b0' },
  '宋代': { bg: 'rgba(33, 150, 243, 0.15)', text: '#2196f3' },
  '明代': { bg: 'rgba(198, 40, 40, 0.15)', text: '#c62828' },
  '清代': { bg: 'rgba(0, 105, 92, 0.15)', text: '#00695c' },
};

const defaultColor: TagColor = { bg: 'rgba(158, 158, 158, 0.15)', text: '#9e9e9e' };

/**
 * 学者卡片组件
 */
export function ScholarCard({ scholar, onClick }: ScholarCardProps) {
  const dynasty = scholar.dynasty || scholar.dynastyPeriod || '未知朝代';
  const dynastyColor = dynastyColors[dynasty] || defaultColor;
  const lifespan = formatScholarLifespan(scholar.birthYear, scholar.deathYear);

  // 构建次标签
  const secondaryTags = [
    scholar.schoolOfThought && { label: scholar.schoolOfThought, color: defaultColor, variant: 'outlined' as const },
    lifespan && {
      label: lifespan,
      color: defaultColor, 
      variant: 'outlined' as const 
    },
  ].filter((tag): tag is { label: string; color: TagColor; variant: 'outlined' } => Boolean(tag));

  // 构建信息行（代表作品数量）
  const works = scholar.representativeWorks || [];
  const majorWorks = scholar.majorWorks || [];
  const totalWorks = works.length + majorWorks.length;
  
  const infoLines = totalWorks > 0
    ? [{ value: `代表作品: ${totalWorks}篇` }]
    : [];

  return (
    <PersonCard
      name={scholar.name}
      subtitle={scholar.name_en || ''}
      portraitUrl={scholar.portraitUrl ?? undefined}
      primaryTag={{ label: dynasty, color: dynastyColor }}
      secondaryTags={secondaryTags}
      infoLines={infoLines}
      biography={scholar.biography || ''}
      biographyLines={3}
      onClick={onClick}
      minHeight={180}
    />
  );
}

export default ScholarCard;
