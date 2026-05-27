/**
 * 唐朝人物详情弹窗组件
 *
 * 实际渲染走通用 BaseFigureDetailModal,本文件只负责装配唐朝特有的:
 * - 主题色 (按 role 映射)
 * - 头部 Chip 组 (角色 + 寿命 + 派系)
 */

import { Chip } from '@mui/material';
import {
  BaseFigureDetailModal,
  formatLifespan,
  calculateAge,
  type ThemeColor,
} from '@/features/people/components/common/BaseFigureDetailModal';
import type { TangFigure } from '@/services/person/tang/types';
import { ROLE_LABELS } from '@/services/person/tang/types';

interface TangFigureDetailModalProps {
  figure: TangFigure | null;
  open: boolean;
  onClose: () => void;
}

const roleColors: Record<string, ThemeColor> = {
  emperor: { bg: 'rgba(244, 67, 54, 0.15)', text: '#F44336' },
  chancellor: { bg: 'rgba(156, 39, 176, 0.15)', text: '#9c27b0' },
  general: { bg: 'rgba(33, 150, 243, 0.15)', text: '#2196f3' },
  official: { bg: 'rgba(76, 175, 80, 0.15)', text: '#4caf50' },
  poet: { bg: 'rgba(255, 152, 0, 0.15)', text: '#ff9800' },
  other: { bg: 'rgba(158, 158, 158, 0.15)', text: '#9e9e9e' },
};

export function TangFigureDetailModal({ figure, open, onClose }: TangFigureDetailModalProps) {
  if (!figure) return null;

  const themeColor = roleColors[figure.role] ?? roleColors['other']!;
  const lifespan = formatLifespan(figure);
  const age = calculateAge(figure);
  const roleLabel = ROLE_LABELS[figure.role];

  const headerChips = (
    <>
      <Chip label={roleLabel} size="small" sx={{ backgroundColor: themeColor.bg, color: themeColor.text, fontWeight: 500 }} />
      <Chip label={`${lifespan}（享年${age}岁）`} size="small" variant="outlined" sx={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }} />
      {figure.faction && (
        <Chip label={figure.faction} size="small" variant="outlined" sx={{ borderColor: themeColor.text, color: themeColor.text }} />
      )}
    </>
  );

  return (
    <BaseFigureDetailModal
      figure={figure}
      open={open}
      onClose={onClose}
      themeColor={themeColor}
      headerChips={headerChips}
      ariaIdPrefix="tang"
    />
  );
}

export default TangFigureDetailModal;
