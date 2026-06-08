/**
 * 帝王卡片组件
 * Emperor Card Component
 * 
 * 显示帝王基本信息：姓名、朝代、在位时间、年号
 * 
 * Requirements: 2.2
 */

import { PersonCard, DEFAULT_TAG_COLOR } from '@/components/common';
import type { TagColor } from '@/components/common';
import type { Emperor } from '@/services/person/emperors/types';
import { emperorService } from '@/services/person/emperors';

interface EmperorCardProps {
  emperor: Emperor;
  onClick: () => void;
}

/**
 * 朝代颜色映射
 */
const dynastyColors: Record<string, TagColor> = {
  '上古': { bg: 'rgba(139, 69, 19, 0.15)', text: 'var(--color-primary-dark)' },
  '夏': { bg: 'rgba(139, 90, 43, 0.15)', text: 'var(--color-primary-dark)' },
  '商': { bg: 'rgba(160, 82, 45, 0.15)', text: 'var(--color-primary-dark)' },
  '西周': { bg: 'rgba(184, 134, 11, 0.15)', text: 'var(--color-warning)' },
  '东周': { bg: 'rgba(218, 165, 32, 0.15)', text: 'var(--color-accent)' },
  '秦': { bg: 'rgba(0, 0, 0, 0.15)', text: 'var(--color-gray-800)' },
  '西汉': { bg: 'rgba(220, 20, 60, 0.15)', text: 'var(--color-error)' },
  '新': { bg: 'rgba(178, 34, 34, 0.15)', text: 'var(--color-error)' },
  '东汉': { bg: 'rgba(139, 0, 0, 0.15)', text: 'var(--color-error)' },
  '三国': { bg: 'rgba(255, 140, 0, 0.15)', text: 'var(--color-warning)' },
  '西晋': { bg: 'rgba(255, 215, 0, 0.15)', text: 'var(--color-accent)' },
  '东晋': { bg: 'rgba(238, 232, 170, 0.15)', text: 'var(--color-gray-400)' },
  '南北朝': { bg: 'rgba(144, 238, 144, 0.15)', text: 'var(--color-success)' },
  '隋': { bg: 'rgba(0, 128, 128, 0.15)', text: 'var(--color-info)' },
  '唐': { bg: 'rgba(156, 39, 176, 0.15)', text: '#9c27b0' },
  '五代十国': { bg: 'rgba(128, 128, 128, 0.15)', text: 'var(--color-gray-600)' },
  '北宋': { bg: 'rgba(33, 150, 243, 0.15)', text: '#2196f3' },
  '南宋': { bg: 'rgba(30, 136, 229, 0.15)', text: 'var(--color-info)' },
  '辽': { bg: 'rgba(121, 85, 72, 0.15)', text: 'var(--color-primary-dark)' },
  '金': { bg: 'rgba(255, 193, 7, 0.15)', text: 'var(--color-warning)' },
  '元': { bg: 'rgba(63, 81, 181, 0.15)', text: 'var(--color-info)' },
  '明': { bg: 'rgba(244, 67, 54, 0.15)', text: '#F44336' },
  '清': { bg: 'rgba(255, 235, 59, 0.15)', text: 'var(--color-warning)' },
};

/**
 * 帝王卡片组件
 * Requirements 2.2: 显示基本信息
 */
export function EmperorCard({ emperor, onClick }: EmperorCardProps) {
  const dynastyColor = dynastyColors[emperor.dynasty] || DEFAULT_TAG_COLOR;
  const reignPeriod = emperorService.formatReignPeriod(emperor);
  const eraNames = emperorService.formatEraNames(emperor);

  // 构建次标签
  const secondaryTags = emperor.eraNames.length > 0 && emperor.eraNames[0]
    ? [{ label: emperor.eraNames[0].name, color: DEFAULT_TAG_COLOR, variant: 'outlined' as const }]
    : [];

  // 构建信息行
  const infoLines = [
    { label: '在位：', value: reignPeriod },
    ...(emperor.eraNames.length > 0 ? [{ label: '年号：', value: eraNames, truncate: true }] : []),
  ];

  return (
    <PersonCard
      name={emperor.name}
      subtitle={emperor.templeName ?? undefined}
      portraitUrl={emperor.portraitUrl ?? undefined}
      primaryTag={{ label: emperor.dynasty, color: dynastyColor }}
      secondaryTags={secondaryTags}
      infoLines={infoLines}
      biography={emperor.biography ?? undefined}
      onClick={onClick}
    />
  );
}

export default EmperorCard;
