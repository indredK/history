import type { ReactNode } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

type StateViewMode = 'loading' | 'error' | 'empty';

interface StateViewProps {
  mode: StateViewMode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
  minHeight?: number | string;
}

export function StateView({
  mode,
  title,
  description,
  actionLabel,
  onAction,
  icon,
  minHeight = 200,
}: StateViewProps) {
  const contentIcon =
    mode === 'loading' ? (
      <CircularProgress size={36} color="inherit" />
    ) : (
      icon ?? <Typography sx={{ fontSize: 24 }}>⚠</Typography>
    );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        color: 'inherit',
        textAlign: 'center',
        gap: 1.5,
        px: 3,
      }}
    >
      {contentIcon}
      <Typography variant="h6">{title}</Typography>
      {description && <Typography variant="body2">{description}</Typography>}
      {actionLabel && onAction && (
        <Button
          variant="outlined"
          startIcon={mode === 'error' ? <RefreshIcon /> : undefined}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
