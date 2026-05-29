/**
 * 元朝人物网格组件
 */

import { FigureGrid } from '../common/FigureGrid';
import { YuanFigureCard } from './YuanFigureCard';
import type { YuanFigure } from '@/services/person/yuan/types';

interface YuanFigureGridProps {
  figures: YuanFigure[];
  onFigureClick: (figure: YuanFigure) => void;
  loading: boolean;
}

export function YuanFigureGrid({ figures, onFigureClick, loading }: YuanFigureGridProps) {
  return (
    <FigureGrid
      items={figures}
      loading={loading}
      emptyTitle="没有找到匹配的元朝人物"
      renderCard={(figure) => (
        <YuanFigureCard figure={figure} onClick={() => onFigureClick(figure)} />
      )}
      keyExtractor={(figure) => figure.id}
    />
  );
}

export default YuanFigureGrid;
