import type { CyberEmperor } from '../types';
import { getEmperorDisplayName } from '../data';
import {
  RadialMenu,
  type RadialMenuItem,
  type RadialTimelineItem,
} from '@/components/ui';

interface EmperorSelectorProps {
  emperors: CyberEmperor[];
  activeEmperorId: string;
  onSelect: (emperorId: string) => void;
  accentColor: string;
}

export function EmperorSelector({
  emperors,
  activeEmperorId,
  onSelect,
  accentColor,
}: EmperorSelectorProps) {
  const items: RadialMenuItem[] = emperors.map((emperor, index) => ({
    id: emperor.id,
    label: getEmperorDisplayName(emperor),
    subtitle: emperor.title || emperor.period,
    meta: String(index + 1).padStart(2, '0'),
    accentColor,
    tags: emperor.yearNames,
  }));
  const timelineItems: RadialTimelineItem[] = emperors.map((emperor) => ({
    id: emperor.id,
    label: getEmperorDisplayName(emperor),
    yearLabel: emperor.startYearLabel || emperor.period,
    yearValue: emperor.startYearValue,
    rangeLabel: emperor.period,
    accentColor,
  }));

  return (
    <RadialMenu
      items={items}
      timelineItems={timelineItems}
      activeId={activeEmperorId}
      onSelect={onSelect}
      side="right"
      ariaLabel="帝王选择"
      emptyText="该朝代暂无帝王数据"
      accentColor={accentColor}
      emptyMode="disc"
    />
  );
}
