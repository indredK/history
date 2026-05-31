import type { DynastyItem } from '../types';
import {
  RadialMenu,
  type RadialMenuItem,
  type RadialTimelineItem,
} from '@/components/ui';

interface DynastySelectorProps {
  dynasties: DynastyItem[];
  activeDynasty: string;
  onSelect: (dynastyId: string) => void;
  emperorCounts: Record<string, number>;
}

export function DynastySelector({
  dynasties,
  activeDynasty,
  onSelect,
  emperorCounts,
}: DynastySelectorProps) {
  const items: RadialMenuItem[] = dynasties.map((dynasty) => {
    const count = emperorCounts[dynasty.id] || 0;

    return {
      id: dynasty.id,
      label: dynasty.name,
      subtitle: dynasty.era,
      meta: count > 0 ? `${count}位` : '空',
      accentColor: dynasty.color,
    };
  });
  const timelineItems: RadialTimelineItem[] = dynasties.map((dynasty) => ({
    id: dynasty.id,
    label: dynasty.name,
    yearLabel: dynasty.startYearLabel || dynasty.era,
    yearValue: dynasty.startYearValue,
    rangeLabel: dynasty.era,
    accentColor: dynasty.color,
  }));

  return (
    <RadialMenu
      items={items}
      timelineItems={timelineItems}
      activeId={activeDynasty}
      onSelect={onSelect}
      side="left"
      offset={200}
      boundary="container"
      inset={28}
      safePadding={{ top: 18, right: 18, bottom: 28, left: 18 }}
      compactBelow={1060}
      hiddenBelow={700}
      previewOnHover
      ariaLabel="朝代选择"
      emptyText="暂无朝代数据"
    />
  );
}
