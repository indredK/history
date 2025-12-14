import { Popover, Stack, Typography, FormControlLabel, Checkbox } from '@mui/material';

interface OccupationFilterPopoverProps {
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
}

export function OccupationFilterPopover({ anchorEl, onClose }: OccupationFilterPopoverProps) {
  const open = Boolean(anchorEl);
  const id = open ? 'occupation-filter-popover' : undefined;

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
        职业分类
      </Typography>
      <Stack spacing={1}>
        <FormControlLabel
          control={<Checkbox size="small" />}
          label={<Typography variant="body2">皇帝君主</Typography>}
        />
        <FormControlLabel
          control={<Checkbox size="small" />}
          label={<Typography variant="body2">文人学者</Typography>}
        />
        <FormControlLabel
          control={<Checkbox size="small" />}
          label={<Typography variant="body2">军事将领</Typography>}
        />
        <FormControlLabel
          control={<Checkbox size="small" />}
          label={<Typography variant="body2">思想家</Typography>}
        />
        <FormControlLabel
          control={<Checkbox size="small" />}
          label={<Typography variant="body2">艺术家</Typography>}
        />
        <FormControlLabel
          control={<Checkbox size="small" />}
          label={<Typography variant="body2">科学家</Typography>}
        />
      </Stack>
    </Popover>
  );
}