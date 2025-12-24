/**
 * 明朝人物网格组件
 */

import { Box, Typography } from '@mui/material';
import { MingFigureCard } from './MingFigureCard';
import { GridSkeleton } from '../common/GridSkeleton';
import type { MingFigure } from '@/services/person/ming/types';

interface MingFigureGridProps {
  figures: MingFigure[];
  onFigureClick: (figure: MingFigure) => void;
  loading: boolean;
}

export function MingFigureGrid({ figures, onFigureClick, loading }: MingFigureGridProps) {
  if (loading) return <GridSkeleton count={8} />;

  if (figures.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', color: 'var(--color-text-secondary)', p: 4 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>没有找到匹配的明朝人物</Typography>
        <Typography variant="body2">请尝试调整搜索条件或筛选条件</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: { xs: 2, sm: 2, md: 2.5 }, pt: 1, px: 0.5, pb: 2, transition: 'all 0.3s ease-in-out' }}>
      {figures.map((figure) => (
        <MingFigureCard key={figure.id} figure={figure} onClick={() => onFigureClick(figure)} />
      ))}
    </Box>
  );
}

export default MingFigureGrid;
