import { Box, Popover, Stack, Typography, FormControlLabel, Checkbox, Slider } from '@mui/material';

interface AdvancedFilterPopoverProps {
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
}

export function AdvancedFilterPopover({ anchorEl, onClose }: AdvancedFilterPopoverProps) {
  const open = Boolean(anchorEl);
  const id = open ? 'advanced-filter-popover' : undefined;

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
          高级筛选
        </Typography>
        <Stack spacing={2}>
          <Stack spacing={1}>
            <FormControlLabel
              control={<Checkbox />}
              label="重要事件"
              sx={{ margin: 0 }}
            />
            <FormControlLabel
              control={<Checkbox />}
              label="地方事件"
              sx={{ margin: 0 }}
            />
            <FormControlLabel
              control={<Checkbox />}
              label="国际事件"
              sx={{ margin: 0 }}
            />
          </Stack>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              重要程度
            </Typography>
            <Slider
              defaultValue={50}
              valueLabelDisplay="auto"
              sx={{
                color: 'var(--color-primary)',
                '& .MuiSlider-thumb': {
                  backgroundColor: 'var(--color-primary)',
                },
                '& .MuiSlider-track': {
                  backgroundColor: 'var(--color-primary)',
                },
                '& .MuiSlider-rail': {
                  backgroundColor: 'var(--color-border-medium)',
                }
              }}
            />
          </Box>
        </Stack>
      </Box>
    </Popover>
  );
}