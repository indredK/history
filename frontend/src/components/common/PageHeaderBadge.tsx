import { Box, Typography } from '@mui/material';

interface PageHeaderBadgeProps {
  label: string;
  value: string;
  minWidth?: number | string | undefined;
}

export function PageHeaderBadge({
  label,
  value,
  minWidth = 132,
}: PageHeaderBadgeProps) {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        flexDirection: 'column',
        gap: 0.25,
        alignItems: { xs: 'flex-start', md: 'flex-end' },
        px: 1.75,
        py: 1.25,
        borderRadius: '12px',
        background: 'rgba(199, 143, 69, 0.08)',
        border: '1px solid rgba(199, 143, 69, 0.14)',
        minWidth,
      }}
    >
      <Typography
        component="span"
        sx={{
          fontSize: '0.68rem',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--color-text-tertiary)',
        }}
      >
        {label}
      </Typography>
      <Typography
        component="strong"
        sx={{
          fontFamily: 'var(--font-family-serif)',
          fontSize: '1rem',
          color: 'var(--color-text-primary)',
          fontWeight: 600,
          lineHeight: 1.2,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}
