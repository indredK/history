import type { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';

interface PageIntroProps {
  title?: string | undefined;
  description?: string | undefined;
  aside?: ReactNode;
  divider?: boolean | undefined;
}

export function PageIntro({
  title,
  description,
  aside,
  divider = true,
}: PageIntroProps) {
  if (!title && !description && !aside) {
    return null;
  }

  return (
    <Box
      sx={{
        pt: { xs: 0.5, md: 1 },
        pb: 1.5,
        ...(divider && {
          borderBottom: '1px solid var(--color-border-light)',
        }),
        mb: 1.5,
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ alignItems: { xs: 'flex-start', md: 'flex-end' } }}
      >
        {(title || description) && (
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {title && (
              <Typography
                sx={{
                  fontFamily: 'var(--font-family-serif)',
                  fontSize: { xs: '1.2rem', md: '1.55rem' },
                  color: 'var(--color-text-primary)',
                  lineHeight: 1.15,
                  mb: description ? 0.5 : 0,
                }}
              >
                {title}
              </Typography>
            )}
            {description && (
              <Typography
                sx={{
                  color: 'var(--color-text-secondary)',
                  fontSize: { xs: '0.88rem', md: '0.95rem' },
                  maxWidth: 760,
                }}
              >
                {description}
              </Typography>
            )}
          </Box>
        )}
        {aside}
      </Stack>
    </Box>
  );
}
