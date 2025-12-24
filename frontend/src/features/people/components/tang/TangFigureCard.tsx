/**
 * 唐朝人物卡片组件
 */

import { PersonCard, type TagColor } from '@/components/common';
import type { TangFigure } from '@/services/person/tang/types';
import { ROLE_LABELS } from '@/services/person/tang/types';
import { tangFigureService } from '@/services/person/tang';

interface TangFigureCardProps {
  figure: TangFigure;
  onClick: () => void;
}

const roleColors: Record<string, TagColor> = {
  emperor: { bg: 'rgba(244, 67, 54, 0.15)', text: '#F44336' },
  chancellor: { bg: 'rgba(156, 39, 176, 0.15)', text: '#9c27b0' },
  general: { bg: 'rgba(33, 150, 243, 0.15)', text: '#2196f3' },
  official: { bg: 'rgba(76, 175, 80, 0.15)', text: '#4caf50' },
  poet: { bg: 'rgba(255, 152, 0, 0.15)', text: '#ff9800' },
  other: { bg: 'rgba(158, 158, 158, 0.15)', text: '#9e9e9e' },
};

const defaultColor: TagColor = { bg: 'rgba(158, 158, 158, 0.15)', text: '#9e9e9e' };

export function TangFigureCard({ figure, onClick }: TangFigureCardProps) {
  const roleColor = roleColors[figure.role] || roleColors.other!;
  const lifespan = tangFigureService.formatLifespan(figure);
  const roleLabel = ROLE_LABELS[figure.role];

  const secondaryTags = figure.faction
    ? [{ label: figure.faction, color: defaultColor, variant: 'outlined' as const }]
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

export default TangFigureCard;
