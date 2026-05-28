import { Popover, Stack, Typography, Box, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { PlayArrow, Pause, SkipPrevious, SkipNext } from '@mui/icons-material';
import { useMapStore } from '@/store';
import { popoverConfig, commonStyles, uiUtils } from '@/config';

interface TimeControlPopoverProps {
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
}

function getStepYears(speed: 'slow' | 'medium' | 'fast'): number {
  switch (speed) {
    case 'slow':
      return 1;
    case 'fast':
      return 10;
    case 'medium':
    default:
      return 5;
  }
}

export function TimeControlPopover({ anchorEl, onClose }: TimeControlPopoverProps) {
  const {
    historicalFocusMode,
    focusYear,
    playheadYear,
    playbackState,
    playbackSpeed,
    play,
    pause,
    stepPrevious,
    stepNext,
    setPlaybackSpeed,
  } = useMapStore();
  const open = Boolean(anchorEl);
  const id = open ? 'time-control-popover' : undefined;
  const stepYears = getStepYears(playbackSpeed);

  return (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      {...uiUtils.getPopoverProps()}
    >
      <Box sx={{ ...popoverConfig.contentStyles, minWidth: 250 }}>
        <Typography variant="subtitle1" gutterBottom>
          时间控制
        </Typography>
        <Stack spacing={2}>
          <Box
            sx={{
              px: 1.25,
              py: 1,
              borderRadius: '10px',
              background: 'rgba(var(--glass-surface-soft-rgb, 255,255,255), 0.28)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
            }}
          >
            <Typography variant="caption" sx={commonStyles.caption}>
              当前模式
            </Typography>
            <Typography variant="body2">
              {historicalFocusMode === 'event'
                ? '事件时间段'
                : historicalFocusMode === 'dynasty'
                  ? '朝代起点'
                  : historicalFocusMode === 'playback'
                    ? '自由播放'
                    : '未选择'}
            </Typography>
            <Typography variant="caption" sx={{ ...commonStyles.caption, mt: 0.5, display: 'block' }}>
              当前年份：{playheadYear ?? focusYear ?? '-'}
            </Typography>
          </Box>

          {/* 播放控制 */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <ToggleButtonGroup 
              size="small" 
              exclusive
              value={playbackState === 'playing' ? 'play' : 'pause'}
              sx={uiUtils.getThemedToggleButtonStyles('map')}
            >
              <ToggleButton
                value="previous"
                onClick={() => stepPrevious(stepYears)}
              >
                <SkipPrevious />
              </ToggleButton>
              <ToggleButton
                value="play"
                selected={playbackState === 'playing'}
                onClick={play}
              >
                <PlayArrow />
              </ToggleButton>
              <ToggleButton
                value="pause"
                selected={playbackState !== 'playing'}
                onClick={pause}
              >
                <Pause />
              </ToggleButton>
              <ToggleButton
                value="next"
                onClick={() => stepNext(stepYears)}
              >
                <SkipNext />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* 播放速度 */}
          <Box>
            <Typography variant="caption" sx={commonStyles.caption}>
              播放速度
            </Typography>
            <Stack sx={{ mt: 1 }}>
              <ToggleButtonGroup 
                size="small" 
                exclusive 
                value={playbackSpeed}
                onChange={(_, value: 'slow' | 'medium' | 'fast' | null) => {
                  if (value) setPlaybackSpeed(value);
                }}
                sx={uiUtils.getThemedToggleButtonStyles('map')}
              >
                <ToggleButton value="slow">慢速</ToggleButton>
                <ToggleButton value="medium">中速</ToggleButton>
                <ToggleButton value="fast">快速</ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Box>

          <Typography variant="caption" sx={commonStyles.caption}>
            单步推进：{stepYears} 年
          </Typography>
        </Stack>
      </Box>
    </Popover>
  );
}
