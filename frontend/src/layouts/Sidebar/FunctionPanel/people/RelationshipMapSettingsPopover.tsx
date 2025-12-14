import { Popover, Stack, Typography, Box, FormControlLabel, Checkbox, Slider } from '@mui/material';

interface RelationshipMapSettingsPopoverProps {
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
}

export function RelationshipMapSettingsPopover({ anchorEl, onClose }: RelationshipMapSettingsPopoverProps) {
  const open = Boolean(anchorEl);
  const id = open ? 'relationship-map-settings-popover' : undefined;

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
        关系图设置
      </Typography>
      <Stack spacing={2}>
        <FormControlLabel
          control={<Checkbox size="small" defaultChecked />}
          label={<Typography variant="body2">显示师生关系</Typography>}
        />
        <FormControlLabel
          control={<Checkbox size="small" defaultChecked />}
          label={<Typography variant="body2">显示政治关系</Typography>}
        />
        <FormControlLabel
          control={<Checkbox size="small" />}
          label={<Typography variant="body2">显示家族关系</Typography>}
        />
        <FormControlLabel
          control={<Checkbox size="small" />}
          label={<Typography variant="body2">显示友谊关系</Typography>}
        />

        {/* 关系图布局 */}
        <Box>
          <Typography variant="caption" sx={{ color: 'var(--color-text-tertiary)' }}>
            节点间距
          </Typography>
          <Slider
            defaultValue={50}
            min={20}
            max={100}
            size="small"
            sx={{ color: '#4CAF50', mt: 1 }}
          />
        </Box>

        <FormControlLabel
          control={<Checkbox size="small" defaultChecked />}
          label={<Typography variant="body2">自动布局</Typography>}
        />
      </Stack>
    </Popover>
  );
}