import { Popover, Stack, Typography, Box, FormControlLabel, Checkbox, Slider } from '@mui/material';
import { useMapStore } from '../../../../store';

interface LayerControlPopoverProps {
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
}

export function LayerControlPopover({ anchorEl, onClose }: LayerControlPopoverProps) {
  const {
    adminBoundaryVisible,
    adminBoundaryOpacity,
    dynastyBoundaryVisible,
    dynastyBoundaryOpacity,
    eventMarkersVisible,
    toggleAdminBoundary,
    setAdminBoundaryOpacity,
    toggleDynastyBoundary,
    setDynastyBoundaryOpacity,
    toggleEventMarkers
  } = useMapStore();

  const open = Boolean(anchorEl);
  const id = open ? 'layer-control-popover' : undefined;

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
        图层控制
      </Typography>
      <Stack spacing={2}>
        {/* 现代行政区域 */}
        <Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={adminBoundaryVisible}
                onChange={toggleAdminBoundary}
                size="small"
                sx={{
                  color: 'var(--color-text-secondary)',
                  '&.Mui-checked': {
                    color: 'var(--color-secondary)'
                  }
                }}
              />
            }
            label={<Typography variant="body2">现代行政区域</Typography>}
          />
          {adminBoundaryVisible && (
            <Box sx={{ px: 1, mt: 1 }}>
              <Typography variant="caption" sx={{ color: 'var(--color-text-tertiary)' }}>
                透明度: {Math.round(adminBoundaryOpacity * 100)}%
              </Typography>
              <Slider
                value={adminBoundaryOpacity}
                onChange={(_, value) => setAdminBoundaryOpacity(value as number)}
                min={0}
                max={1}
                step={0.1}
                size="small"
                sx={{ color: 'var(--color-secondary)' }}
              />
            </Box>
          )}
        </Box>

        {/* 历史朝代疆域 */}
        <Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={dynastyBoundaryVisible}
                onChange={toggleDynastyBoundary}
                size="small"
                sx={{
                  color: 'var(--color-text-secondary)',
                  '&.Mui-checked': {
                    color: 'var(--color-primary)'
                  }
                }}
              />
            }
            label={<Typography variant="body2">历史朝代疆域</Typography>}
          />
          {dynastyBoundaryVisible && (
            <Box sx={{ px: 1, mt: 1 }}>
              <Typography variant="caption" sx={{ color: 'var(--color-text-tertiary)' }}>
                透明度: {Math.round(dynastyBoundaryOpacity * 100)}%
              </Typography>
              <Slider
                value={dynastyBoundaryOpacity}
                onChange={(_, value) => setDynastyBoundaryOpacity(value as number)}
                min={0}
                max={1}
                step={0.1}
                size="small"
                sx={{ color: 'var(--color-primary)' }}
              />
            </Box>
          )}
        </Box>

        {/* 事件标记 */}
        <FormControlLabel
          control={
            <Checkbox
              checked={eventMarkersVisible}
              onChange={toggleEventMarkers}
              size="small"
              sx={{
                color: 'var(--color-text-secondary)',
                '&.Mui-checked': {
                  color: 'var(--color-primary)'
                }
              }}
            />
          }
          label={<Typography variant="body2">事件标记</Typography>}
        />
      </Stack>
    </Popover>
  );
}