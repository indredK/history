import { Popover, Stack, Typography, Box, FormControlLabel, Checkbox, Slider } from '@mui/material';

interface MapSettingsPopoverProps {
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
}

export function MapSettingsPopover({ anchorEl, onClose }: MapSettingsPopoverProps) {
  const open = Boolean(anchorEl);
  const id = open ? 'map-settings-popover' : undefined;

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
        地图设置
      </Typography>
      <Stack spacing={2}>
        <FormControlLabel
          control={<Checkbox size="small" defaultChecked />}
          label={<Typography variant="body2">显示地名标注</Typography>}
        />
        <FormControlLabel
          control={<Checkbox size="small" defaultChecked />}
          label={<Typography variant="body2">显示河流</Typography>}
        />
        <FormControlLabel
          control={<Checkbox size="small" />}
          label={<Typography variant="body2">卫星地图</Typography>}
        />
        
        {/* 整体透明度 */}
        <Box>
          <Typography variant="caption" sx={{ color: 'var(--color-text-tertiary)' }}>
            地图透明度
          </Typography>
          <Slider
            defaultValue={100}
            min={0}
            max={100}
            size="small"
            sx={{ color: 'var(--color-secondary)', mt: 1 }}
          />
        </Box>
      </Stack>
    </Popover>
  );
}