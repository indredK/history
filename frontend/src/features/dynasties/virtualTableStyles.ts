/**
 * 朝代虚拟化表格 - 毛玻璃样式构建
 *
 * 复刻 ResponsiveTable.tsx 中 isClassicStyle 分支与 glassStickyStyles 的取值，
 * 但改为在父组件调用一次、把结果下发给表头/单元格，避免每个单元格各自调用
 * useStyleStore / getGlassConfig。
 */

import type { CSSProperties } from 'react';
import { getGlassConfig } from '@/config/glassConfig';

export interface GlassTableStyles {
  /** 表头普通单元格 */
  headerCell: CSSProperties;
  /** 表头首列（sticky 角，叠加在 headerCell 之上） */
  stickyHeaderCell: CSSProperties;
  /** 行内首列（sticky，叠加在普通格之上） */
  stickyBodyCell: CSSProperties;
  /** 行底色（奇数行 / 基准） */
  rowBg: string;
  /** 斑马纹偶数行底色 */
  rowBgEven: string;
  /** 行 hover 底色 */
  rowHover: string;
  /** 单元格分隔线颜色 */
  cellBorderColor: string;
}

export function buildGlassStyles(
  screenWidth: number,
  isClassic: boolean,
): GlassTableStyles {
  const g = getGlassConfig(screenWidth);
  const t = g.components.table; // { container:{blur,bgOpacity}, header:{blur,bgOpacity}, row:{bgOpacity,hoverOpacity} }

  const cellBorderColor = isClassic
    ? 'var(--app-interactive-border)'
    : g.border.color;

  const headerCell: CSSProperties = {
    color: isClassic ? 'var(--color-text-primary)' : 'var(--color-text-inverse)',
    backdropFilter: isClassic ? 'var(--app-backdrop-light)' : `blur(${t.header.blur})`,
    WebkitBackdropFilter: isClassic
      ? 'var(--app-backdrop-light)'
      : `blur(${t.header.blur})`,
    backgroundColor: isClassic
      ? 'var(--app-panel-bg-strong)'
      : `rgba(var(--glass-tint-rgb, 199, 143, 69), ${t.header.bgOpacity})`,
    borderBottom: isClassic
      ? '1px solid var(--app-interactive-border)'
      : `${g.border.width} solid ${g.border.color}`,
  };

  const stickyHeaderCell: CSSProperties = {
    backgroundColor: isClassic
      ? 'var(--app-panel-bg-strong)'
      : `rgba(var(--glass-tint-rgb, 199, 143, 69), ${t.header.bgOpacity})`,
    borderRight: isClassic
      ? '1px solid var(--app-interactive-border)'
      : `1px solid ${g.border.color}`,
    boxShadow: isClassic ? 'var(--app-panel-shadow-sm)' : '2px 0 8px rgba(0,0,0,0.15)',
  };

  const stickyBodyCell: CSSProperties = {
    backdropFilter: isClassic ? 'var(--app-backdrop-light)' : `blur(${t.container.blur})`,
    WebkitBackdropFilter: isClassic
      ? 'var(--app-backdrop-light)'
      : `blur(${t.container.blur})`,
    backgroundColor: isClassic
      ? 'var(--app-panel-bg)'
      : `rgba(var(--glass-surface-soft-rgb), ${t.container.bgOpacity})`,
    borderRight: isClassic
      ? '1px solid var(--app-interactive-border)'
      : `1px solid ${g.border.color}`,
    boxShadow: isClassic ? 'var(--app-panel-shadow-sm)' : '2px 0 8px rgba(0,0,0,0.15)',
  };

  const rowBg = isClassic
    ? 'var(--app-panel-bg)'
    : `rgba(var(--glass-surface-rgb), ${t.row.bgOpacity})`;
  // 斑马纹偶数行：glass 模式略深一档，复刻原 nth-of-type(even) 的明暗差。
  const rowBgEven = isClassic
    ? 'var(--app-interactive-hover-bg)'
    : `rgba(var(--glass-surface-rgb), ${t.row.bgOpacity + 0.06})`;
  const rowHover = isClassic
    ? 'var(--app-interactive-hover-bg)'
    : `rgba(var(--glass-surface-rgb), ${t.row.hoverOpacity})`;

  return {
    headerCell,
    stickyHeaderCell,
    stickyBodyCell,
    rowBg,
    rowBgEven,
    rowHover,
    cellBorderColor,
  };
}
