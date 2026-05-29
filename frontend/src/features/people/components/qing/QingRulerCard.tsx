/**
 * 清朝统治者卡片组件
 * Qing Ruler Card Component
 * 
 * 显示清朝统治者基本信息：姓名、庙号、年号、在位时间
 * 
 * Requirements: 4.2
 */

import { PersonCard, DEFAULT_TAG_COLOR } from '@/components/common';
import type { TagColor } from '@/components/common';
import type { QingRuler } from '@/services/person/qing/types';
import { qingRulerService } from '@/services/person/qing';

interface QingRulerCardProps {
  ruler: QingRuler;
  onClick: () => void;
}

/**
 * 清朝时期颜色映射
 */
const periodColors: Record<string, TagColor> = {
  '清初（1616-1722）': { bg: 'rgba(255, 235, 59, 0.15)', text: 'var(--color-warning)' },
  '盛清（1723-1795）': { bg: 'rgba(255, 193, 7, 0.15)', text: 'var(--color-warning)' },
  '清中期（1796-1861）': { bg: 'rgba(255, 152, 0, 0.15)', text: 'var(--color-warning)' },
  '晚清（1862-1912）': { bg: 'rgba(121, 85, 72, 0.15)', text: 'var(--color-primary-dark)' },
};

/**
 * 根据在位时间确定时期
 */
function getPeriod(reignStart: number): string {
  if (reignStart >= 1616 && reignStart <= 1722) return '清初（1616-1722）';
  if (reignStart >= 1723 && reignStart <= 1795) return '盛清（1723-1795）';
  if (reignStart >= 1796 && reignStart <= 1861) return '清中期（1796-1861）';
  if (reignStart >= 1862 && reignStart <= 1912) return '晚清（1862-1912）';
  return '其他';
}

/**
 * 清朝统治者卡片组件
 */
export function QingRulerCard({ ruler, onClick }: QingRulerCardProps) {
  const period = getPeriod(ruler.reignStart);
  const periodColor = periodColors[period] || DEFAULT_TAG_COLOR;
  const reignPeriod = qingRulerService.formatReignPeriod(ruler);
  const title = qingRulerService.getTitle(ruler);
  const reignYears = qingRulerService.calculateReignYears(ruler);

  // 构建信息行
  const infoLines = [
    { label: '在位：', value: reignPeriod },
    { value: `共 ${reignYears} 年` },
  ];

  return (
    <PersonCard
      name={ruler.name}
      subtitle={title}
      portraitUrl={ruler.portraitUrl}
      primaryTag={{ label: period, color: periodColor }}
      secondaryTags={[{ label: ruler.eraName, color: DEFAULT_TAG_COLOR, variant: 'outlined' as const }]}
      infoLines={infoLines}
      biography={ruler.biography}
      onClick={onClick}
    />
  );
}

export default QingRulerCard;
