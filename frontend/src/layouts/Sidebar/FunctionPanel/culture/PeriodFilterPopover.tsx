import { Popover, Stack, Typography, Chip } from '@mui/material';

interface PeriodFilterPopoverProps {
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
}

export function PeriodFilterPopover({ anchorEl, onClose }: PeriodFilterPopoverProps) {
  const open = Boolean(anchorEl);
  const id = open ? 'period-filter-popover' : undefined;

  return (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
      transformOrigin={{ vertical: 'center', horizontal: 'left' }}
      disableScrollLock
      elevation={8}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(135deg, var(--color-bg-card) 0%, var(--color-bg-secondary) 100%)',
            border: '1px solid var(--color-border-medium)',
            boxShadow: 'var(--shadow-xl), var(--shadow-glow)',
            backdropFilter: 'blur(10px)',
            p: 2
          }
        }
      }}
    >
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
        时期筛选
      </Typography>
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip label="先秦" size="small" variant="outlined" />
          <Chip label="秦汉" size="small" variant="outlined" />
          <Chip label="魏晋" size="small" variant="outlined" />
          <Chip label="隋唐" size="small" variant="outlined" />
          <Chip label="宋元" size="small" variant="outlined" />
          <Chip label="明清" size="small" variant="outlined" />
        </Stack>
      </Stack>
    </Popover>
  );
}