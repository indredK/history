/**
 * 时间轴工具栏 —— 缩放/平移按钮
 */

import type { CSSProperties } from 'react';
import { timelineStyles } from '../styles/timelineStyles';

interface TimelineToolbarProps {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onPanLeft: () => void;
  onPanRight: () => void;
}

interface ToolbarButtonProps {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  extraStyle?: CSSProperties | undefined;
}

function ToolbarButton({ onClick, title, children, extraStyle }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{ ...timelineStyles.button, ...(extraStyle || {}) }}
      onMouseEnter={(e) => {
        Object.assign(e.currentTarget.style, timelineStyles.buttonHover);
      }}
      onMouseLeave={(e) => {
        Object.assign(e.currentTarget.style, timelineStyles.buttonDefault);
      }}
    >
      {children}
    </button>
  );
}

export function TimelineToolbar({
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onPanLeft,
  onPanRight,
}: TimelineToolbarProps) {
  return (
    <div style={timelineStyles.header}>
      <div>
        <h3 style={timelineStyles.title}>历史时间轴</h3>
        <div style={timelineStyles.helpText}>
          拖拽滚动 | Shift+滚轮水平滚动 | 方向键移动 | Home/End快速定位
        </div>
      </div>
      <div style={timelineStyles.controls}>
        <span style={timelineStyles.zoomText}>时间缩放: {zoomLevel.toFixed(1)}x</span>

        {/* 水平滚动 */}
        <ToolbarButton onClick={onPanLeft} title="向左滚动" extraStyle={timelineStyles.panButton}>
          ◀
        </ToolbarButton>
        <ToolbarButton onClick={onPanRight} title="向右滚动" extraStyle={timelineStyles.panButton}>
          ▶
        </ToolbarButton>

        {/* 缩放 */}
        <ToolbarButton onClick={onZoomOut} title="时间范围放大">
          −
        </ToolbarButton>
        <ToolbarButton onClick={onResetZoom} title="重置时间范围" extraStyle={timelineStyles.resetButton}>
          ⌂
        </ToolbarButton>
        <ToolbarButton onClick={onZoomIn} title="时间范围缩小">
          +
        </ToolbarButton>
      </div>
    </div>
  );
}
