import { useEffect, useRef, forwardRef, useImperativeHandle, useState, CSSProperties, useCallback } from 'react';
import * as d3 from 'd3';
import { TIMELINE_CONFIG } from '../config/timelineConfig';
import { TimelineRenderer } from '../utils/timelineRenderer';
import type { TimelineChartProps, TimelineChartRef } from '../types';

// Timeline styles configuration
const timelineStyles: Record<string, CSSProperties> = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: '1px solid rgba(99, 102, 241, 0.15)',
    borderRadius: '8px',
    backgroundColor: 'rgba(248, 250, 252, 0.1)',
    backdropFilter: 'blur(2px)',
  },
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: 'rgba(71, 85, 105, 0.7)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px 8px 16px',
    borderBottom: '1px solid rgba(99, 102, 241, 0.15)',
  },
  title: {
    margin: 0,
    color: '#334155',
    fontWeight: '600',
    fontSize: '16px',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  helpText: {
    fontSize: '10px',
    color: 'rgba(71, 85, 105, 0.6)',
    marginLeft: '12px',
    fontStyle: 'italic',
  },
  zoomText: {
    fontSize: '12px',
    color: 'rgba(71, 85, 105, 0.7)',
    marginRight: '8px',
  },
  button: {
    width: '28px',
    height: '28px',
    border: '1px solid rgba(99, 102, 241, 0.25)',
    borderRadius: '6px',
    backgroundColor: 'rgba(248, 250, 252, 0.9)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    color: 'rgba(99, 102, 241, 0.8)',
    transition: 'all 0.2s ease',
  },
  resetButton: {
    fontSize: '12px',
  },
  panButton: {
    fontSize: '16px',
    fontWeight: 'bold',
  },
  svgContainer: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  svg: {
    width: '100%',
    height: '100%',
    display: 'block',
    touchAction: 'none',
  },
  buttonHover: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  buttonDefault: {
    backgroundColor: 'rgba(248, 250, 252, 0.9)',
    borderColor: 'rgba(99, 102, 241, 0.25)',
  },
};

