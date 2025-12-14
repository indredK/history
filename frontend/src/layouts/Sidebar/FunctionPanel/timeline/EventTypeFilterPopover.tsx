import { Box, Popover, Stack, Typography, FormControlLabel, Checkbox } from '@mui/material';

interface EventTypeFilterPopoverProps {
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
}

export function EventTypeFilterPopover({ anchorEl, onClose }: EventTypeFilterPopoverProps) {
  const open = Boolean(anchorEl);
  const id = open ? 'event-type-filter-popover' : undefined;

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
      <Box sx={{ p: 3, minWidth: 250 }}>
        <Typography variant="subtitle1" gutterBottom>
          事件类型
        </Typography>
        <Stack spacing={1}>
          <FormControlLabel
            control={<Checkbox size="small" />}
            label={<Typography variant="body2">政治事件</Typography>}
          />
          <FormControlLabel
            control={<Checkbox size="small" />}
            label={<Typography variant="body2">军事战争</Typography>}
          />
          <FormControlLabel
            control={<Checkbox size="small" />}
            label={<Typography variant="body2">文化艺术</Typography>}
          />
          <FormControlLabel
            control={<Checkbox size="small" />}
            label={<Typography variant="body2">科技发明</Typography>}
          />
        </Stack>
      </Box>
    </Popover>
  );
}
