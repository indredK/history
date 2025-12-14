import { Popover, Stack, Typography, FormControlLabel, Checkbox } from '@mui/material';

interface CultureTypePopoverProps {
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
}

export function CultureTypePopover({ anchorEl, onClose }: CultureTypePopoverProps) {
  const open = Boolean(anchorEl);
  const id = open ? 'culture-type-popover' : undefined;

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
        文化类型
      </Typography>
      <Stack spacing={1}>
        <FormControlLabel
          control={<Checkbox size="small" defaultChecked />}
          label={<Typography variant="body2">文学作品</Typography>}
        />
        <FormControlLabel
          control={<Checkbox size="small" defaultChecked />}
          label={<Typography variant="body2">艺术作品</Typography>}
        />
        <FormControlLabel
          control={<Checkbox size="small" />}
          label={<Typography variant="body2">科技发明</Typography>}
        />
        <FormControlLabel
          control={<Checkbox size="small" />}
          label={<Typography variant="body2">宗教思想</Typography>}
        />
        <FormControlLabel
          control={<Checkbox size="small" />}
          label={<Typography variant="body2">建筑工程</Typography>}
        />
        <FormControlLabel
          control={<Checkbox size="small" />}
          label={<Typography variant="body2">民俗文化</Typography>}
        />
      </Stack>
    </Popover>
  );
}