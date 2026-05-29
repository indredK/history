/**
 * 宋朝人物卡片组件
 */

import type { TagColor } from '@/components/common';
import type { SongFigure } from '@/services/person/song/types';
import { ROLE_LABELS } from '@/services/person/song/types';
import { songFigureService } from '@/services/person/song';
import { DynastyFigureCard } from '../common';

interface SongFigureCardProps {
  figure: SongFigure;
  onClick: () => void;
}

const roleColors: Record<string, TagColor> = {
  emperor: { bg: 'rgba(244, 67, 54, 0.15)', text: '#F44336' },
  chancellor: { bg: 'rgba(156, 39, 176, 0.15)', text: '#9c27b0' },
  general: { bg: 'rgba(33, 150, 243, 0.15)', text: '#2196f3' },
  official: { bg: 'rgba(76, 175, 80, 0.15)', text: '#4caf50' },
  scholar: { bg: 'rgba(255, 152, 0, 0.15)', text: '#ff9800' },
  other: { bg: 'rgba(158, 158, 158, 0.15)', text: '#9e9e9e' },
};

export function SongFigureCard({ figure, onClick }: SongFigureCardProps) {
  return (
    <DynastyFigureCard
      figure={figure}
      onClick={onClick}
      roleColors={roleColors}
      roleLabels={ROLE_LABELS}
      formatLifespan={(f) => songFigureService.formatLifespan(f)}
    />
  );
}

export default SongFigureCard;
