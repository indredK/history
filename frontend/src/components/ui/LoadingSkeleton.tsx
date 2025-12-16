import { Box, Card, CardContent, Skeleton, CircularProgress } from '@mui/material';

interface LoadingSkeletonProps {
  count?: number;
  variant?: 'cards' | 'page';
}

export function LoadingSkeleton({ count = 6, variant = 'cards' }: LoadingSkeletonProps) {
  // 页面级加载
  if (variant === 'page') {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="100%"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  // 卡片列表加载
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
      {Array.from({ length: count }).map((_, index) => (
        <Box sx={{ flexBasis: { xs: '100%', sm: '48%', md: '31%' } }} key={index}>
          <Card sx={{
            height: '100%',
            background: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={28} />
                  <Skeleton variant="text" width="40%" height={20} sx={{ mt: 0.5 }} />
                </Box>
              </Box>
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="rectangular" width="30%" height={24} sx={{ mt: 2, borderRadius: '12px' }} />
            </CardContent>
          </Card>
        </Box>
      ))}
    </Box>
  );
}