import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import * as d3 from 'd3';
import { TIMELINE_CONFIG } from '../config/timelineConfig';
import { TimelineRenderer } from '../utils/timelineRenderer';
import { timelineStyles } from '../styles/timelineStyles';
import { TimelineToolbar } from './TimelineToolbar';
import {
  useTimelineInteraction,
  createTimelineCommands,
  type TimeRange,
} from '../hooks/useTimelineInteraction';
import type { TimelineChartProps, TimelineChartRef } from '../types';

export const TimelineChart = forwardRef<TimelineChartRef, TimelineChartProps>(
  (
    { events, favorites, onZoomChange, zoomLevel, onZoomIn, onZoomOut, onResetZoom, onPanLeft, onPanRight },
    ref
  ) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [timeRange, setTimeRange] = useState<TimeRange | null>(null);
    const originalRangeRef = useRef<TimeRange | null>(null);

    // 让 commands 总是读到最新的 timeRange
    const timeRangeRef = useRef<TimeRange | null>(null);
    timeRangeRef.current = timeRange;

    // 缩放/平移命令式 API
    useImperativeHandle(
      ref,
      () => createTimelineCommands(timeRangeRef, originalRangeRef, setTimeRange, onZoomChange),
      [onZoomChange]
    );

    // 初始化时间范围
    useEffect(() => {
      if (events.length === 0) return;

      const sortedEvents = [...events].sort((a, b) => a.startYear - b.startYear);
      const minYear = d3.min(sortedEvents, (d) => d.startYear) || 0;
      const maxYear = d3.max(sortedEvents, (d) => d.endYear || d.startYear) || 0;
      const range: TimeRange = [minYear - 50, maxYear + 50];

      if (!originalRangeRef.current) {
        originalRangeRef.current = range;
        setTimeRange(range);
      }
    }, [events]);

    // D3 渲染
    useEffect(() => {
      if (!svgRef.current || !containerRef.current || events.length === 0 || !timeRange) return;

      const container = containerRef.current;
      const svg = d3.select(svgRef.current);

      svg.selectAll('*').remove();

      const containerRect = container.getBoundingClientRect();
      const { dimensions } = TIMELINE_CONFIG;
      const width = containerRect.width - dimensions.margin.left - dimensions.margin.right;
      const height = dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

      svg.attr('width', containerRect.width).attr('height', dimensions.height);

      const g = svg
        .append('g')
        .attr('transform', `translate(${dimensions.margin.left},${dimensions.margin.top})`);

      const sortedEvents = [...events].sort((a, b) => a.startYear - b.startYear);
      const xScale = d3.scaleLinear().domain(timeRange).range([0, width]);

      const renderer = new TimelineRenderer(g, width, height, xScale, favorites);
      renderer.renderMainTimeline();
      renderer.renderStandardAxis();

      const visibleEvents = sortedEvents.filter((event) => {
        const eventEnd = event.endYear || event.startYear;
        return event.startYear <= timeRange[1] && eventEnd >= timeRange[0];
      });

      renderer.renderEvents(visibleEvents);

      const currentZoom = originalRangeRef.current
        ? (originalRangeRef.current[1] - originalRangeRef.current[0]) / (timeRange[1] - timeRange[0])
        : 1;

      renderer.renderEventLabels(visibleEvents, currentZoom);
      renderer.renderEventYears(visibleEvents, currentZoom);
    }, [events, favorites, timeRange]);

    // 注册所有交互事件
    useTimelineInteraction({
      svgRef,
      containerRef,
      timeRange,
      setTimeRange,
      originalRangeRef,
      onZoomChange,
    });

    if (events.length === 0) {
      return <div style={timelineStyles.emptyState}>暂无匹配的历史事件</div>;
    }

    return (
      <div className="d3-timeline-container" style={timelineStyles.container}>
        <TimelineToolbar
          zoomLevel={zoomLevel}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
          onResetZoom={onResetZoom}
          onPanLeft={onPanLeft}
          onPanRight={onPanRight}
        />

        <div ref={containerRef} style={timelineStyles.svgContainer}>
          <svg ref={svgRef} style={timelineStyles.svg} />
        </div>
      </div>
    );
  }
);
