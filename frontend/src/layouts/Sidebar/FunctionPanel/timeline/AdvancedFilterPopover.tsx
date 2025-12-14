import { Box, Popover, Stack, Typography, FormControlLabel, Checkbox, Slider } from '@mui/material';
import { popoverProps, popoverContentStyles, getThemedCheckboxStyles, formControlLabelStyles, getThemedSliderStyles } from '../popoverStyles';

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
      {...popoverProps}
    >
      <Box sx={popoverContentStyles}>
        <Typography variant="subtitle1" gutterBottom>
          高级筛选
        </Typography>
        <Stack spacing={2}>
          <Stack spacing={1}>
            <FormControlLabel
              control={<Checkbox sx={getThemedCheckboxStyles('timeline')} />}
              label="重要事件"
              sx={formControlLabelStyles}
            />
            <FormControlLabel
              control={<Checkbox sx={getThemedCheckboxStyles('timeline')} />}
              label="地方事件"
              sx={formControlLabelStyles}
            />
            <FormControlLabel
              control={<Checkbox sx={getThemedCheckboxStyles('timeline')} />}
              label="国际事件"
              sx={formControlLabelStyles}
            />
          </Stack>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              重要程度
            </Typography>
            <Slider
              defaultValue={50}
              valueLabelDisplay="auto"
              sx={getThemedSliderStyles('timeline')}
            />
          </Box>
        </Stack>
      </Box>
    </Popover>
  );
}