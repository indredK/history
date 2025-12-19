import { Popover, Stack, Typography, Chip, Box } from '@mui/material';
import { popoverConfig, uiUtils } from '@/config';

interface PeopleDynastyFilterPopoverProps {
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
}

export function PeopleDynastyFilterPopover({ anchorEl, onClose }: PeopleDynastyFilterPopoverProps) {
  const open = Boolean(anchorEl);
  const id = open ? 'people-dynasty-filter-popover' : undefined;

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
          朝代筛选
        </Typography>
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip 
              label="春秋战国" 
              size="small" 
              variant="outlined"
              sx={uiUtils.getThemedChipStyles('people')}
            />
            <Chip 
              label="秦汉" 
              size="small" 
              variant="outlined"
              sx={uiUtils.getThemedChipStyles('people')}
            />
            <Chip 
              label="魏晋南北朝" 
              size="small" 
              variant="outlined"
              sx={uiUtils.getThemedChipStyles('people')}
            />
            <Chip 
              label="隋唐" 
              size="small" 
              variant="outlined"
              sx={uiUtils.getThemedChipStyles('people')}
            />
            <Chip 
              label="宋元" 
              size="small" 
              variant="outlined"
              sx={uiUtils.getThemedChipStyles('people')}
            />
            <Chip 
              label="明清" 
              size="small" 
              variant="outlined"
              sx={uiUtils.getThemedChipStyles('people')}
            />
          </Stack>
        </Stack>
      </Box>
    </Popover>
  );
}