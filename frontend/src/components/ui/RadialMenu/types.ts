/**
 * RadialMenu 类型定义
 */

export interface RadialMenuItem {
  id: string;
  label: string;
  subtitle?: string;
  meta?: string;
  accentColor?: string;
  /** 选中节点下方展示的标签（如帝王年号）。通用字段，由消费方按领域填充。 */
  tags?: string[];
}

export interface RadialTimelineItem {
  id: string;
  label: string;
  yearLabel: string;
  yearValue: number | null;
  rangeLabel?: string;
  accentColor?: string;
}

/** 挂靠侧 - 位置由父级指定，组件不再自行求解方向 */
export type RadialMenuSide = 'left' | 'right';

export type RadialMenuViewMode = 'orbit' | 'timeline';
export type RadialMenuMode = RadialMenuViewMode | 'auto';
export type RadialMenuDisplayState = 'hidden' | 'collapsed' | 'preview' | 'expanded';
export type RadialMenuDensity = 'comfortable' | 'compact';
export type RadialMenuClickBehavior = 'expand-then-cycle' | 'toggle-only';
export type RadialMenuBoundaryRect = Pick<DOMRectReadOnly, 'x' | 'y' | 'width' | 'height' | 'top' | 'left'>;
export type RadialMenuBoundary = 'viewport' | 'container' | RadialMenuBoundaryRect;
export type RadialMenuPadding = number | Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>;

export interface RadialMenuProps {
  items: RadialMenuItem[];
  timelineItems?: RadialTimelineItem[];
  activeId: string;
  onSelect: (itemId: string) => void;

  /** 挂靠侧：left 朝右展开，right 朝左展开。位置由父级指定。 */
  side?: RadialMenuSide;
  /** 距离边界的内缩距离 */
  inset?: number;
  /** 父级控制的朝外侧平移量（px）：left 朝左、right 朝右。用于把轮盘推出中间内容区，默认 0。 */
  offset?: number;
  /** 布局测量依据的边界 */
  boundary?: RadialMenuBoundary;
  /** 与边界之间的安全间距 */
  safePadding?: RadialMenuPadding;

  mode?: RadialMenuMode;
  density?: RadialMenuDensity;
  /** 小于该容器宽度时切换紧凑模式 */
  compactBelow?: number;
  /** 小于该容器宽度时直接隐藏 */
  hiddenBelow?: number;
  /** 旧接口，内部映射到 hiddenBelow。 */
  hiddenBelowWidth?: number;

  defaultView?: RadialMenuViewMode;
  rememberLastView?: boolean;
  clickBehavior?: RadialMenuClickBehavior;
  collapseOnSelect?: boolean;
  previewOnHover?: boolean;

  accentColor?: string;
  emptyText: string;
  emptyMode?: 'text' | 'disc';
  ariaLabel: string;
}
