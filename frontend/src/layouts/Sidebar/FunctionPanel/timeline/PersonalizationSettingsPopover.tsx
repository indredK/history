import { Box, Popover, Stack, Typography, FormControlLabel, Checkbox, Slider, Button, Divider } from '@mui/material';
import { popoverProps, popoverContentStyles, getThemedCheckboxStyles, formControlLabelStyles, dividerStyles, getThemedSliderStyles, getThemedButtonStyles, getThemedPrimaryButtonStyles } from '../popoverStyles';

interface PersonalizationSettingsPopoverProps {
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
}

export function PersonalizationSettingsPopover({ anchorEl, onClose }: PersonalizationSettingsPopoverProps) {
  const open = Boolean(anchorEl);
  const id = open ? 'personalization-settings-popover' : undefined;

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
          个性化设置
        </Typography>
        <Stack spacing={2}>
          <Stack spacing={1}>
            <FormControlLabel
              control={<Checkbox sx={getThemedCheckboxStyles('timeline')} />}
              label="深色主题"
              sx={formControlLabelStyles}
            />
            <FormControlLabel
              control={<Checkbox sx={getThemedCheckboxStyles('timeline')} />}
              label="自动保存设置"
              sx={formControlLabelStyles}
            />
            <FormControlLabel
              control={<Checkbox sx={getThemedCheckboxStyles('timeline')} />}
              label="记住上次浏览位置"
              sx={formControlLabelStyles}
            />
          </Stack>
          
          <Divider sx={dividerStyles} />
          
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" gutterBottom>
              字体大小
            </Typography>
            <Slider
              defaultValue={50}
              valueLabelDisplay="auto"
              sx={getThemedSliderStyles('timeline')}
            />
          </Box>
          
          <Divider sx={dividerStyles} />
          
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" gutterBottom>
              界面语言
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button
                variant="outlined"
                size="small"
                sx={getThemedButtonStyles('timeline')}
              >
                简体中文
              </Button>
              <Button
                variant="outlined"
                size="small"
                sx={getThemedButtonStyles('timeline')}
              >
                English
              </Button>
            </Stack>
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              fullWidth
              sx={getThemedPrimaryButtonStyles('timeline')}
            >
              保存设置
            </Button>
          </Box>
        </Stack>
      </Box>
    </Popover>
  );
}