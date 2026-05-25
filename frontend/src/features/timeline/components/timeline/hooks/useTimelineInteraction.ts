/**
 * 时间轴交互 hook —— 缩放/拖拽/滚轮/键盘
 *
 * 把所有原本散落在 TimelineChart 里的交互逻辑收拢到一处，
 * 主组件只关心数据渲染和 JSX。
 */

import { useCallback, useEffect, useState, type RefObject } from 'react';
import { TIMELINE_CONFIG } from '../config/timelineConfig';

export type TimeRange = [number, number];

interface UseTimelineInteractionArgs {
  svgRef: RefObject<SVGSVGElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  timeRange: TimeRange | null;
  setTimeRange: (range: TimeRange) => void;
  originalRangeRef: RefObject<TimeRange | null>;
  onZoomChange: (zoom: number) => void;
}

export function useTimelineInteraction({
  svgRef,
  containerRef,
  timeRange,
  setTimeRange,
  originalRangeRef,
  onZoomChange,
}: UseTimelineInteractionArgs) {
  // 拖拽状态
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    startX: number;
    startRange: TimeRange | null;
  }>({
    isDragging: false,
    startX: 0,
    startRange: null,
  });

  // 滚轮 —— 缩放 / Shift+滚轮水平滚动
  const handleWheel = useCallback(
    (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (!timeRange || !originalRangeRef.current) return;

      const [start, end] = timeRange;
      const currentRange = end - start;

      // Shift + 滚轮 —— 水平平移
      if (event.shiftKey) {
        const { pan } = TIMELINE_CONFIG;
        const panStep = Math.max(currentRange * pan.factor * 2, pan.minStep * 2);
        const [originalStart, originalEnd] = originalRangeRef.current;
        const scrollDelta =
          Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;

        let newStart: number, newEnd: number;
        if (scrollDelta > 0) {
          newEnd = Math.min(originalEnd, end + panStep);
          newStart = newEnd - currentRange;
        } else {
          newStart = Math.max(originalStart, start - panStep);
          newEnd = newStart + currentRange;
        }
        setTimeRange([newStart, newEnd]);
        return;
      }

      // 以鼠标位置为中心缩放
      const svgElement = svgRef.current;
      if (!svgElement) return;

      const rect = svgElement.getBoundingClientRect();
      const { dimensions } = TIMELINE_CONFIG;
      const mouseX = event.clientX - rect.left - dimensions.margin.left;
      const chartWidth = rect.width - dimensions.margin.left - dimensions.margin.right;
      const mouseRatio = mouseX / chartWidth;
      const mouseYear = start + (end - start) * mouseRatio;

      const { zoom } = TIMELINE_CONFIG;
      const zoomFactor = event.deltaY > 0 ? zoom.factor.out : zoom.factor.in;
      const newRange = currentRange * zoomFactor;

      const leftRatio = (mouseYear - start) / currentRange;
      const rightRatio = (end - mouseYear) / currentRange;

      let newStart = mouseYear - newRange * leftRatio;
      let newEnd = mouseYear + newRange * rightRatio;

      const [originalStart, originalEnd] = originalRangeRef.current;
      newStart = Math.max(originalStart, newStart);
      newEnd = Math.min(originalEnd, newEnd);

      setTimeRange([newStart, newEnd]);
      onZoomChange((originalEnd - originalStart) / (newEnd - newStart));
    },
    [timeRange, onZoomChange, originalRangeRef, setTimeRange, svgRef]
  );

  // 鼠标按下 —— 开始拖拽
  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      if (event.button !== 0 || !timeRange) return;
      setDragState({
        isDragging: true,
        startX: event.clientX,
        startRange: [timeRange[0], timeRange[1]],
      });
      const svgElement = svgRef.current;
      if (svgElement) svgElement.style.cursor = 'grabbing';
      event.preventDefault();
    },
    [timeRange, svgRef]
  );

  // 鼠标移动 —— 拖拽中
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!dragState.isDragging || !dragState.startRange || !originalRangeRef.current) return;

      const deltaX = event.clientX - dragState.startX;
      const svgElement = svgRef.current;
      if (!svgElement) return;

      const rect = svgElement.getBoundingClientRect();
      const { dimensions } = TIMELINE_CONFIG;
      const chartWidth = rect.width - dimensions.margin.left - dimensions.margin.right;
      const pixelToYear = (dragState.startRange[1] - dragState.startRange[0]) / chartWidth;
      const yearDelta = -deltaX * pixelToYear;

      const [originalStart, originalEnd] = originalRangeRef.current;
      const [dragStart, dragEnd] = dragState.startRange;
      const currentRange = dragEnd - dragStart;

      let newStart = dragStart + yearDelta;
      let newEnd = dragEnd + yearDelta;

      if (newStart < originalStart) {
        newStart = originalStart;
        newEnd = newStart + currentRange;
      }
      if (newEnd > originalEnd) {
        newEnd = originalEnd;
        newStart = newEnd - currentRange;
      }

      setTimeRange([newStart, newEnd]);
    },
    [dragState.isDragging, dragState.startRange, dragState.startX, originalRangeRef, setTimeRange, svgRef]
  );

  // 鼠标松开 —— 结束拖拽
  const handleMouseUp = useCallback(() => {
    if (dragState.isDragging) {
      setDragState({ isDragging: false, startX: 0, startRange: null });
      const svgElement = svgRef.current;
      if (svgElement) svgElement.style.cursor = 'grab';
    }
  }, [dragState.isDragging, svgRef]);

  // 键盘 —— 方向键 / Home / End
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!timeRange || !originalRangeRef.current) return;

      const [start, end] = timeRange;
      const currentRange = end - start;
      const { pan } = TIMELINE_CONFIG;
      const panStep = Math.max(currentRange * pan.factor, pan.minStep);
      const [originalStart, originalEnd] = originalRangeRef.current;

      switch (event.key) {
        case 'ArrowLeft': {
          event.preventDefault();
          const newStartLeft = Math.max(originalStart, start - panStep);
          setTimeRange([newStartLeft, newStartLeft + currentRange]);
          break;
        }
        case 'ArrowRight': {
          event.preventDefault();
          const newEndRight = Math.min(originalEnd, end + panStep);
          setTimeRange([newEndRight - currentRange, newEndRight]);
          break;
        }
        case 'Home':
          event.preventDefault();
          setTimeRange([originalStart, originalStart + currentRange]);
          break;
        case 'End':
          event.preventDefault();
          setTimeRange([originalEnd - currentRange, originalEnd]);
          break;
      }
    },
    [timeRange, originalRangeRef, setTimeRange]
  );

  // 事件监听绑定
  useEffect(() => {
    const svgElement = svgRef.current;
    const containerElement = containerRef.current;
    if (!svgElement || !containerElement) return;

    svgElement.style.cursor = 'grab';
    svgElement.setAttribute('tabindex', '0');
    svgElement.style.outline = 'none';
    svgElement.style.userSelect = 'none';

    containerElement.addEventListener('wheel', handleWheel, { passive: false });
    svgElement.addEventListener('mousedown', handleMouseDown, { passive: false });
    svgElement.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      containerElement.removeEventListener('wheel', handleWheel);
      svgElement.removeEventListener('mousedown', handleMouseDown);
      svgElement.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [containerRef, svgRef, handleWheel, handleMouseDown, handleKeyDown, handleMouseMove, handleMouseUp]);
}

