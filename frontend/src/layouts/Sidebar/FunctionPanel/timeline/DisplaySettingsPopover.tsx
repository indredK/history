import { Box, Popover, Stack, Typography, FormControlLabel, Checkbox, Slider } from '@mui/material';

interface DisplaySettingsPopoverProps {
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
}

export function DisplaySettingsPopover({ anchorEl, onClose }: DisplaySettingsPopoverProps) {
  const open = Boolean(anchorEl);
  const id = open ? 'display-settings-popover' : undefined;

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
          显示设置
        </Typography>
        <Stack spacing={2}>
          <FormControlLabel
            control={<Checkbox size="small" defaultChecked />}
            label={<Typography variant="body2">3D效果</Typography>}
          />
          <Box>
            <Typography variant="caption" sx={{ color: 'var(--color-text-tertiary)' }}>
              动画速度
            </Typography>
            <Slider
              defaultValue={50}
              min={0}
              max={100}
              size="small"
              sx={{ color: 'var(--color-primary)' }}
            />
          </Box>
          <FormControlLabel
            control={<Checkbox size="small" defaultChecked />}
            label={<Typography variant="body2">显示详细信息</Typography>}
          />
        </Stack>
      </Box>
    </Popover>
  );
}
