import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import * as d3 from 'd3';
import { TIMELINE_CONFIG } from '../config/timelineConfig';
import { TimelineRenderer } from '../utils/timelineRenderer';
import type { TimelineChartProps, TimelineChartRef } from '../types';

export const TimelineChart = forwardRef<TimelineChartRef, TimelineChartProps>(
  ({ events, favorites, onZoomChange, zoomLevel, onZoomIn, onZoomOut, onResetZoom }, ref) => {
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

      // 鼠标滚轮缩放处理
      const handleWheel = (event: WheelEvent) => {
        event.preventDefault();
        const rect = svg.node()?.getBoundingClientRect();
        if (!rect) return;
        
        const mouseX = event.clientX - rect.left - dimensions.margin.left;
        const mouseYear = xScale.invert(mouseX);
        
        const [start, end] = timeRange;
        const currentRange = end - start;
        const { zoom } = TIMELINE_CONFIG;
        const zoomFactor = event.deltaY > 0 ? zoom.factor.out : zoom.factor.in;
        const newRange = currentRange * zoomFactor;
        
        // 以鼠标位置为中心缩放
        const leftRatio = (mouseYear - start) / currentRange;
        const rightRatio = (end - mouseYear) / currentRange;
        
        let newStart = mouseYear - newRange * leftRatio;
        let newEnd = mouseYear + newRange * rightRatio;
        
        // 限制缩放范围
        if (originalRangeRef.current) {
          const [originalStart, originalEnd] = originalRangeRef.current;
          newStart = Math.max(originalStart, newStart);
          newEnd = Math.min(originalEnd, newEnd);
        }
        
        setTimeRange([newStart, newEnd]);
        onZoomChange(originalRangeRef.current ? (originalRangeRef.current[1] - originalRangeRef.current[0]) / (newEnd - newStart) : 1);
      };

      // 添加滚轮事件监听
      const svgElement = svg.node();
      if (svgElement) {
        svgElement.addEventListener('wheel', handleWheel, { passive: false });
      }

      // 清理事件监听器
      return () => {
        if (svgElement) {
          svgElement.removeEventListener('wheel', handleWheel);
        }
      };
    }, [events, favorites, timeRange]);

    // 如果正在加载或没有数据，显示相应状态
    if (events.length === 0) {
      return (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          color: 'rgba(71, 85, 105, 0.7)'
        }}>
          暂无匹配的历史事件
        </div>
      );
    }

    return (
      <div 
        className="d3-timeline-container"
        style={{ 
          flex: 1, 
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid rgba(99, 102, 241, 0.15)',
          borderRadius: '8px',
          backgroundColor: 'rgba(248, 250, 252, 0.1)',
          backdropFilter: 'blur(2px)',
        }}
      >
        {/* 标题和控件 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '12px 16px 8px 16px',
          borderBottom: '1px solid rgba(99, 102, 241, 0.15)'
        }}>
          <h3 style={{ 
            margin: 0,
            color: '#334155', 
            fontWeight: '600',
            fontSize: '16px'
          }}>
            历史时间轴
          </h3>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px'
          }}>
            <span style={{ 
              fontSize: '12px',
              color: 'rgba(71, 85, 105, 0.7)',
              marginRight: '8px'
            }}>
              时间缩放: {zoomLevel.toFixed(1)}x
            </span>
            <button
              onClick={onZoomOut}
              style={{
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
                transition: 'all 0.2s ease'
              }}
              title="时间范围放大"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(248, 250, 252, 0.9)';
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.25)';
              }}
            >
              −
            </button>
            <button
              onClick={onResetZoom}
              style={{
                width: '28px',
                height: '28px',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: '6px',
                backgroundColor: 'rgba(248, 250, 252, 0.9)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                color: 'rgba(99, 102, 241, 0.8)',
                transition: 'all 0.2s ease'
              }}
              title="重置时间范围"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(248, 250, 252, 0.9)';
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.25)';
              }}
            >
              ⌂
            </button>
            <button
              onClick={onZoomIn}
              style={{
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
                transition: 'all 0.2s ease'
              }}
              title="时间范围缩小"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(248, 250, 252, 0.9)';
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.25)';
              }}
            >
              +
            </button>
          </div>
        </div>
        
        {/* SVG 容器 */}
        <div 
          ref={containerRef}
          style={{ 
            flex: 1,
            overflow: 'hidden'
          }}
        >
          <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
    );
  }
);