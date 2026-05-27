import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { useRequest } from 'ahooks';
import * as echarts from 'echarts/core';
import { ScatterChart, CustomChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
  MarkAreaComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { ECharts } from 'echarts/core';

import { StateView } from '@/components/ui';
import { getEvents, getDynasties } from '@/services/dataClient';
import { useDynastyStore } from '@/store';
import type { Event } from '@/services/timeline/types';
import type { Dynasty } from '@/services/culture/types';
import { formatTimelineYear, findDynastyByYear } from '@/features/timeline/utils/dynastyUtils';

echarts.use([
  ScatterChart,
  CustomChart,
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
  MarkAreaComponent,
  CanvasRenderer,
]);

interface EChartsTimelineProps {
  focusRange?: [number, number] | null;
  focusLabel?: string | null;
  onTimeRangeChange?: (range: [number, number]) => void;
}

const BAND_HEIGHT = 0.18;
const BAND_TOP = 0.82;
const EVENT_Y = 0.45;
const GRID_LEFT = 48;
const GRID_RIGHT = 24;

function eventEnd(event: Event): number {
  return event.endYear ?? event.startYear;
}

function buildBoundsRange(events: Event[], dynasties: Dynasty[]): [number, number] {
  const years: number[] = [];
  for (const e of events) {
    years.push(e.startYear);
    years.push(eventEnd(e));
  }
  for (const d of dynasties) {
    years.push(d.startYear);
    years.push(d.endYear ?? d.startYear);
  }
  if (years.length === 0) return [-2200, 2050];
  const min = Math.min(...years);
  const max = Math.max(...years);
  const pad = Math.max(40, Math.round((max - min) * 0.04));
  return [min - pad, max + pad];
}

function colorWithAlpha(color: string | undefined, alpha: number): string {
  if (!color) return `rgba(99, 102, 241, ${alpha})`;
  const hex = color.replace('#', '');
  if (hex.length === 6) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
}

function buildBandData(
  dynasties: Dynasty[],
  shouldShowLabel: (dynasty: Dynasty) => boolean,
) {
  return dynasties.map((d) => {
    const start = d.startYear;
    const end = d.endYear ?? d.startYear;
    return [
      {
        name: d.name,
        xAxis: start,
        yAxis: BAND_TOP,
        itemStyle: {
          color: colorWithAlpha(d.color, 0.28),
          borderColor: colorWithAlpha(d.color, 0.6),
          borderWidth: 1,
        },
        label: {
          show: shouldShowLabel(d),
          position: 'insideTop' as const,
          distance: 4,
          color: '#1e293b',
          fontSize: 11,
          fontWeight: 600,
          overflow: 'truncate' as const,
          formatter: d.name,
        },
      },
      {
        xAxis: end,
        yAxis: BAND_TOP + BAND_HEIGHT,
      },
    ];
  });
}

export function EChartsTimeline({
  focusRange,
  focusLabel,
  onTimeRangeChange,
}: EChartsTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ECharts | null>(null);
  const suppressDataZoomRef = useRef(false);

  const [events, setEvents] = useState<Event[]>([]);
  const { dynasties: storeDynasties, setDynasties, selectedDynasty, setSelectedDynasty } =
    useDynastyStore();
  const [localDynasties, setLocalDynasties] = useState<Dynasty[]>([]);
  const dynasties = storeDynasties.length > 0 ? storeDynasties : localDynasties;

  const { loading } = useRequest(
    async () => {
      const [eventResult, dynastyResult] = await Promise.all([
        getEvents(),
        getDynasties(),
      ]);
      return { events: eventResult.data, dynasties: dynastyResult.data };
    },
    {
      cacheKey: 'echarts_timeline_data',
      onSuccess: ({ events: eventData, dynasties: dynastyData }) => {
        setEvents(eventData);
        setLocalDynasties(dynastyData);
        if (storeDynasties.length === 0) {
          setDynasties(dynastyData);
        }
      },
    },
  );

  const boundsRange = useMemo(
    () => buildBoundsRange(events, dynasties),
    [events, dynasties],
  );

  // 事件按年份排序,供 LoD 贪心选标签用
  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => a.startYear - b.startYear),
    [events],
  );

  // 根据当前可视范围 + 容器宽度,贪心决定哪些事件显示文字标签
  const applyLoD = useCallback(
    (startValue: number, endValue: number) => {
      const chart = chartRef.current;
      const container = containerRef.current;
      if (!chart || !container) return;
      const span = endValue - startValue;
      if (span <= 0) return;

      const innerWidth = Math.max(container.clientWidth - GRID_LEFT - GRID_RIGHT, 1);
      const pxPerYear = innerWidth / span;
      const MIN_LABEL_GAP_PX = 88; // 相邻标签最小像素间距

      let lastLabelPx = -Infinity;
      const data = sortedEvents.map((ev) => {
        const inView = ev.startYear >= startValue && ev.startYear <= endValue;
        const px = (ev.startYear - startValue) * pxPerYear;
        let showLabel = false;
        if (inView && px - lastLabelPx >= MIN_LABEL_GAP_PX) {
          showLabel = true;
          lastLabelPx = px;
        }
        return {
          value: [ev.startYear, EVENT_Y],
          event: ev,
          label: { show: showLabel },
        };
      });

      // 朝代名:色带在视口内的可见像素宽度够放下名字才显示
      const bandData = buildBandData(dynasties, (d) => {
        const start = d.startYear;
        const end = d.endYear ?? d.startYear;
        const visStart = Math.max(start, startValue);
        const visEnd = Math.min(end, endValue);
        if (visEnd <= visStart) return false;
        const visiblePx = (visEnd - visStart) * pxPerYear;
        // 每个汉字约 11px,加上 padding,估算最小可显示宽度
        const needPx = Math.max(d.name.length * 12 + 8, 28);
        return visiblePx >= needPx;
      });

      chart.setOption({
        series: [
          { id: 'events', data },
          { id: 'dynasty-bands', markArea: { silent: true, data: bandData } },
        ],
      });
    },
    [sortedEvents, dynasties],
  );

  const option = useMemo(() => {
    const eventData = events.map((e) => ({
      value: [e.startYear, EVENT_Y],
      event: e,
    }));

    const bandData = buildBandData(dynasties, () => true);

    return {
      animation: false,
      grid: { left: GRID_LEFT, right: GRID_RIGHT, top: 16, bottom: 56, containLabel: false },
      xAxis: {
        type: 'value' as const,
        min: boundsRange[0],
        max: boundsRange[1],
        axisLabel: {
          color: '#475569',
          fontSize: 11,
          formatter: (val: number) => formatTimelineYear(val, { short: true }),
        },
        axisLine: { lineStyle: { color: 'rgba(71, 85, 105, 0.4)' } },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value' as const,
        min: 0,
        max: 1,
        show: false,
      },
      tooltip: {
        trigger: 'item' as const,
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        borderColor: 'rgba(99, 102, 241, 0.5)',
        textStyle: { color: '#f1f5f9', fontSize: 12 },
        formatter: (params: { data?: { event?: Event } } | unknown) => {
          const data = (params as { data?: { event?: Event } }).data;
          const ev = data?.event;
          if (!ev) return '';
          const yearText = ev.endYear && ev.endYear !== ev.startYear
            ? `${formatTimelineYear(ev.startYear)} – ${formatTimelineYear(ev.endYear)}`
            : formatTimelineYear(ev.startYear);
          const desc = ev.description ? `<div style="margin-top:4px;color:#cbd5e1;max-width:240px;white-space:normal;">${ev.description}</div>` : '';
          return `<div style="font-weight:600;">${ev.title}</div><div style="margin-top:2px;color:#94a3b8;">${yearText}</div>${desc}`;
        },
      },
      dataZoom: [
        {
          type: 'inside' as const,
          xAxisIndex: 0,
          filterMode: 'none' as const,
          zoomOnMouseWheel: true,
          moveOnMouseWheel: false,
          moveOnMouseMove: true,
        },
        {
          type: 'slider' as const,
          xAxisIndex: 0,
          filterMode: 'none' as const,
          height: 18,
          bottom: 8,
          borderColor: 'rgba(148, 163, 184, 0.3)',
          fillerColor: 'rgba(99, 102, 241, 0.15)',
          handleStyle: { color: '#6366f1' },
          textStyle: { color: '#475569', fontSize: 10 },
          labelFormatter: (val: number) => formatTimelineYear(val, { short: true }),
        },
      ],
      series: [
        {
          id: 'dynasty-bands',
          type: 'scatter' as const,
          data: [],
          markArea: {
            silent: true,
            data: bandData,
          },
        },
        {
          id: 'events',
          name: '事件',
          type: 'scatter' as const,
          data: eventData,
          symbolSize: 9,
          label: {
            show: false,
            position: 'top' as const,
            distance: 6,
            color: '#1e293b',
            fontSize: 11,
            fontWeight: 500,
            backgroundColor: 'rgba(248, 250, 252, 0.85)',
            padding: [2, 5],
            borderRadius: 4,
            formatter: (p: { data?: { event?: Event } }) => p.data?.event?.title ?? '',
          },
          itemStyle: {
            color: '#6366f1',
            borderColor: '#fff',
            borderWidth: 1.5,
            shadowColor: 'rgba(99, 102, 241, 0.6)',
            shadowBlur: 6,
          },
          emphasis: {
            scale: 1.6,
            itemStyle: { color: '#f59e0b' },
            label: { show: true },
          },
          z: 10,
        },
      ],
    };
  }, [events, dynasties, boundsRange]);

  const getCurrentRange = useCallback((): [number, number] => {
    const chart = chartRef.current;
    if (!chart) return boundsRange;
    const opt = chart.getOption() as { dataZoom?: Array<{ startValue?: number; endValue?: number; start?: number; end?: number }> };
    const zoom = opt.dataZoom?.[0];
    if (!zoom) return boundsRange;
    let startValue = zoom.startValue;
    let endValue = zoom.endValue;
    if (startValue === undefined || endValue === undefined) {
      const span = boundsRange[1] - boundsRange[0];
      startValue = boundsRange[0] + ((zoom.start ?? 0) / 100) * span;
      endValue = boundsRange[0] + ((zoom.end ?? 100) / 100) * span;
    }
    return [startValue, endValue];
  }, [boundsRange]);

  useEffect(() => {
    if (!containerRef.current || loading) return;
    const chart = echarts.init(containerRef.current, undefined, { renderer: 'canvas' });
    chartRef.current = chart;
    chart.setOption(option);
    applyLoD(boundsRange[0], boundsRange[1]);

    const handleResize = () => {
      chart.resize();
      const [s, e] = getCurrentRange();
      applyLoD(s, e);
    };
    const observer = new ResizeObserver(handleResize);
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, [loading, option, applyLoD, boundsRange, getCurrentRange]);

  // dataZoom → LoD + upward sync
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const handler = () => {
      const [startValue, endValue] = getCurrentRange();
      applyLoD(startValue, endValue);
      if (suppressDataZoomRef.current) return;
      onTimeRangeChange?.([startValue, endValue]);
    };

    chart.on('dataZoom', handler);
    return () => {
      chart.off('dataZoom', handler);
    };
  }, [getCurrentRange, applyLoD, onTimeRangeChange]);

  // event click → setSelectedDynasty by event year (and could open detail)
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const handler = (params: unknown) => {
      const p = params as { seriesId?: string; data?: { event?: Event } };
      if (p.seriesId !== 'events') return;
      const ev = p.data?.event;
      if (!ev) return;
      const found = findDynastyByYear(ev.startYear, dynasties);
      if (found && found.id !== selectedDynasty?.id) {
        setSelectedDynasty(found);
      }
    };
    chart.on('click', handler);
    return () => {
      chart.off('click', handler);
    };
  }, [dynasties, selectedDynasty, setSelectedDynasty]);

  // focusRange → dispatch dataZoom (only if center is outside target, to avoid yanking user)
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    if (!focusRange) return;

    const opt = chart.getOption() as { dataZoom?: Array<{ startValue?: number; endValue?: number; start?: number; end?: number }> };
    const current = opt.dataZoom?.[0];
    if (current) {
      let s = current.startValue;
      let e = current.endValue;
      if (s === undefined || e === undefined) {
        const span = boundsRange[1] - boundsRange[0];
        s = boundsRange[0] + ((current.start ?? 0) / 100) * span;
        e = boundsRange[0] + ((current.end ?? 100) / 100) * span;
      }
      const center = (s + e) / 2;
      if (center >= focusRange[0] && center <= focusRange[1]) return;
    }

    suppressDataZoomRef.current = true;
    chart.dispatchAction({
      type: 'dataZoom',
      startValue: focusRange[0],
      endValue: focusRange[1],
    });
    requestAnimationFrame(() => {
      suppressDataZoomRef.current = false;
    });
  }, [focusRange, boundsRange]);

  const handleReset = useCallback(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.dispatchAction({
      type: 'dataZoom',
      startValue: boundsRange[0],
      endValue: boundsRange[1],
    });
  }, [boundsRange]);

  if (loading) {
    return (
      <StateView
        mode="loading"
        title="正在加载历史事件数据..."
        description="整理事件索引与时间刻度。"
        minHeight="100%"
      />
    );
  }

  if (events.length === 0) {
    return (
      <StateView
        mode="empty"
        title="暂无匹配的历史事件"
        description="调整朝代或稍后重试。"
        minHeight="100%"
      />
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid rgba(148, 163, 184, 0.18)',
        borderRadius: '12px',
        backgroundColor: 'rgba(248, 250, 252, 0.12)',
        backdropFilter: 'blur(2px)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1,
          borderBottom: '1px solid rgba(148, 163, 184, 0.18)',
          fontSize: 12,
          color: '#475569',
        }}
      >
        <Box>
          {focusLabel ? (
            <span>当前朝代:<strong style={{ color: '#1e293b' }}>{focusLabel}</strong></span>
          ) : (
            <span>全时段</span>
          )}
          <span style={{ marginLeft: 12, color: '#94a3b8' }}>共 {events.length} 个事件</span>
        </Box>
        <button
          type="button"
          onClick={handleReset}
          style={{
            background: 'transparent',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            borderRadius: 6,
            padding: '2px 10px',
            fontSize: 11,
            color: '#475569',
            cursor: 'pointer',
          }}
        >
          重置视图
        </button>
      </Box>
      <Box ref={containerRef} sx={{ flex: 1, minHeight: 280 }} />
    </Box>
  );
}
