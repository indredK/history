import { Popover, Stack, Typography, Chip, Box } from '@mui/material';
import { popoverConfig, uiUtils } from '@/config';

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
      {...uiUtils.getPopoverProps()}
    >
      <Box sx={popoverConfig.contentStyles}>
        <Typography variant="subtitle1" gutterBottom>
          时期筛选
        </Typography>
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip 
              label="先秦" 
              size="small" 
              variant="outlined"
              sx={uiUtils.getThemedChipStyles('culture')}
            />
            <Chip 
              label="秦汉" 
              size="small" 
              variant="outlined"
              sx={uiUtils.getThemedChipStyles('culture')}
            />
            <Chip 
              label="魏晋" 
              size="small" 
              variant="outlined"
              sx={uiUtils.getThemedChipStyles('culture')}
            />
            <Chip 
              label="隋唐" 
              size="small" 
              variant="outlined"
              sx={uiUtils.getThemedChipStyles('culture')}
            />
            <Chip 
              label="宋元" 
              size="small" 
              variant="outlined"
              sx={uiUtils.getThemedChipStyles('culture')}
            />
            <Chip 
              label="明清" 
              size="small" 
              variant="outlined"
              sx={uiUtils.getThemedChipStyles('culture')}
            />
          </Stack>
        </Stack>
      </Box>
    </Popover>
  );
}