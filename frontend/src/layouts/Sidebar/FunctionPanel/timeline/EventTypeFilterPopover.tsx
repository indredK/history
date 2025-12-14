import { Box, Popover, Stack, Typography, FormControlLabel, Checkbox } from '@mui/material';
import { popoverProps, popoverContentStyles, getThemedCheckboxStyles, formControlLabelStyles } from '../popoverStyles';

interface EventTypeFilterPopoverProps {
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
}

export function EventTypeFilterPopover({ anchorEl, onClose }: EventTypeFilterPopoverProps) {
  const open = Boolean(anchorEl);
  const id = open ? 'event-type-filter-popover' : undefined;

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
          事件类型
        </Typography>
        <Stack spacing={1}>
          <FormControlLabel
            control={
              <Checkbox 
                size="small" 
                sx={getThemedCheckboxStyles('timeline')}
              />
            }
            label={<Typography variant="body2">政治事件</Typography>}
            sx={formControlLabelStyles}
          />
          <FormControlLabel
            control={
              <Checkbox 
                size="small" 
                sx={getThemedCheckboxStyles('timeline')}
              />
            }
            label={<Typography variant="body2">军事战争</Typography>}
            sx={formControlLabelStyles}
          />
          <FormControlLabel
            control={
              <Checkbox 
                size="small" 
                sx={getThemedCheckboxStyles('timeline')}
              />
            }
            label={<Typography variant="body2">文化艺术</Typography>}
            sx={formControlLabelStyles}
          />
          <FormControlLabel
            control={
              <Checkbox 
                size="small" 
                sx={getThemedCheckboxStyles('timeline')}
              />
            }
            label={<Typography variant="body2">科技发明</Typography>}
            sx={formControlLabelStyles}
          />
        </Stack>
      </Box>
    </Popover>
  );
}
