/**
 * 通用朝代人物卡片组件
 *
 * 统一唐/宋/明三个朝代的人物卡片渲染逻辑，
 * 各朝代仅需提供角色颜色映射和人物数据即可。
 */

import { PersonCard, type TagColor } from '@/components/common';

/** 公共默认标签颜色 */
export const DEFAULT_TAG_COLOR: TagColor = { bg: 'rgba(158, 158, 158, 0.15)', text: '#9e9e9e' };

/** 通用人物数据接口 —— 各朝代人物类型需满足此约束 */
export interface DynastyFigureData {
  name: string;
  courtesy?: string;
  portraitUrl?: string;
  role: string;
  faction?: string;
  positions: string[];
  biography?: string;
}

export interface DynastyFigureCardProps<T extends DynastyFigureData> {
  /** 人物数据 */
  figure: T;
  /** 点击回调 */
  onClick: () => void;
  /** 角色颜色映射表 */
  roleColors: Record<string, TagColor>;
  /** 角色标签映射表 */
  roleLabels: Record<string, string>;
  /** 格式化生卒年 */
  formatLifespan: (figure: T) => string;
}

export function DynastyFigureCard<T extends DynastyFigureData>({
  figure,
  onClick,
  roleColors,
  roleLabels,
  formatLifespan,
}: DynastyFigureCardProps<T>) {
  const roleColor = roleColors[figure.role] || DEFAULT_TAG_COLOR;
  const lifespan = formatLifespan(figure);
  const roleLabel = roleLabels[figure.role];

  const secondaryTags = figure.faction
    ? [{ label: figure.faction, color: DEFAULT_TAG_COLOR, variant: 'outlined' as const }]
    : [];

  const infoLines = [
    { value: lifespan },
    ...(figure.positions.length > 0
      ? [{ value: figure.positions.slice(0, 2).join('、') + (figure.positions.length > 2 ? '...' : ''), truncate: true }]
      : []),
  ];

  return (
    <PersonCard
      name={figure.name}
      subtitle={figure.courtesy ? `字 ${figure.courtesy}` : undefined}
      portraitUrl={figure.portraitUrl}
      primaryTag={{ label: roleLabel, color: roleColor }}
      secondaryTags={secondaryTags}
      infoLines={infoLines}
      biography={figure.biography}
      onClick={onClick}
    />
  );
}

export default DynastyFigureCard;
