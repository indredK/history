/**
 * 帝王网格组件
 */

import { FigureGrid } from '../common/FigureGrid';
import { EmperorCard } from './EmperorCard';
import type { Emperor } from '@/services/person/emperors/types';

interface EmperorGridProps {
  emperors: Emperor[];
  onEmperorClick: (emperor: Emperor) => void;
  loading: boolean;
}

export function EmperorGrid({ emperors, onEmperorClick, loading }: EmperorGridProps) {
  return (
    <FigureGrid
      items={emperors}
      loading={loading}
      emptyTitle="没有找到匹配的帝王"
      renderCard={(emperor) => (
        <EmperorCard emperor={emperor} onClick={() => onEmperorClick(emperor)} />
      )}
      keyExtractor={(emperor) => emperor.id}
    />
  );
}

export default EmperorGrid;
