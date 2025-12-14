import { Box, Popover, Stack, Typography, FormControlLabel, Checkbox, Button, Divider } from '@mui/material';
import { popoverProps, popoverContentStyles, getThemedCheckboxStyles, formControlLabelStyles, dividerStyles, getThemedButtonStyles, getThemedPrimaryButtonStyles } from '../popoverStyles';

interface DataAnalysisPopoverProps {
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
}

export function DataAnalysisPopover({ anchorEl, onClose }: DataAnalysisPopoverProps) {
  const open = Boolean(anchorEl);
  const id = open ? 'data-analysis-popover' : undefined;

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
          数据分析
        </Typography>
        <Stack spacing={2}>
          <Stack spacing={1}>
            <FormControlLabel
              control={
                <Checkbox 
                  sx={getThemedCheckboxStyles('timeline')}
                />
              }
              label="事件频率分析"
              sx={formControlLabelStyles}
            />
            <FormControlLabel
              control={
                <Checkbox 
                  sx={getThemedCheckboxStyles('timeline')}
                />
              }
              label="事件持续时间分析"
              sx={formControlLabelStyles}
            />
            <FormControlLabel
              control={
                <Checkbox 
                  sx={getThemedCheckboxStyles('timeline')}
                />
              }
              label="事件关系分析"
              sx={formControlLabelStyles}
            />
          </Stack>
          
          <Divider sx={dividerStyles} />
          
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" gutterBottom sx={{ fontWeight: 500 }}>
              分析维度
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button
                variant="outlined"
                size="small"
                sx={getThemedButtonStyles('timeline')}
              >
                按朝代
              </Button>
              <Button
                variant="outlined"
                size="small"
                sx={getThemedButtonStyles('timeline')}
              >
                按事件类型
              </Button>
              <Button
                variant="outlined"
                size="small"
                sx={getThemedButtonStyles('timeline')}
              >
                按时间跨度
              </Button>
            </Stack>
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              fullWidth
              sx={getThemedPrimaryButtonStyles('timeline')}
            >
              执行分析
            </Button>
          </Box>
        </Stack>
      </Box>
    </Popover>
  );
}