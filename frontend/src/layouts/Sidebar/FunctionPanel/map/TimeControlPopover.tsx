import { Popover, Stack, Typography, Box, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { PlayArrow, Pause, SkipPrevious, SkipNext } from '@mui/icons-material';

interface TimeControlPopoverProps {
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
}

export function TimeControlPopover({ anchorEl, onClose }: TimeControlPopoverProps) {
  const open = Boolean(anchorEl);
  const id = open ? 'time-control-popover' : undefined;

  return (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
      transformOrigin={{ vertical: 'center', horizontal: 'left' }}
      disableScrollLock
      elevation={8}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(135deg, var(--color-bg-card) 0%, var(--color-bg-secondary) 100%)',
            border: '1px solid var(--color-border-medium)',
            boxShadow: 'var(--shadow-xl), var(--shadow-glow)',
            backdropFilter: 'blur(10px)',
            p: 2
          }
        }
      }}
    >
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
        时间控制
      </Typography>
      <Stack spacing={2}>
        {/* 播放控制 */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <ToggleButtonGroup size="small" exclusive>
            <ToggleButton value="previous">
              <SkipPrevious />
            </ToggleButton>
            <ToggleButton value="play">
              <PlayArrow />
            </ToggleButton>
            <ToggleButton value="pause">
              <Pause />
            </ToggleButton>
            <ToggleButton value="next">
              <SkipNext />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* 播放速度 */}
        <Box>
          <Typography variant="caption" sx={{ color: 'var(--color-text-tertiary)' }}>
            播放速度
          </Typography>
          <Stack sx={{ mt: 1 }}>
            <ToggleButtonGroup size="small" exclusive defaultValue="medium">
              <ToggleButton value="slow">慢速</ToggleButton>
              <ToggleButton value="medium">中速</ToggleButton>
              <ToggleButton value="fast">快速</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Box>
      </Stack>
    </Popover>
  );
}