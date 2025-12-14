import { Box, Popover, Stack, Typography, Chip } from '@mui/material';

interface DynastyFilterPopoverProps {
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
}

export function DynastyFilterPopover({ anchorEl, onClose }: DynastyFilterPopoverProps) {
  const open = Boolean(anchorEl);
  const id = open ? 'dynasty-filter-popover' : undefined;

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
            backdropFilter: 'blur(10px)'
          }
        }
      }}
    >
      <Box sx={{ p: 3, minWidth: 280 }}>
        <Typography variant="subtitle1" gutterBottom>
          朝代筛选
        </Typography>
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip label="秦朝" size="small" variant="outlined" />
            <Chip label="汉朝" size="small" variant="outlined" />
            <Chip label="唐朝" size="small" variant="outlined" />
            <Chip label="宋朝" size="small" variant="outlined" />
            <Chip label="明朝" size="small" variant="outlined" />
            <Chip label="清朝" size="small" variant="outlined" />
          </Stack>
        </Stack>
      </Box>
    </Popover>
  );
}
