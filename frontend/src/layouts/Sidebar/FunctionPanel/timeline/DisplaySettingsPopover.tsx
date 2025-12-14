import { Box, Popover, Stack, Typography, FormControlLabel, Checkbox, Slider } from '@mui/material';
import { popoverProps, popoverContentStyles, getThemedCheckboxStyles, formControlLabelStyles, captionStyles, getThemedSliderStyles } from '../popoverStyles';

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
      {...popoverProps}
    >
      <Box sx={{ ...popoverContentStyles, minWidth: 250 }}>
        <Typography variant="subtitle1" gutterBottom>
          显示设置
        </Typography>
        <Stack spacing={2}>
          <FormControlLabel
            control={
              <Checkbox 
                size="small" 
                defaultChecked 
                sx={getThemedCheckboxStyles('timeline')}
              />
            }
            label={<Typography variant="body2">3D效果</Typography>}
            sx={formControlLabelStyles}
          />
          <Box>
            <Typography variant="caption" sx={captionStyles}>
              动画速度
            </Typography>
            <Slider
              defaultValue={50}
              min={0}
              max={100}
              size="small"
              sx={getThemedSliderStyles('timeline')}
            />
          </Box>
          <FormControlLabel
            control={
              <Checkbox 
                size="small" 
                defaultChecked 
                sx={getThemedCheckboxStyles('timeline')}
              />
            }
            label={<Typography variant="body2">显示详细信息</Typography>}
            sx={formControlLabelStyles}
          />
        </Stack>
      </Box>
    </Popover>
  );
}
