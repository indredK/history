/**
 * 帝王网格组件
 */

import { Box, Typography } from '@mui/material';
import { EmperorCard } from './EmperorCard';
import { GridSkeleton } from '../common/GridSkeleton';
import type { Emperor } from '@/services/emperor/types';

interface EmperorGridProps {
  emperors: Emperor[];
  onEmperorClick: (emperor: Emperor) => void;
  loading: boolean;
}

export function EmperorGrid({ emperors, onEmperorClick, loading }: EmperorGridProps) {
  if (loading) return <GridSkeleton count={8} />;

  if (emperors.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', color: 'var(--color-text-secondary)', p: 4 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>没有找到匹配的帝王</Typography>
        <Typography variant="body2">请尝试调整搜索条件或筛选条件</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: { xs: 2, sm: 2, md: 2.5 }, pt: 1, px: 0.5, pb: 2, transition: 'all 0.3s ease-in-out' }}>
      {emperors.map((emperor) => (
        <EmperorCard key={emperor.id} emperor={emperor} onClick={() => onEmperorClick(emperor)} />
      ))}
    </Box>
  );
}

export default EmperorGrid;
