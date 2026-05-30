/**
 * RadialMenu 类型定义
 */

export interface RadialMenuItem {
  id: string;
  label: string;
  subtitle?: string;
  meta?: string;
  accentColor?: string;
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
