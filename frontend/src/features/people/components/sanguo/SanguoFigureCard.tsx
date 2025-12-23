/**
 * 三国人物卡片组件
 */

import { PersonCard, type TagColor } from '@/components/common';
import type { SanguoFigure } from '@/services/sanguoFigure/types';
import { ROLE_LABELS, KINGDOM_COLORS } from '@/services/sanguoFigure/types';
import { sanguoFigureService } from '@/services/sanguoFigure';

interface SanguoFigureCardProps {
  figure: SanguoFigure;
  onClick: () => void;
}

const roleColors: Record<string, TagColor> = {
  ruler: { bg: 'rgba(244, 67, 54, 0.15)', text: '#F44336' },
  strategist: { bg: 'rgba(156, 39, 176, 0.15)', text: '#9c27b0' },
  general: { bg: 'rgba(33, 150, 243, 0.15)', text: '#2196f3' },
  official: { bg: 'rgba(76, 175, 80, 0.15)', text: '#4caf50' },
  other: { bg: 'rgba(158, 158, 158, 0.15)', text: '#9e9e9e' },
};

export function SanguoFigureCard({ figure, onClick }: SanguoFigureCardProps) {
  const roleColor = roleColors[figure.role] || roleColors.other!;
  const kingdomColor = KINGDOM_COLORS[figure.kingdom] || KINGDOM_COLORS['其他'];
  const lifespan = sanguoFigureService.formatLifespan(figure);
  const roleLabel = ROLE_LABELS[figure.role];

  const secondaryTags = [
    { label: figure.kingdom, color: kingdomColor as TagColor, variant: 'outlined' as const }
  ];

  const infoLines = [
    { value: lifespan },
    ...(figure.positions.length > 0
      ? [{
          value: figure.positions.slice(0, 2).join('、') + (figure.positions.length > 2 ? '...' : ''),
          truncate: true,
        }]
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

export default SanguoFigureCard;
