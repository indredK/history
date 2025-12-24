/**
 * 帝王卡片组件
 * Emperor Card Component
 * 
 * 显示帝王基本信息：姓名、朝代、在位时间、年号
 * 
 * Requirements: 2.2
 */

import { PersonCard, type TagColor } from '@/components/common';
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
  '上古': { bg: 'rgba(139, 69, 19, 0.15)', text: '#8B4513' },
  '夏': { bg: 'rgba(139, 90, 43, 0.15)', text: '#8B5A2B' },
  '商': { bg: 'rgba(160, 82, 45, 0.15)', text: '#A0522D' },
  '西周': { bg: 'rgba(184, 134, 11, 0.15)', text: '#B8860B' },
  '东周': { bg: 'rgba(218, 165, 32, 0.15)', text: '#DAA520' },
  '秦': { bg: 'rgba(0, 0, 0, 0.15)', text: '#333333' },
  '西汉': { bg: 'rgba(220, 20, 60, 0.15)', text: '#DC143C' },
  '新': { bg: 'rgba(178, 34, 34, 0.15)', text: '#B22222' },
  '东汉': { bg: 'rgba(139, 0, 0, 0.15)', text: '#8B0000' },
  '三国': { bg: 'rgba(255, 140, 0, 0.15)', text: '#FF8C00' },
  '西晋': { bg: 'rgba(255, 215, 0, 0.15)', text: '#DAA520' },
  '东晋': { bg: 'rgba(238, 232, 170, 0.15)', text: '#BDB76B' },
  '南北朝': { bg: 'rgba(144, 238, 144, 0.15)', text: '#228B22' },
  '隋': { bg: 'rgba(0, 128, 128, 0.15)', text: '#008080' },
  '唐': { bg: 'rgba(156, 39, 176, 0.15)', text: '#9c27b0' },
  '五代十国': { bg: 'rgba(128, 128, 128, 0.15)', text: '#696969' },
  '北宋': { bg: 'rgba(33, 150, 243, 0.15)', text: '#2196f3' },
  '南宋': { bg: 'rgba(30, 136, 229, 0.15)', text: '#1E88E5' },
  '辽': { bg: 'rgba(121, 85, 72, 0.15)', text: '#795548' },
  '金': { bg: 'rgba(255, 193, 7, 0.15)', text: '#FFA000' },
  '元': { bg: 'rgba(63, 81, 181, 0.15)', text: '#3F51B5' },
  '明': { bg: 'rgba(244, 67, 54, 0.15)', text: '#F44336' },
  '清': { bg: 'rgba(255, 235, 59, 0.15)', text: '#F9A825' },
};

const defaultColor: TagColor = { bg: 'rgba(158, 158, 158, 0.15)', text: '#9e9e9e' };

/**
 * 帝王卡片组件
 * Requirements 2.2: 显示基本信息
 */
export function EmperorCard({ emperor, onClick }: EmperorCardProps) {
  const dynastyColor = dynastyColors[emperor.dynasty] || defaultColor;
  const reignPeriod = emperorService.formatReignPeriod(emperor);
  const eraNames = emperorService.formatEraNames(emperor);

  // 构建次标签
  const secondaryTags = emperor.eraNames.length > 0 && emperor.eraNames[0]
    ? [{ label: emperor.eraNames[0].name, color: defaultColor, variant: 'outlined' as const }]
    : [];

  // 构建信息行
  const infoLines = [
    { label: '在位：', value: reignPeriod },
    ...(emperor.eraNames.length > 0 ? [{ label: '年号：', value: eraNames, truncate: true }] : []),
  ];

  return (
    <PersonCard
      name={emperor.name}
      subtitle={emperor.templeName}
      portraitUrl={emperor.portraitUrl}
      primaryTag={{ label: emperor.dynasty, color: dynastyColor }}
      secondaryTags={secondaryTags}
      infoLines={infoLines}
      biography={emperor.biography}
      onClick={onClick}
    />
  );
}

export default EmperorCard;
