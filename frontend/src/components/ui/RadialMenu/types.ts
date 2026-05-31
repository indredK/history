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

export interface RadialMenuProps {
  items: RadialMenuItem[];
  timelineItems?: RadialTimelineItem[];
  activeId: string;
  onSelect: (itemId: string) => void;
  side: 'left' | 'right';
  ariaLabel: string;
  emptyText: string;
  accentColor?: string;
  emptyMode?: 'text' | 'disc';
}
