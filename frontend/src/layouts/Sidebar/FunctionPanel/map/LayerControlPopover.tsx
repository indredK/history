import { Popover, Stack, Typography, Box, FormControlLabel, Checkbox, Slider } from '@mui/material';
import { useMapStore } from '@/store';
import { popoverConfig, formConfig, commonStyles, uiUtils } from '@/config';

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
      {...uiUtils.getPopoverProps()}
    >
      <Box sx={popoverConfig.contentStyles}>
        <Typography variant="subtitle1" gutterBottom>
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
              sx={formConfig.controlLabel}
            />
            {adminBoundaryVisible && (
              <Box sx={{ px: 1, mt: 1 }}>
                <Typography variant="caption" sx={commonStyles.caption}>
                  透明度: {Math.round(adminBoundaryOpacity * 100)}%
                </Typography>
                <Slider
                  value={adminBoundaryOpacity}
                  onChange={(_, value) => setAdminBoundaryOpacity(value as number)}
                  min={0}
                  max={1}
                  step={0.1}
                  size="small"
                  sx={uiUtils.getThemedSliderStyles('map')}
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
                  sx={uiUtils.getThemedCheckboxStyles('timeline')}
                />
              }
              label={<Typography variant="body2">历史朝代疆域</Typography>}
              sx={formConfig.controlLabel}
            />
            {dynastyBoundaryVisible && (
              <Box sx={{ px: 1, mt: 1 }}>
                <Typography variant="caption" sx={commonStyles.caption}>
                  透明度: {Math.round(dynastyBoundaryOpacity * 100)}%
                </Typography>
                <Slider
                  value={dynastyBoundaryOpacity}
                  onChange={(_, value) => setDynastyBoundaryOpacity(value as number)}
                  min={0}
                  max={1}
                  step={0.1}
                  size="small"
                  sx={uiUtils.getThemedSliderStyles('timeline')}
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
                sx={uiUtils.getThemedCheckboxStyles('timeline')}
              />
            }
            label={<Typography variant="body2">事件标记</Typography>}
            sx={formConfig.controlLabel}
          />
        </Stack>
      </Box>
    </Popover>
  );
}