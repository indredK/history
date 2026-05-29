/**
 * 流派历史影响
 */

import { Box, Typography } from '@mui/material';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';

interface SchoolInfluenceProps {
  influence?: string | undefined;
}

export function SchoolInfluence({ influence }: SchoolInfluenceProps) {
  if (!influence) return null;

  return (
    <Box>
      <Typography
        variant="subtitle1"
        sx={{
          color: 'var(--color-text-primary)',
          fontWeight: 600,
          mb: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <HistoryEduIcon sx={{ fontSize: '1.2rem', color: 'var(--color-purple)' }} />
        历史影响
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: 'var(--color-text-primary)',
          lineHeight: 1.8,
          textAlign: 'justify',
        }}
      >
        {influence}
      </Typography>
    </Box>
  );
}
