import { Popover, Stack, Typography, FormControlLabel, Checkbox, Box } from '@mui/material';
import { popoverProps, popoverContentStyles, getThemedCheckboxStyles, formControlLabelStyles } from '../popoverStyles';

interface CultureTypePopoverProps {
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
}

export function CultureTypePopover({ anchorEl, onClose }: CultureTypePopoverProps) {
  const open = Boolean(anchorEl);
  const id = open ? 'culture-type-popover' : undefined;

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
          文化类型
        </Typography>
        <Stack spacing={1}>
          <FormControlLabel
            control={
              <Checkbox 
                size="small" 
                defaultChecked 
                sx={getThemedCheckboxStyles('culture')}
              />
            }
            label={<Typography variant="body2">文学作品</Typography>}
            sx={formControlLabelStyles}
          />
          <FormControlLabel
            control={
              <Checkbox 
                size="small" 
                defaultChecked 
                sx={getThemedCheckboxStyles('culture')}
              />
            }
            label={<Typography variant="body2">艺术作品</Typography>}
            sx={formControlLabelStyles}
          />
          <FormControlLabel
            control={
              <Checkbox 
                size="small" 
                sx={getThemedCheckboxStyles('culture')}
              />
            }
            label={<Typography variant="body2">科技发明</Typography>}
            sx={formControlLabelStyles}
          />
          <FormControlLabel
            control={
              <Checkbox 
                size="small" 
                sx={getThemedCheckboxStyles('culture')}
              />
            }
            label={<Typography variant="body2">宗教思想</Typography>}
            sx={formControlLabelStyles}
          />
          <FormControlLabel
            control={
              <Checkbox 
                size="small" 
                sx={getThemedCheckboxStyles('culture')}
              />
            }
            label={<Typography variant="body2">建筑工程</Typography>}
            sx={formControlLabelStyles}
          />
          <FormControlLabel
            control={
              <Checkbox 
                size="small" 
                sx={getThemedCheckboxStyles('culture')}
              />
            }
            label={<Typography variant="body2">民俗文化</Typography>}
            sx={formControlLabelStyles}
          />
        </Stack>
      </Box>
    </Popover>
  );
}