/**
 * 网格骨架屏组件
 */

import { Box, Card, CardContent, Skeleton } from '@mui/material';

interface GridSkeletonProps {
  count?: number;
}

export function GridSkeleton({ count = 8 }: GridSkeletonProps) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: { xs: 2, sm: 2, md: 2.5 } }}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} sx={{ height: '100%', minHeight: '200px', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
              <Skeleton variant="circular" width={56} height={56} sx={{ mr: 1.5, flexShrink: 0 }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="70%" height={28} />
                <Skeleton variant="text" width="50%" height={20} sx={{ mt: 0.5 }} />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5, flexWrap: 'wrap' }}>
              <Skeleton variant="rounded" width={60} height={24} sx={{ borderRadius: '12px' }} />
              <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: '12px' }} />
              <Skeleton variant="rounded" width={50} height={24} sx={{ borderRadius: '12px' }} />
            </Box>
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="80%" />
            <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid var(--color-border)' }}>
              <Skeleton variant="text" width="45%" height={18} />
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

export default GridSkeleton;
