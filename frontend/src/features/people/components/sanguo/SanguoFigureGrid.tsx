/**
 * 三国人物网格组件
 */

import { FigureGrid } from '../common/FigureGrid';
import { SanguoFigureCard } from './SanguoFigureCard';
import type { SanguoFigure } from '@/services/person/sanguo/types';

interface SanguoFigureGridProps {
  figures: SanguoFigure[];
  onFigureClick: (figure: SanguoFigure) => void;
  loading: boolean;
}

export function SanguoFigureGrid({ figures, onFigureClick, loading }: SanguoFigureGridProps) {
  return (
    <FigureGrid
      items={figures}
      loading={loading}
      emptyTitle="没有找到匹配的三国人物"
      renderCard={(figure) => (
        <SanguoFigureCard figure={figure} onClick={() => onFigureClick(figure)} />
      )}
      keyExtractor={(figure) => figure.id}
    />
  );
}

export default SanguoFigureGrid;
