/**
 * 明朝人物网格组件
 */

import { FigureGrid } from '../common/FigureGrid';
import { MingFigureCard } from './MingFigureCard';
import type { MingFigure } from '@/services/person/ming/types';

interface MingFigureGridProps {
  figures: MingFigure[];
  onFigureClick: (figure: MingFigure) => void;
  loading: boolean;
}

export function MingFigureGrid({ figures, onFigureClick, loading }: MingFigureGridProps) {
  return (
    <FigureGrid
      items={figures}
      loading={loading}
      emptyTitle="没有找到匹配的明朝人物"
      renderCard={(figure) => (
        <MingFigureCard figure={figure} onClick={() => onFigureClick(figure)} />
      )}
      keyExtractor={(figure) => figure.id}
    />
  );
}

export default MingFigureGrid;
