import type { CyberEmperor } from '../types';
import { getEmperorDisplayName } from '../data';
import { SideRadialMenu, type SideRadialMenuItem } from './SideRadialMenu';

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
  const items: SideRadialMenuItem[] = emperors.map((emperor, index) => ({
    id: emperor.id,
    label: getEmperorDisplayName(emperor),
    subtitle: emperor.title || emperor.period,
    meta: String(index + 1).padStart(2, '0'),
    accentColor,
  }));

  return (
    <SideRadialMenu
      items={items}
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
