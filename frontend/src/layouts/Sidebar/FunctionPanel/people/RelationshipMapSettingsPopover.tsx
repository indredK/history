import { Popover, Stack, Typography, Box, FormControlLabel, Checkbox, Slider } from '@mui/material';
import { popoverProps, popoverContentStyles, getThemedCheckboxStyles, formControlLabelStyles, captionStyles, getThemedSliderStyles } from '../popoverStyles';

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
      {...popoverProps}
    >
      <Box sx={popoverContentStyles}>
        <Typography variant="subtitle1" gutterBottom>
          关系图设置
        </Typography>
        <Stack spacing={2}>
          <FormControlLabel
            control={
              <Checkbox 
                size="small" 
                defaultChecked 
                sx={getThemedCheckboxStyles('people')}
              />
            }
            label={<Typography variant="body2">显示师生关系</Typography>}
            sx={formControlLabelStyles}
          />
          <FormControlLabel
            control={
              <Checkbox 
                size="small" 
                defaultChecked 
                sx={getThemedCheckboxStyles('people')}
              />
            }
            label={<Typography variant="body2">显示政治关系</Typography>}
            sx={formControlLabelStyles}
          />
          <FormControlLabel
            control={
              <Checkbox 
                size="small" 
                sx={getThemedCheckboxStyles('people')}
              />
            }
            label={<Typography variant="body2">显示家族关系</Typography>}
            sx={formControlLabelStyles}
          />
          <FormControlLabel
            control={
              <Checkbox 
                size="small" 
                sx={getThemedCheckboxStyles('people')}
              />
            }
            label={<Typography variant="body2">显示友谊关系</Typography>}
            sx={formControlLabelStyles}
          />

          {/* 关系图布局 */}
          <Box>
            <Typography variant="caption" sx={captionStyles}>
              节点间距
            </Typography>
            <Slider
              defaultValue={50}
              min={20}
              max={100}
              size="small"
              sx={getThemedSliderStyles('people')}
            />
          </Box>

          <FormControlLabel
            control={
              <Checkbox 
                size="small" 
                defaultChecked 
                sx={getThemedCheckboxStyles('people')}
              />
            }
            label={<Typography variant="body2">自动布局</Typography>}
            sx={formControlLabelStyles}
          />
        </Stack>
      </Box>
    </Popover>
  );
}