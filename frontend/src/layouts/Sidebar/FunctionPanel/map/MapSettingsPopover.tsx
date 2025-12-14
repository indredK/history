import { Popover, Stack, Typography, Box, FormControlLabel, Checkbox, Slider } from '@mui/material';
import { popoverProps, popoverContentStyles, getThemedCheckboxStyles, formControlLabelStyles, captionStyles, getThemedSliderStyles } from '../popoverStyles';

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
      {...popoverProps}
    >
      <Box sx={popoverContentStyles}>
        <Typography variant="subtitle1" gutterBottom>
          地图设置
        </Typography>
        <Stack spacing={2}>
          <FormControlLabel
            control={
              <Checkbox 
                size="small" 
                defaultChecked 
                sx={getThemedCheckboxStyles('map')}
              />
            }
            label={<Typography variant="body2">显示地名标注</Typography>}
            sx={formControlLabelStyles}
          />
          <FormControlLabel
            control={
              <Checkbox 
                size="small" 
                defaultChecked 
                sx={getThemedCheckboxStyles('map')}
              />
            }
            label={<Typography variant="body2">显示河流</Typography>}
            sx={formControlLabelStyles}
          />
          <FormControlLabel
            control={
              <Checkbox 
                size="small" 
                sx={getThemedCheckboxStyles('map')}
              />
            }
            label={<Typography variant="body2">卫星地图</Typography>}
            sx={formControlLabelStyles}
          />
          
          {/* 整体透明度 */}
          <Box>
            <Typography variant="caption" sx={captionStyles}>
              地图透明度
            </Typography>
            <Slider
              defaultValue={100}
              min={0}
              max={100}
              size="small"
              sx={getThemedSliderStyles('map')}
            />
          </Box>
        </Stack>
      </Box>
    </Popover>
  );
}