/**
 * 明朝人物卡片组件
 */

import type { TagColor } from '@/components/common';
import type { MingFigure } from '@/services/person/ming/types';
import { ROLE_LABELS } from '@/services/person/ming/types';
import { mingFigureServiceHelper } from '@/services/person/ming';
import { DynastyFigureCard } from '../common';

interface MingFigureCardProps {
  figure: MingFigure;
  onClick: () => void;
}

const roleColors: Record<string, TagColor> = {
  emperor: { bg: 'rgba(244, 67, 54, 0.15)', text: '#F44336' },
  cabinet: { bg: 'rgba(156, 39, 176, 0.15)', text: '#9c27b0' },
  general: { bg: 'rgba(33, 150, 243, 0.15)', text: '#2196f3' },
  official: { bg: 'rgba(76, 175, 80, 0.15)', text: '#4caf50' },
  eunuch: { bg: 'rgba(255, 152, 0, 0.15)', text: '#ff9800' },
  other: { bg: 'rgba(158, 158, 158, 0.15)', text: '#9e9e9e' },
};

export function MingFigureCard({ figure, onClick }: MingFigureCardProps) {
  return (
    <DynastyFigureCard
      figure={figure}
      onClick={onClick}
      roleColors={roleColors}
      roleLabels={ROLE_LABELS}
      formatLifespan={(f) => mingFigureServiceHelper.formatLifespan(f)}
    />
  );
}

export default MingFigureCard;
