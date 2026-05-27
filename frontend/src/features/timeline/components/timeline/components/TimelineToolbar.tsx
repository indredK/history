import {
  Add,
  ChevronLeft,
  ChevronRight,
  Remove,
  RestartAlt,
} from '@mui/icons-material';
import { Box, Tooltip, Typography } from '@mui/material';
import { ResponsiveIconButton } from '@/components/ui';

interface TimelineToolbarProps {
  focusLabel?: string | null | undefined;
  visibleRangeLabel: string;
  visibleEventCount: number;
  totalEventCount: number;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onPanLeft: () => void;
  onPanRight: () => void;
}

interface ToolbarButtonProps {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}

function ToolbarButton({ label, onClick, children }: ToolbarButtonProps) {
  return (
    <Tooltip title={label} arrow>
      <ResponsiveIconButton
        aria-label={label}
        onClick={onClick}
        responsive={false}
        sx={{
          width: 34,
          height: 34,
          borderRadius: 1.5,
          color: 'var(--color-text-secondary)',
          '&:hover': {
            color: 'var(--color-primary)',
          },
        }}
      >
        {children}
      </ResponsiveIconButton>
    </Tooltip>
  );
}

export function TimelineToolbar({
  focusLabel,
  visibleRangeLabel,
  visibleEventCount,
  totalEventCount,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onPanLeft,
  onPanRight,
}: TimelineToolbarProps) {
  const summaryItemSx = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.75,
    px: 1.25,
    py: 0.75,
    borderRadius: '999px',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.42)',
  } as const;

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 1.5,
        px: { xs: 1.5, md: 2 },
        pt: 1.5,
        pb: 1.25,
        borderBottom: '1px solid rgba(148, 163, 184, 0.18)',
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          component="h3"
          sx={{
            m: 0,
            color: 'var(--color-text-primary)',
            fontWeight: 600,
            fontSize: '0.98rem',
          }}
        >
          历史时间轴
        </Typography>
        <Typography
          component="div"
          sx={{
            mt: 0.5,
            fontSize: '0.74rem',
            color: 'var(--color-text-secondary)',
          }}
        >
          拖拽滚动 | Shift+滚轮水平滚动 | 方向键移动 | Home/End快速定位
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          gap: 1,
          ml: 'auto',
        }}
      >
        <Box sx={summaryItemSx}>
          <Typography sx={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)' }}>
            当前视野
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', color: 'var(--color-text-primary)' }}>
            {visibleRangeLabel}
          </Typography>
        </Box>
        {focusLabel && (
          <Box sx={summaryItemSx}>
            <Typography sx={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)' }}>
              朝代
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: 'var(--color-text-primary)' }}>
              {focusLabel}
            </Typography>
          </Box>
        )}
        <Box sx={summaryItemSx}>
          <Typography sx={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)' }}>
            事件
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', color: 'var(--color-text-primary)' }}>
            {visibleEventCount}/{totalEventCount}
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            px: 0.5,
          }}
        >
          <Typography sx={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', mr: 0.25 }}>
            {zoomLevel.toFixed(1)}x
          </Typography>
          <ToolbarButton label="向左滚动" onClick={onPanLeft}>
            <ChevronLeft fontSize="small" />
          </ToolbarButton>
          <ToolbarButton label="向右滚动" onClick={onPanRight}>
            <ChevronRight fontSize="small" />
          </ToolbarButton>
          <ToolbarButton label="时间范围放大" onClick={onZoomOut}>
            <Remove fontSize="small" />
          </ToolbarButton>
          <ToolbarButton label="重置时间范围" onClick={onResetZoom}>
            <RestartAlt fontSize="small" />
          </ToolbarButton>
          <ToolbarButton label="时间范围缩小" onClick={onZoomIn}>
            <Add fontSize="small" />
          </ToolbarButton>
        </Box>
      </Box>
    </Box>
  );
}
