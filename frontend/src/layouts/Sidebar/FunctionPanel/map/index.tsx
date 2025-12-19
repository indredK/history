import {
  Stack,
  Button
} from '@mui/material';
import {
  Layers,
  Schedule,
} from '@mui/icons-material';
import { useState } from 'react';
import { LayerControlPopover } from './LayerControlPopover';
import { TimeControlPopover } from './TimeControlPopover';
import { buttonConfig } from '@/config';

export function MapFunctions() {
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
