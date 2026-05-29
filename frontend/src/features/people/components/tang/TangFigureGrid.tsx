/**
 * 唐朝人物网格组件
 */

import { FigureGrid } from '../common/FigureGrid';
import { TangFigureCard } from './TangFigureCard';
import type { TangFigure } from '@/services/person/tang/types';

interface TangFigureGridProps {
  figures: TangFigure[];
  onFigureClick: (figure: TangFigure) => void;
  loading: boolean;
}

export function TangFigureGrid({ figures, onFigureClick, loading }: TangFigureGridProps) {
  return (
    <FigureGrid
      items={figures}
      loading={loading}
      emptyTitle="没有找到匹配的唐朝人物"
      renderCard={(figure) => (
        <TangFigureCard figure={figure} onClick={() => onFigureClick(figure)} />
      )}
      keyExtractor={(figure) => figure.id}
    />
  );
}

export default TangFigureGrid;
