import { Popover, Stack, Typography, Chip, Box } from '@mui/material';
import { popoverProps, popoverContentStyles, getThemedChipStyles } from '../popoverStyles';

interface PeriodFilterPopoverProps {
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
}

export function PeriodFilterPopover({ anchorEl, onClose }: PeriodFilterPopoverProps) {
  const open = Boolean(anchorEl);
  const id = open ? 'period-filter-popover' : undefined;

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
          时期筛选
        </Typography>
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip 
              label="先秦" 
              size="small" 
              variant="outlined"
              sx={getThemedChipStyles('culture')}
            />
            <Chip 
              label="秦汉" 
              size="small" 
              variant="outlined"
              sx={getThemedChipStyles('culture')}
            />
            <Chip 
              label="魏晋" 
              size="small" 
              variant="outlined"
              sx={getThemedChipStyles('culture')}
            />
            <Chip 
              label="隋唐" 
              size="small" 
              variant="outlined"
              sx={getThemedChipStyles('culture')}
            />
            <Chip 
              label="宋元" 
              size="small" 
              variant="outlined"
              sx={getThemedChipStyles('culture')}
            />
            <Chip 
              label="明清" 
              size="small" 
              variant="outlined"
              sx={getThemedChipStyles('culture')}
            />
          </Stack>
        </Stack>
      </Box>
    </Popover>
  );
}