import { Box } from '@mui/material';
import { useEffect, useMemo, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import * as d3 from 'd3';
import { StateView } from '@/components/ui';
import { TIMELINE_CONFIG } from '../config/timelineConfig';
import { TimelineRenderer } from '../utils/timelineRenderer';
import { TimelineToolbar } from './TimelineToolbar';
import {
  useTimelineInteraction,
  createTimelineCommands,
  type TimeRange,
} from '../hooks/useTimelineInteraction';
import type { TimelineChartProps, TimelineChartRef } from '../types';
import { formatTimelineRange } from '@/features/timeline/utils/dynastyUtils';

function createBoundsRange(events: TimelineChartProps['events']): TimeRange | null {
  if (events.length === 0) {
    return null;
  }

  const minYear = d3.min(events, (event) => event.startYear);
  const maxYear = d3.max(events, (event) => event.endYear ?? event.startYear);
  if (minYear === undefined || maxYear === undefined) {
    return null;
  }

  return [minYear - 50, maxYear + 50];
}

function clampRangeToBounds(range: TimeRange, bounds: TimeRange): TimeRange {
  const nextStart = Math.max(bounds[0], range[0]);
  const nextEnd = Math.min(bounds[1], range[1]);

  if (nextStart >= nextEnd) {
    return bounds;
  }

  return [nextStart, nextEnd];
}

export const TimelineChart = forwardRef<TimelineChartRef, TimelineChartProps>(
  (
    {
      events,
      favorites,
      focusRange,
      focusLabel,
      onZoomChange,
      zoomLevel,
      onZoomIn,
      onZoomOut,
      onResetZoom,
      onPanLeft,
      onPanRight,
      onTimeRangeChange,
    },
    ref
  ) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [timeRange, setTimeRange] = useState<TimeRange | null>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const originalRangeRef = useRef<TimeRange | null>(null);

    const timeRangeRef = useRef<TimeRange | null>(null);
    timeRangeRef.current = timeRange;

    useImperativeHandle(
      ref,
      () => createTimelineCommands(timeRangeRef, originalRangeRef, setTimeRange, onZoomChange),
      [onZoomChange]
    );

    const boundsRange = useMemo(() => createBoundsRange(events), [events]);
    const visibleEvents = useMemo(() => {
      if (!timeRange) {
        return [];
      }

      return events.filter((event) => {
        const eventEnd = event.endYear ?? event.startYear;
        return event.startYear <= timeRange[1] && eventEnd >= timeRange[0];
      });
    }, [events, timeRange]);
    const visibleRangeLabel = timeRange ? formatTimelineRange(timeRange) : '';

    useEffect(() => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      const updateSize = () => {
        setContainerWidth(container.getBoundingClientRect().width);
      };

      updateSize();

      if (typeof ResizeObserver !== 'undefined') {
        const observer = new ResizeObserver(() => updateSize());
        observer.observe(container);
        return () => observer.disconnect();
      }

      window.addEventListener('resize', updateSize);
      return () => {
        window.removeEventListener('resize', updateSize);
      };
    }, []);

    useEffect(() => {
      if (!boundsRange) {
        return;
      }
      originalRangeRef.current = boundsRange;
    }, [boundsRange]);

    useEffect(() => {
      if (!boundsRange) {
        return;
      }

      const target = focusRange
        ? clampRangeToBounds(focusRange, boundsRange)
        : boundsRange;

      const current = timeRangeRef.current;
      if (current) {
        const center = (current[0] + current[1]) / 2;
        if (center >= target[0] && center <= target[1]) {
          return;
        }
      }

      setTimeRange(target);
      const fullSpan = boundsRange[1] - boundsRange[0];
      const currentSpan = target[1] - target[0];
      onZoomChange(currentSpan > 0 ? fullSpan / currentSpan : 1);
    }, [boundsRange, focusRange, onZoomChange]);

    useEffect(() => {
      if (!timeRange) return;
      onTimeRangeChange?.(timeRange);
    }, [timeRange, onTimeRangeChange]);

    useEffect(() => {
      if (
        !svgRef.current ||
        !containerRef.current ||
        visibleEvents.length === 0 ||
        !timeRange ||
        containerWidth <= 0
      ) {
        return;
      }

      const svg = d3.select(svgRef.current);

      svg.selectAll('*').remove();

      const { dimensions } = TIMELINE_CONFIG;
      const width = Math.max(
        containerWidth - dimensions.margin.left - dimensions.margin.right,
        0,
      );
      const height = dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

      svg.attr('width', containerWidth).attr('height', dimensions.height);

      const g = svg
        .append('g')
        .attr('transform', `translate(${dimensions.margin.left},${dimensions.margin.top})`);

      const xScale = d3.scaleLinear().domain(timeRange).range([0, width]);

      const renderer = new TimelineRenderer(g, width, height, xScale, favorites);
      renderer.renderMainTimeline();
      renderer.renderStandardAxis();

      renderer.renderEvents(visibleEvents);

      const currentZoom = originalRangeRef.current
        ? (originalRangeRef.current[1] - originalRangeRef.current[0]) / (timeRange[1] - timeRange[0])
        : 1;

      renderer.renderEventLabels(visibleEvents, currentZoom);
      renderer.renderEventYears(visibleEvents, currentZoom);
    }, [containerWidth, favorites, timeRange, visibleEvents]);

    useTimelineInteraction({
      svgRef,
      containerRef,
      timeRange,
      setTimeRange,
      originalRangeRef,
    });

    if (events.length === 0) {
      return null;
    }

    return (
      <Box
        className="d3-timeline-container"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid rgba(148, 163, 184, 0.18)',
          borderRadius: '12px',
          backgroundColor: 'rgba(var(--color-glass-surface-rgb), 0.12)',
          backdropFilter: 'blur(2px)',
        }}
      >
        <TimelineToolbar
          focusLabel={focusLabel}
          totalEventCount={events.length}
          visibleEventCount={visibleEvents.length}
          visibleRangeLabel={visibleRangeLabel}
          zoomLevel={zoomLevel}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
          onResetZoom={onResetZoom}
          onPanLeft={onPanLeft}
          onPanRight={onPanRight}
        />

        <Box
          ref={containerRef}
          sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}
        >
          {visibleEvents.length === 0 ? (
            <StateView
              mode="empty"
              title="当前时段暂无事件"
              description="切换朝代或重置时间范围后再看看。"
              minHeight="100%"
            />
          ) : (
            <svg ref={svgRef} className="d3-timeline-svg" />
          )}
        </Box>
      </Box>
    );
  }
);