/**
 * 缩放/平移命令式 API，用于 useImperativeHandle 暴露给父组件
 */
export function createTimelineCommands(
  timeRangeRef: RefObject<TimeRange | null>,
  originalRangeRef: RefObject<TimeRange | null>,
  setTimeRange: (range: TimeRange) => void,
  onZoomChange: (zoom: number) => void
) {
  return {
    zoomIn: () => {
      const range = timeRangeRef.current;
      if (!range || !originalRangeRef.current) return;
      const [start, end] = range;
      const center = (start + end) / 2;
      const newRange = (end - start) / 1.5;
      setTimeRange([center - newRange / 2, center + newRange / 2]);
      onZoomChange(1.5);
    },
    zoomOut: () => {
      const range = timeRangeRef.current;
      if (!range || !originalRangeRef.current) return;
      const [start, end] = range;
      const center = (start + end) / 2;
      const newRange = (end - start) * 1.5;
      const [originalStart, originalEnd] = originalRangeRef.current;
      const newStart = Math.max(originalStart, center - newRange / 2);
      const newEnd = Math.min(originalEnd, center + newRange / 2);
      setTimeRange([newStart, newEnd]);
      onZoomChange(0.67);
    },
    resetZoom: () => {
      if (originalRangeRef.current) {
        setTimeRange(originalRangeRef.current);
        onZoomChange(1);
      }
    },
    panLeft: () => {
      const range = timeRangeRef.current;
      if (!range || !originalRangeRef.current) return;
      const [start, end] = range;
      const currentRange = end - start;
      const { pan } = TIMELINE_CONFIG;
      const panStep = Math.max(currentRange * pan.factor, pan.minStep);
      const [originalStart] = originalRangeRef.current;
      const newStart = Math.max(originalStart, start - panStep);
      setTimeRange([newStart, newStart + currentRange]);
    },
    panRight: () => {
      const range = timeRangeRef.current;
      if (!range || !originalRangeRef.current) return;
      const [start, end] = range;
      const currentRange = end - start;
      const { pan } = TIMELINE_CONFIG;
      const panStep = Math.max(currentRange * pan.factor, pan.minStep);
      const [, originalEnd] = originalRangeRef.current;
      const newEnd = Math.min(originalEnd, end + panStep);
      setTimeRange([newEnd - currentRange, newEnd]);
    },
  };
}
