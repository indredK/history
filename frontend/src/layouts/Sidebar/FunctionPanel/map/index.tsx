import {
  Stack,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Layers,
  Schedule,
} from '@mui/icons-material';
import { useState } from 'react';
import { LayerControlPopover } from './LayerControlPopover';
import { TimeControlPopover } from './TimeControlPopover';
import { buttonConfig } from '@/config';

interface MapFunctionsProps {
  collapsed?: boolean;
}

export function MapFunctions({ collapsed = false }: MapFunctionsProps) {
  // 图层控制 Popover 状态
  const [layerControlAnchorEl, setLayerControlAnchorEl] = useState<HTMLButtonElement | null>(null);

  // 时间控制 Popover 状态
  const [timeControlAnchorEl, setTimeControlAnchorEl] = useState<HTMLButtonElement | null>(null);

  // 处理 Popover 打开
  const handleLayerControlClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setLayerControlAnchorEl(event.currentTarget);
  };

  const handleTimeControlClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setTimeControlAnchorEl(event.currentTarget);
  };

  // 处理 Popover 关闭
  const handleLayerControlClose = () => {
    setLayerControlAnchorEl(null);
  };

  const handleTimeControlClose = () => {
    setTimeControlAnchorEl(null);
  };

  // 折叠模式：仅显示图标按钮
  if (collapsed) {
    return (
      <>
        <Stack
          direction="row"
          spacing={1}
          sx={{ justifyContent: 'center', px: 1, py: 0.5 }}
        >
          <Tooltip title="图层控制" placement="top">
            <IconButton
              onClick={handleLayerControlClick}
              size="small"
              sx={{
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                background: 'rgba(199, 143, 69, 0.08)',
                border: '1px solid var(--theme-glass-border)',
                color: 'var(--color-text-primary)',
                width: 36,
                height: 36,
                '&:hover': {
                  background: 'rgba(199, 143, 69, 0.15)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <Layers fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="时间控制" placement="top">
            <IconButton
              onClick={handleTimeControlClick}
              size="small"
              sx={{
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                background: 'rgba(199, 143, 69, 0.08)',
                border: '1px solid var(--theme-glass-border)',
                color: 'var(--color-text-primary)',
                width: 36,
                height: 36,
                '&:hover': {
                  background: 'rgba(199, 143, 69, 0.15)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <Schedule fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
        <LayerControlPopover
          anchorEl={layerControlAnchorEl}
          onClose={handleLayerControlClose}
        />
        <TimeControlPopover
          anchorEl={timeControlAnchorEl}
          onClose={handleTimeControlClose}
        />
      </>
    );
  }

  return (
    <Stack spacing={1}>
      {/* 图层控制 */}
      <Button
        startIcon={<Layers />}
        variant="outlined"
        fullWidth
        size="small"
        onClick={handleLayerControlClick}
        sx={buttonConfig.functionButton}
      >
        图层控制
      </Button>
      <LayerControlPopover
        anchorEl={layerControlAnchorEl}
        onClose={handleLayerControlClose}
      />

      {/* 时间控制 */}
      <Button
        startIcon={<Schedule />}
        variant="outlined"
        fullWidth
        size="small"
        onClick={handleTimeControlClick}
        sx={buttonConfig.functionButton}
      >
        时间控制
      </Button>
      <TimeControlPopover
        anchorEl={timeControlAnchorEl}
        onClose={handleTimeControlClose}
      />
    </Stack>
  );
}
