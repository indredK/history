/**
 * 朝代虚拟化表格 - 布局纯函数
 *
 * 把"列可见性过滤 / 网格列模板 / 行宽 / 行高"集中为纯函数，
 * 由父组件按 screenWidth 计算一次后下发，避免在每个单元格内重复计算。
 */

import type { ColumnConfig } from './config';
import { tableConfig } from './config';

export interface ResponsiveFlags {
  /** width < 768 */
  isMobile: boolean;
  /** width < 375 */
  isSmallMobile: boolean;
}

/**
 * 复刻 ResponsiveTableCell.shouldHide() 的列隐藏规则，只是改为在父层一次性计算。
 * 保持与改造前完全一致的响应式列隐藏行为。
 */
export function isColumnVisible(col: ColumnConfig, f: ResponsiveFlags): boolean {
  if (col.hideOnSmallMobile && f.isSmallMobile) return false;
  if (col.hideOnMobile && f.isMobile) return false;
  if (f.isSmallMobile && col.priority === 'low') return false;
  if (f.isMobile && col.priority === 'low') return false;
  return true;
}

export function getVisibleColumns(
  columns: ColumnConfig[],
  f: ResponsiveFlags,
): ColumnConfig[] {
  return columns.filter((c) => isColumnVisible(c, f));
}

/** 解析 '120px' -> 120；非法值回退到 fallback。 */
function parsePx(value: string | undefined, fallback = 100): number {
  if (!value) return fallback;
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * 生成 grid-template-columns。
 *
 * 用 `minmax(minWidth, <width>fr)`：以列的 width 数值作为 fr 权重，
 * 让所有列按比例 **填满** 行宽（复刻原 MUI table-layout:auto + minWidth 的拉伸行为），
 * 同时以 minWidth 作为下限防止列塌缩过窄。
 */
export function getGridTemplate(visible: ColumnConfig[]): string {
  return visible
    .map((c) => {
      const weight = parsePx(c.width ?? c.minWidth);
      const min = c.minWidth ?? c.width ?? '60px';
      return `minmax(${min}, ${weight}fr)`;
    })
    .join(' ');
}

/**
 * 行 / 表头 / 占位层共用的宽度约束。
 * - 桌面：width:100% + minWidth:1400 —— 宽容器时填满、窄容器时横向滚动。
 * - 移动：width:100% —— 压缩进屏（与原 ResponsiveTable 在 isMobile 时 minWidth:'100%' 一致）。
 */
export function getRowSizing(isMobile: boolean): {
  width: string;
  minWidth?: string;
} {
  if (isMobile) {
    return { width: '100%' };
  }
  return { width: '100%', minWidth: `${tableConfig.minWidth}px` };
}

/**
 * 固定行高（单行短文本）。按响应式档位返回常量，用作 estimateSize 与每行实际高度。
 * 数值参考 responsive.ts 的 cellPadding/fontSize：上下 padding + 文字行高(≈fontSize*1.2)。
 */
export function getRowHeight(width: number): number {
  if (width < 375) return 28;
  if (width < 768) return 32;
  if (width < 1024) return 36;
  return 40;
}

/** 表头高度，对齐 responsive.ts 的 headerHeight 档位(xs32/sm36/md40/lg44)。 */
export function getHeaderHeight(width: number): number {
  if (width < 375) return 32;
  if (width < 768) return 36;
  if (width < 1024) return 40;
  return 44;
}
