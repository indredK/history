import { Box, Popover, Stack, Typography, FormControlLabel, Checkbox, Button, Divider } from '@mui/material';
import { popoverProps, popoverContentStyles, getThemedCheckboxStyles, formControlLabelStyles, dividerStyles, getThemedButtonStyles, getThemedPrimaryButtonStyles } from '../popoverStyles';

interface ExportSettingsPopoverProps {
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
}

export function ExportSettingsPopover({ anchorEl, onClose }: ExportSettingsPopoverProps) {
  const open = Boolean(anchorEl);
  const id = open ? 'export-settings-popover' : undefined;

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
          导出设置
        </Typography>
        <Stack spacing={2}>
          <Stack spacing={1}>
            <FormControlLabel
              control={<Checkbox sx={getThemedCheckboxStyles('timeline')} />}
              label="导出事件数据"
              sx={formControlLabelStyles}
            />
            <FormControlLabel
              control={<Checkbox sx={getThemedCheckboxStyles('timeline')} />}
              label="导出时间轴配置"
              sx={formControlLabelStyles}
            />
            <FormControlLabel
              control={<Checkbox sx={getThemedCheckboxStyles('timeline')} />}
              label="包含附件信息"
              sx={formControlLabelStyles}
            />
          </Stack>
          
          <Divider sx={dividerStyles} />
          
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" gutterBottom>
              导出格式
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button
                variant="outlined"
                size="small"
                sx={getThemedButtonStyles('timeline')}
              >
                JSON
              </Button>
              <Button
                variant="outlined"
                size="small"
                sx={getThemedButtonStyles('timeline')}
              >
                CSV
              </Button>
              <Button
                variant="outlined"
                size="small"
                sx={getThemedButtonStyles('timeline')}
              >
                PDF
              </Button>
            </Stack>
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              fullWidth
              sx={getThemedPrimaryButtonStyles('timeline')}
            >
              导出数据
            </Button>
          </Box>
        </Stack>
      </Box>
    </Popover>
  );
}