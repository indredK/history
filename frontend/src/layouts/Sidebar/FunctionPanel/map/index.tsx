import {
  Stack,
  Button
} from '@mui/material';
import {
  Layers,
  Schedule,
  Palette
} from '@mui/icons-material';
import { useState } from 'react';
import { LayerControlPopover } from './LayerControlPopover';
import { TimeControlPopover } from './TimeControlPopover';
import { MapSettingsPopover } from './MapSettingsPopover';

export function MapFunctions() {
  // 图层控制 Popover 状态
  const [layerControlAnchorEl, setLayerControlAnchorEl] = useState<HTMLButtonElement | null>(null);

  // 时间控制 Popover 状态
  const [timeControlAnchorEl, setTimeControlAnchorEl] = useState<HTMLButtonElement | null>(null);

  // 地图设置 Popover 状态
  const [mapSettingsAnchorEl, setMapSettingsAnchorEl] = useState<HTMLButtonElement | null>(null);

  // 处理 Popover 打开
  const handleLayerControlClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setLayerControlAnchorEl(event.currentTarget);
  };

  const handleTimeControlClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setTimeControlAnchorEl(event.currentTarget);
  };

  const handleMapSettingsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMapSettingsAnchorEl(event.currentTarget);
  };

  // 处理 Popover 关闭
  const handleLayerControlClose = () => {
    setLayerControlAnchorEl(null);
  };

  const handleTimeControlClose = () => {
    setTimeControlAnchorEl(null);
  };

  const handleMapSettingsClose = () => {
    setMapSettingsAnchorEl(null);
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
        sx={{
          backgroundColor: 'var(--color-bg-tertiary)',
          borderRadius: 'var(--radius-lg)',
          padding: '6px 12px',
          borderColor: 'var(--color-border-medium)',
          '&:hover': {
            backgroundColor: 'var(--color-bg-quaternary)',
            borderColor: 'var(--color-primary)',
            boxShadow: 'var(--shadow-md)'
          }
        }}
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
        sx={{
          backgroundColor: 'var(--color-bg-tertiary)',
          borderRadius: 'var(--radius-lg)',
          padding: '6px 12px',
          borderColor: 'var(--color-border-medium)',
          '&:hover': {
            backgroundColor: 'var(--color-bg-quaternary)',
            borderColor: 'var(--color-primary)',
            boxShadow: 'var(--shadow-md)'
          }
        }}
      >
        时间控制
      </Button>
      <TimeControlPopover
        anchorEl={timeControlAnchorEl}
        onClose={handleTimeControlClose}
      />

      {/* 地图设置 */}
      <Button
        startIcon={<Palette />}
        variant="outlined"
        fullWidth
        size="small"
        onClick={handleMapSettingsClick}
        sx={{
          backgroundColor: 'var(--color-bg-tertiary)',
          borderRadius: 'var(--radius-lg)',
          padding: '6px 12px',
          borderColor: 'var(--color-border-medium)',
          '&:hover': {
            backgroundColor: 'var(--color-bg-quaternary)',
            borderColor: 'var(--color-primary)',
            boxShadow: 'var(--shadow-md)'
          }
        }}
      >
        地图设置
      </Button>
      <MapSettingsPopover
        anchorEl={mapSettingsAnchorEl}
        onClose={handleMapSettingsClose}
      />
    </Stack>
  );
}

export { LayerControlPopover } from './LayerControlPopover';
export { MapSettingsPopover } from './MapSettingsPopover';
export { TimeControlPopover } from './TimeControlPopover';
