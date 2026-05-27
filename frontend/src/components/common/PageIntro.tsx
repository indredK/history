import { Box, Typography } from '@mui/material';

interface PageIntroProps {
  title?: string | undefined;
  description?: string | undefined;
}

export function PageIntro({ title, description }: PageIntroProps) {
  if (!title && !description) {
    return null;
  }

  return (
    <Box
      sx={{
        px: { xs: 1, md: 1.5 },
        pt: { xs: 0.5, md: 1 },
        pb: 1.5,
        borderBottom: '1px solid var(--color-border-light)',
        mb: 1.5,
      }}
    >
      {title && (
        <Typography
          sx={{
            fontFamily: 'var(--font-family-serif)',
            fontSize: { xs: '1.2rem', md: '1.55rem' },
            color: 'var(--color-text-primary)',
            lineHeight: 1.2,
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
  );
}
