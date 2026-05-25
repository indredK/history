/**
 * 参考资料
 */

import { Box, Divider, Typography } from '@mui/material';

interface QingSourcesSectionProps {
  sources: string[];
}

export function QingSourcesSection({ sources }: QingSourcesSectionProps) {
  if (sources.length === 0) return null;

  return (
    <>
      <Divider sx={{ my: 2 }} />
      <Box>
        <Typography variant="subtitle2" sx={{ color: 'var(--color-text-secondary)', mb: 1 }}>
          参考资料
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}
        >
          {sources.join('、')}
        </Typography>
      </Box>
    </>
  );
}
