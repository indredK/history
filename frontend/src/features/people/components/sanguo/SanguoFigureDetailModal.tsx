/**
 * 三国人物详情弹窗组件
 *
 * 与其他朝代不同:主题色按 kingdom (魏/蜀/吴) 划分,而非按 role
 */

import { Chip } from '@mui/material';
import {
  BaseFigureDetailModal,
  formatLifespan,
  calculateAge,
  type ThemeColor,
} from '@/features/people/components/common/BaseFigureDetailModal';
import type { SanguoFigure } from '@/services/person/sanguo/types';
import { ROLE_LABELS, KINGDOM_LABELS, KINGDOM_COLORS } from '@/services/person/sanguo/types';

interface SanguoFigureDetailModalProps {
  figure: SanguoFigure | null;
  open: boolean;
  onClose: () => void;
}

const roleColors: Record<string, ThemeColor> = {
  ruler: { bg: 'rgba(244, 67, 54, 0.15)', text: '#F44336' },
  strategist: { bg: 'rgba(156, 39, 176, 0.15)', text: '#9c27b0' },
  general: { bg: 'rgba(33, 150, 243, 0.15)', text: '#2196f3' },
  official: { bg: 'rgba(76, 175, 80, 0.15)', text: '#4caf50' },
  other: { bg: 'rgba(158, 158, 158, 0.15)', text: '#9e9e9e' },
};

export function SanguoFigureDetailModal({ figure, open, onClose }: SanguoFigureDetailModalProps) {
  if (!figure) return null;

  const kingdomColor = KINGDOM_COLORS[figure.kingdom] || KINGDOM_COLORS['其他']!;
  const roleColor = roleColors[figure.role] ?? roleColors.other!;
  const lifespan = formatLifespan(figure);
  const age = calculateAge(figure);
  const roleLabel = ROLE_LABELS[figure.role];
  const kingdomLabel = KINGDOM_LABELS[figure.kingdom];

  const headerChips = (
    <>
      <Chip label={kingdomLabel} size="small" sx={{ backgroundColor: kingdomColor.bg, color: kingdomColor.text, fontWeight: 500 }} />
      <Chip label={roleLabel} size="small" sx={{ backgroundColor: roleColor.bg, color: roleColor.text, fontWeight: 500 }} />
      <Chip label={`${lifespan}（享年${age}岁）`} size="small" variant="outlined" sx={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }} />
    </>
  );

  return (
    <BaseFigureDetailModal
      figure={figure}
      open={open}
      onClose={onClose}
      themeColor={kingdomColor}
      headerChips={headerChips}
      ariaIdPrefix="sanguo"
    />
  );
}

export default SanguoFigureDetailModal;
