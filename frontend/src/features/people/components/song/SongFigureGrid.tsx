/**
 * 宋朝人物网格组件
 */

import { FigureGrid } from '../common/FigureGrid';
import { SongFigureCard } from './SongFigureCard';
import type { SongFigure } from '@/services/person/song/types';

interface SongFigureGridProps {
  figures: SongFigure[];
  onFigureClick: (figure: SongFigure) => void;
  loading: boolean;
}

export function SongFigureGrid({ figures, onFigureClick, loading }: SongFigureGridProps) {
  return (
    <FigureGrid
      items={figures}
      loading={loading}
      emptyTitle="没有找到匹配的宋朝人物"
      renderCard={(figure) => (
        <SongFigureCard figure={figure} onClick={() => onFigureClick(figure)} />
      )}
      keyExtractor={(figure) => figure.id}
    />
  );
}

export default SongFigureGrid;
