import type { PropsWithChildren } from 'react';
import { Box } from '@mui/material';

export function SectionToolbar({ children }: PropsWithChildren) {
  return (
    <Box
      sx={{
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: 'var(--app-panel-bg-soft)',
        mb: 2,
        border: 'var(--app-panel-border)',
        borderRadius: '12px',
        boxShadow: 'var(--app-panel-shadow-sm)',
        px: 0.5,
        py: 0.5,
      }}
    >
      {children}
    </Box>
  );
}
