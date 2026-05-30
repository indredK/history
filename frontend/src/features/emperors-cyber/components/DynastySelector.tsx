import type { DynastyItem } from '../types';
import { SideRadialMenu, type SideRadialMenuItem } from './SideRadialMenu';

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
  const items: SideRadialMenuItem[] = dynasties.map((dynasty) => {
    const count = emperorCounts[dynasty.id] || 0;

    return {
      id: dynasty.id,
      label: dynasty.name,
      subtitle: dynasty.era,
      meta: count > 0 ? `${count}位` : '空',
      accentColor: dynasty.color,
    };
  });

  return (
    <SideRadialMenu
      items={items}
      activeId={activeDynasty}
      onSelect={onSelect}
      side="left"
      ariaLabel="朝代选择"
      emptyText="暂无朝代数据"
    />
  );
}
