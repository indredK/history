import { Box, Popover, Stack, Typography, Chip } from '@mui/material';
import { popoverProps, popoverContentStyles, getThemedChipStyles } from '../popoverStyles';

interface DynastyFilterPopoverProps {
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
}

export function DynastyFilterPopover({ anchorEl, onClose }: DynastyFilterPopoverProps) {
  const open = Boolean(anchorEl);
  const id = open ? 'dynasty-filter-popover' : undefined;

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
          朝代筛选
        </Typography>
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip 
              label="秦朝" 
              size="small" 
              variant="outlined"
              sx={getThemedChipStyles('timeline')}
            />
            <Chip 
              label="汉朝" 
              size="small" 
              variant="outlined"
              sx={getThemedChipStyles('timeline')}
            />
            <Chip 
              label="唐朝" 
              size="small" 
              variant="outlined"
              sx={getThemedChipStyles('timeline')}
            />
            <Chip 
              label="宋朝" 
              size="small" 
              variant="outlined"
              sx={getThemedChipStyles('timeline')}
            />
            <Chip 
              label="明朝" 
              size="small" 
              variant="outlined"
              sx={getThemedChipStyles('timeline')}
            />
            <Chip 
              label="清朝" 
              size="small" 
              variant="outlined"
              sx={getThemedChipStyles('timeline')}
            />
          </Stack>
        </Stack>
      </Box>
    </Popover>
  );
}
