import { Popover, Stack, Typography, FormControlLabel, Checkbox, Box } from '@mui/material';
import { popoverProps, popoverContentStyles, getThemedCheckboxStyles, formControlLabelStyles } from '../popoverStyles';

interface OccupationFilterPopoverProps {
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
}

export function OccupationFilterPopover({ anchorEl, onClose }: OccupationFilterPopoverProps) {
  const open = Boolean(anchorEl);
  const id = open ? 'occupation-filter-popover' : undefined;

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
          职业分类
        </Typography>
        <Stack spacing={1}>
          <FormControlLabel
            control={
              <Checkbox 
                size="small" 
                sx={getThemedCheckboxStyles('people')}
              />
            }
            label={<Typography variant="body2">皇帝君主</Typography>}
            sx={formControlLabelStyles}
          />
          <FormControlLabel
            control={
              <Checkbox 
                size="small" 
                sx={getThemedCheckboxStyles('people')}
              />
            }
            label={<Typography variant="body2">文人学者</Typography>}
            sx={formControlLabelStyles}
          />
          <FormControlLabel
            control={
              <Checkbox 
                size="small" 
                sx={getThemedCheckboxStyles('people')}
              />
            }
            label={<Typography variant="body2">军事将领</Typography>}
            sx={formControlLabelStyles}
          />
          <FormControlLabel
            control={
              <Checkbox 
                size="small" 
                sx={getThemedCheckboxStyles('people')}
              />
            }
            label={<Typography variant="body2">思想家</Typography>}
            sx={formControlLabelStyles}
          />
          <FormControlLabel
            control={
              <Checkbox 
                size="small" 
                sx={getThemedCheckboxStyles('people')}
              />
            }
            label={<Typography variant="body2">艺术家</Typography>}
            sx={formControlLabelStyles}
          />
          <FormControlLabel
            control={
              <Checkbox 
                size="small" 
                sx={getThemedCheckboxStyles('people')}
              />
            }
            label={<Typography variant="body2">科学家</Typography>}
            sx={formControlLabelStyles}
          />
        </Stack>
      </Box>
    </Popover>
  );
}