export const TimelineChart = forwardRef<TimelineChartRef, TimelineChartProps>(
  ({ events, favorites, onZoomChange, zoomLevel, onZoomIn, onZoomOut, onResetZoom, onPanLeft, onPanRight }, ref) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [timeRange, setTimeRange] = useState<[number, number] | null>(null);
    const originalRangeRef = useRef<[number, number] | null>(null);

    useImperativeHandle(ref, () => ({
      zoomIn: () => {
        if (!timeRange || !originalRangeRef.current) return;
        const [start, end] = timeRange;
        const center = (start + end) / 2;
        const range = (end - start) / 1.5;
        const newRange: [number, number] = [center - range / 2, center + range / 2];
        setTimeRange(newRange);
        onZoomChange(1.5);
      },
      zoomOut: () => {
        if (!timeRange || !originalRangeRef.current) return;
        const [start, end] = timeRange;
        const center = (start + end) / 2;
        const range = (end - start) * 1.5;
        const [originalStart, originalEnd] = originalRangeRef.current;
        const newStart = Math.max(originalStart, center - range / 2);
        const newEnd = Math.min(originalEnd, center + range / 2);
        const newRange: [number, number] = [newStart, newEnd];
        setTimeRange(newRange);
        onZoomChange(0.67);
      },
      resetZoom: () => {
        if (originalRangeRef.current) {
          setTimeRange(originalRangeRef.current);
          onZoomChange(1);
        }
      },
      panLeft: () => {
        if (!timeRange || !originalRangeRef.current) return;
        const [start, end] = timeRange;
        const currentRange = end - start;
        const { pan } = TIMELINE_CONFIG;
        const panStep = Math.max(currentRange * pan.factor, pan.minStep);
        
        const [originalStart] = originalRangeRef.current;
        const newStart = Math.max(originalStart, start - panStep);
        const newEnd = newStart + currentRange;
        
        setTimeRange([newStart, newEnd]);
      },
      panRight: () => {
        if (!timeRange || !originalRangeRef.current) return;
        const [start, end] = timeRange;
        const currentRange = end - start;
        const { pan } = TIMELINE_CONFIG;
        const panStep = Math.max(currentRange * pan.factor, pan.minStep);
        
        const [, originalEnd] = originalRangeRef.current;
        const newEnd = Math.min(originalEnd, end + panStep);
        const newStart = newEnd - currentRange;
        
        setTimeRange([newStart, newEnd]);
      }
    }));

    // 初始化时间范围
    useEffect(() => {
      if (events.length === 0) return;
      
      const sortedEvents = [...events].sort((a, b) => a.startYear - b.startYear);
      const minYear = d3.min(sortedEvents, d => d.startYear) || 0;
      const maxYear = d3.max(sortedEvents, d => d.endYear || d.startYear) || 0;
      const range: [number, number] = [minYear - 50, maxYear + 50];
      
      if (!originalRangeRef.current) {
        originalRangeRef.current = range;
        setTimeRange(range);
      }
    }, [events]);

    useEffect(() => {
      if (!svgRef.current || !containerRef.current || events.length === 0 || !timeRange) return;

      const container = containerRef.current;
      const svg = d3.select(svgRef.current);
      
      // 清除之前的内容
      svg.selectAll('*').remove();

      // 设置尺寸
      const containerRect = container.getBoundingClientRect();
      const { dimensions } = TIMELINE_CONFIG;
      const width = containerRect.width - dimensions.margin.left - dimensions.margin.right;
      const height = dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

      svg.attr('width', containerRect.width).attr('height', dimensions.height);

      const g = svg.append('g')
        .attr('transform', `translate(${dimensions.margin.left},${dimensions.margin.top})`);

      // 数据处理
      const sortedEvents = [...events].sort((a, b) => a.startYear - b.startYear);

      // 比例尺
      const xScale = d3.scaleLinear()
        .domain(timeRange)
        .range([0, width]);

      // 创建渲染器
      const renderer = new TimelineRenderer(g, width, height, xScale, favorites);

      // 渲染时间轴组件
      renderer.renderMainTimeline();
      renderer.renderStandardAxis();
      
      // 过滤可见事件
      const visibleEvents = sortedEvents.filter(event => {
        const eventEnd = event.endYear || event.startYear;
        return event.startYear <= timeRange[1] && eventEnd >= timeRange[0];
      });

      renderer.renderEvents(visibleEvents);
      
      // 计算当前缩放级别
      const currentZoom = originalRangeRef.current ? 
        (originalRangeRef.current[1] - originalRangeRef.current[0]) / (timeRange[1] - timeRange[0]) : 1;
      
      renderer.renderEventLabels(visibleEvents, currentZoom);
      renderer.renderEventYears(visibleEvents, currentZoom);
    }, [events, favorites, timeRange]);

    // 事件处理器定义 - 使用useCallback确保稳定性
    const handleWheel = useCallback((event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      
      if (!timeRange || !originalRangeRef.current) return;
      
      const [start, end] = timeRange;
      const currentRange = end - start;
      
      // 按住 Shift 键时进行水平滚动
      if (event.shiftKey) {
        console.log('Shift+滚轮事件触发', { 
          deltaX: event.deltaX, 
          deltaY: event.deltaY, 
          shiftKey: event.shiftKey 
        });
        
        const { pan } = TIMELINE_CONFIG;
        // 增加滚动步长，让滚动更明显
        const panStep = Math.max(currentRange * pan.factor * 2, pan.minStep * 2);
        
        const [originalStart, originalEnd] = originalRangeRef.current;
        
        let newStart: number, newEnd: number;
        
        // 检查 deltaX 和 deltaY，支持不同的滚动方向
        const scrollDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
        
        if (scrollDelta > 0) {
          // 向右滚动
          newEnd = Math.min(originalEnd, end + panStep);
          newStart = newEnd - currentRange;
        } else {
          // 向左滚动
          newStart = Math.max(originalStart, start - panStep);
          newEnd = newStart + currentRange;
        }
        
        console.log('水平滚动执行', { 
          oldRange: [start, end], 
          newRange: [newStart, newEnd], 
          panStep,
          scrollDelta
        });
        
        setTimeRange([newStart, newEnd]);
        return;
      }
      
      // 正常缩放处理
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
      
      // 以鼠标位置为中心缩放
      const leftRatio = (mouseYear - start) / currentRange;
      const rightRatio = (end - mouseYear) / currentRange;
      
      let newStart = mouseYear - newRange * leftRatio;
      let newEnd = mouseYear + newRange * rightRatio;
      
      // 限制缩放范围
      const [originalStart, originalEnd] = originalRangeRef.current;
      newStart = Math.max(originalStart, newStart);
      newEnd = Math.min(originalEnd, newEnd);
      
      setTimeRange([newStart, newEnd]);
      onZoomChange((originalEnd - originalStart) / (newEnd - newStart));
    }, [timeRange, onZoomChange]);

    // 拖拽状态
    const [dragState, setDragState] = useState<{
      isDragging: boolean;
      startX: number;
      startRange: [number, number] | null;
    }>({
      isDragging: false,
      startX: 0,
      startRange: null
    });

    const handleMouseDown = useCallback((event: MouseEvent) => {
      if (event.button !== 0 || !timeRange) return;
      
      setDragState({
        isDragging: true,
        startX: event.clientX,
        startRange: [timeRange[0], timeRange[1]]
      });
      
      const svgElement = svgRef.current;
      if (svgElement) {
        svgElement.style.cursor = 'grabbing';
      }
      event.preventDefault();
    }, [timeRange]);

    const handleMouseMove = useCallback((event: MouseEvent) => {
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
      
      // 限制拖拽范围
      if (newStart < originalStart) {
        newStart = originalStart;
        newEnd = newStart + currentRange;
      }
      if (newEnd > originalEnd) {
        newEnd = originalEnd;
        newStart = newEnd - currentRange;
      }
      
      setTimeRange([newStart, newEnd]);
    }, [dragState.isDragging, dragState.startRange, dragState.startX]);

    const handleMouseUp = useCallback(() => {
      if (dragState.isDragging) {
        setDragState({
          isDragging: false,
          startX: 0,
          startRange: null
        });
        
        const svgElement = svgRef.current;
        if (svgElement) {
          svgElement.style.cursor = 'grab';
        }
      }
    }, [dragState.isDragging]);

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
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
    }, [timeRange]);

    // 事件监听器绑定
    useEffect(() => {
      const svgElement = svgRef.current;
      const containerElement = containerRef.current;
      if (!svgElement || !containerElement) return;

      // 设置SVG样式
      svgElement.style.cursor = 'grab';
      svgElement.setAttribute('tabindex', '0');
      svgElement.style.outline = 'none';
      svgElement.style.userSelect = 'none';
      
      // 绑定事件 - 滚轮事件绑定到容器，其他事件绑定到SVG
      containerElement.addEventListener('wheel', handleWheel, { passive: false });
      svgElement.addEventListener('mousedown', handleMouseDown, { passive: false });
      svgElement.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);

      // 清理函数
      return () => {
        containerElement.removeEventListener('wheel', handleWheel);
        svgElement.removeEventListener('mousedown', handleMouseDown);
        svgElement.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }, [handleWheel, handleMouseDown, handleKeyDown, handleMouseMove, handleMouseUp]);

    // 如果正在加载或没有数据，显示相应状态
    if (events.length === 0) {
      return (
        <div style={timelineStyles.emptyState}>
          暂无匹配的历史事件
        </div>
      );
    }

    return (
      <div 
        className="d3-timeline-container"
        style={timelineStyles.container}
      >
        {/* 标题和控件 */}
        <div style={timelineStyles.header}>
          <div>
            <h3 style={timelineStyles.title}>
              历史时间轴
            </h3>
            <div style={timelineStyles.helpText}>
              拖拽滚动 | Shift+滚轮水平滚动 | 方向键移动 | Home/End快速定位
            </div>
          </div>
          <div style={timelineStyles.controls}>
            <span style={timelineStyles.zoomText}>
              时间缩放: {zoomLevel.toFixed(1)}x
            </span>
            
            {/* 水平滚动控制 */}
            <button
              onClick={onPanLeft}
              style={{ ...timelineStyles.button, ...timelineStyles.panButton }}
              title="向左滚动"
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, timelineStyles.buttonHover);
              }}
              onMouseLeave={(e) => {
                Object.assign(e.currentTarget.style, timelineStyles.buttonDefault);
              }}
            >
              ◀
            </button>
            <button
              onClick={onPanRight}
              style={{ ...timelineStyles.button, ...timelineStyles.panButton }}
              title="向右滚动"
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, timelineStyles.buttonHover);
              }}
              onMouseLeave={(e) => {
                Object.assign(e.currentTarget.style, timelineStyles.buttonDefault);
              }}
            >
              ▶
            </button>
            
            {/* 缩放控制 */}
            <button
              onClick={onZoomOut}
              style={timelineStyles.button}
              title="时间范围放大"
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, timelineStyles.buttonHover);
              }}
              onMouseLeave={(e) => {
                Object.assign(e.currentTarget.style, timelineStyles.buttonDefault);
              }}
            >
              −
            </button>
            <button
              onClick={onResetZoom}
              style={{ ...timelineStyles.button, ...timelineStyles.resetButton }}
              title="重置时间范围"
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, timelineStyles.buttonHover);
              }}
              onMouseLeave={(e) => {
                Object.assign(e.currentTarget.style, timelineStyles.buttonDefault);
              }}
            >
              ⌂
            </button>
            <button
              onClick={onZoomIn}
              style={timelineStyles.button}
              title="时间范围缩小"
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, timelineStyles.buttonHover);
              }}
              onMouseLeave={(e) => {
                Object.assign(e.currentTarget.style, timelineStyles.buttonDefault);
              }}
            >
              +
            </button>
          </div>
        </div>
        
        {/* SVG 容器 */}
        <div 
          ref={containerRef}
          style={timelineStyles.svgContainer}
        >
          <svg ref={svgRef} style={timelineStyles.svg} />
        </div>
      </div>
    );
  }
);