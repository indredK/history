/**
 * 清朝时期 → 主题色映射
 */

export type PeriodColor = { bg: string; text: string };

export const PERIOD_COLORS: Record<string, PeriodColor> = {
  '清初（1616-1722）': { bg: 'rgba(255, 235, 59, 0.15)', text: '#F9A825' },
  '盛清（1723-1795）': { bg: 'rgba(255, 193, 7, 0.15)', text: '#FFA000' },
  '清中期（1796-1861）': { bg: 'rgba(255, 152, 0, 0.15)', text: '#FF9800' },
  '晚清（1862-1912）': { bg: 'rgba(121, 85, 72, 0.15)', text: '#795548' },
};

export const DEFAULT_PERIOD_COLOR: PeriodColor = {
  bg: 'rgba(158, 158, 158, 0.15)',
  text: '#9e9e9e',
};

/**
 * 根据在位起始年份返回清朝时期标签
 */
export function getPeriod(reignStart: number): string {
  if (reignStart >= 1616 && reignStart <= 1722) return '清初（1616-1722）';
  if (reignStart >= 1723 && reignStart <= 1795) return '盛清（1723-1795）';
  if (reignStart >= 1796 && reignStart <= 1861) return '清中期（1796-1861）';
  if (reignStart >= 1862 && reignStart <= 1912) return '晚清（1862-1912）';
  return '其他';
}
