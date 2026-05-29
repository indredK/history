import type { PropsWithChildren, ReactNode } from 'react';
import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { PageIntro } from './PageIntro';

interface PagePanelProps extends PropsWithChildren {
  title?: string | undefined;
  description?: string | undefined;
  headerAside?: ReactNode;
  className?: string | undefined;
  sx?: SxProps<Theme>;
  contentSx?: SxProps<Theme>;
  headerDivider?: boolean | undefined;
}

export function PagePanel({
  title,
  description,
  headerAside,
  className,
  sx,
  contentSx,
  headerDivider = true,
  children,
}: PagePanelProps) {
  return (
    <Box
      className={className}
      sx={[
        {
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: 'var(--app-panel-bg-soft)',
          border: 'var(--app-panel-border)',
          borderRadius: 'var(--radius-unified-xl)',
          boxShadow: 'var(--app-panel-shadow-md)',
          p: { xs: 1.5, md: 2 },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <PageIntro
        title={title}
        description={description}
        aside={headerAside}
        divider={headerDivider}
      />
      <Box
        sx={[
          {
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
          },
          ...(Array.isArray(contentSx)
            ? contentSx
            : contentSx
              ? [contentSx]
              : []),
        ]}
      >
        {children}
      </Box>
    </Box>
  );
}
