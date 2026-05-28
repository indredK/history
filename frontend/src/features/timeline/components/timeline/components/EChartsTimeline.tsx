import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import ZoomInMapIcon from '@mui/icons-material/ZoomInMap';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import * as echarts from 'echarts/core';
import { CustomChart, ScatterChart } from 'echarts/charts';
import { DataZoomComponent, GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { ECharts, SetOptionOpts } from 'echarts/core';

import { StateView } from '@/components/ui';
import { useThemeStore } from '@/store';
import type { Dynasty } from '@/services/culture/types';
import type { Event } from '@/services/timeline/types';
import { formatTimelineYear } from '@/features/timeline/utils/dynastyUtils';
import {
  EVENT_TYPE_LABELS,
  getTimelineEventCategory,
  type TimelineEventCategory,
} from '@/features/timeline/utils/timelineFilters';
import {
  buildDefaultWindowRange,
  buildBoundsRange,
  clampRangeToBounds,
  eventEnd,
  eventOverlapsRange,
  focusRangeToDynastyWithContext,
  focusRangeToDynasty,
  getDynastyRange,
  getHighlightedDynastyIdsForRange,
  isSameRange,
  moveRangeToEvent,
  sortDynasties,
  sortEvents,
  type TimeRange,
} from '../utils/echartsTimelineRules';

echarts.use([
  ScatterChart,
  CustomChart,
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
  CanvasRenderer,
]);

interface EChartsTimelineProps {
  // ── Data ──
  eventsData?: Event[];
  dynastiesData?: Dynasty[];
  minHeight?: number;

  // ── Controlled state (parent takes over when provided) ──
  timeRange?: TimeRange | null;
  selectedEventId?: string | null;
  highlightedDynastyId?: string | null;
  isCondensed?: boolean;

  // ── Initial state (only for uncontrolled mode) ──
  initialTimeRange?: TimeRange;
  initialSelectedEventId?: string | null;
  initialHighlightedDynastyId?: string | null;
  initialIsCondensed?: boolean;

  // ── Feature toggles ──
  /** 显示顶部信息栏，默认 true */
  showHeader?: boolean;
  /** 显示重置视图按钮，默认 true */
  showResetButton?: boolean;
  /** 显示收起/展开切换按钮，默认 true */
  showCondenseToggle?: boolean;
  /** 显示朝代色带，默认 true */
  showDynastyBands?: boolean;
  /** 朝代色带上显示事件计数，默认 true */
  showDynastyCountBadge?: boolean;
  /** 点击事件后显示详情卡片，默认 true */
  showEventDetail?: boolean;
  /** 显示左侧分类标签（战争/政治/文化科技），默认 true */
  showCategoryLabels?: boolean;
  /** 显示分类泳道之间的分隔线，默认 true */
  showCategorySeparators?: boolean;
  /** 显示底部滑块缩放控件，默认 true */
  showSliderZoom?: boolean;
  /** 强制显示/隐藏事件名称。null 表示根据缩放级别自动决定，默认 null */
  showEventLabels?: boolean | null;
  /** 自动显示事件名称的缩放阈值（可见年份跨度），默认 300 */
  eventLabelThreshold?: number;
  /** 显示事件散点和事件范围，默认 true */
  showEventPoints?: boolean;

  // ── Animation ──
  /** 开启动画过渡，默认 false */
  enableAnimation?: boolean;
  /** 动画持续时间(ms)，默认 0 */
  animationDuration?: number;

  // ── Behavior ──
  /** 鼠标拖拽平移，默认 true */
  enablePan?: boolean;
  /** 鼠标滚轮缩放，默认 true */
  enableZoom?: boolean;

  // ── Callbacks ──
  onTimeRangeChange?: (range: TimeRange) => void;
  onEventSelect?: (eventId: string | null) => void;
  onDynastyHighlight?: (dynastyId: string | null) => void;
  onCondensedChange?: (condensed: boolean) => void;
  onDynastyClick?: (dynasty: Dynasty) => void;
  onEventClick?: (event: Event) => void;
  onReset?: () => void;
  clusterData?: {
    yearClusters: Array<{
      id: string;
      year: number;
      category: string;
      events: Event[];
      dynastyIds: string[];
    }>;
    dynastyClusters: Array<{
      id: string;
      dynastyId: string;
      category: string;
      startYear: number;
      endYear: number;
      events: Event[];
    }>;
    densityMode: 'auto' | 'major-only' | 'all';
  };
}

interface EventRenderDataItem {
  value: [number, number];
  event: Event;
  yValue: number;
  label: { show: boolean };
  isDynastyHighlighted: boolean;
  pointSymbolSize: number;
  pointItemStyle: {
    color: string;
    borderColor: string;
    borderWidth: number;
    shadowColor: string;
    shadowBlur: number;
  };
  rangeStyle: {
    fill: string;
    stroke: string;
    lineWidth: number;
    shadowColor: string;
    shadowBlur: number;
    opacity: number;
  };
  isActive: boolean;
}

interface YearClusterRenderDataItem {
  value: [number, number];
  clusterId: string;
  year: number;
  category: string;
  count: number;
  events: Event[];
}

interface DynastyClusterRenderDataItem {
  value: [number, number];
  clusterId: string;
  dynastyId: string;
  category: string;
  yValue: number;
  count: number;
  events: Event[];
}

interface TimelineThemeColors {
  axisText: string;
  axisLine: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
  tooltipMuted: string;
  tooltipDescription: string;
  sliderBg: string;
  sliderBorder: string;
  sliderFiller: string;
  sliderDataLine: string;
  sliderDataArea: string;
  sliderSelectedLine: string;
  sliderSelectedArea: string;
  sliderHandle: string;
  sliderHandleBorder: string;
  sliderMoveHandle: string;
  sliderMoveHandleBorder: string;
  dynastyFill: string;
  dynastyStroke: string;
  dynastyLabel: string;
  dynastyWindowFill: string;
  dynastyWindowStroke: string;
  dynastyWindowShadow: string;
  dynastySelectedFill: string;
  dynastySelectedStroke: string;
  dynastySelectedShadow: string;
  event: string;
  eventStroke: string;
  eventShadow: string;
  eventMuted: string;
  eventMutedStroke: string;
  eventMutedShadow: string;
  eventActive: string;
  eventActiveShadow: string;
  eventPointBorder: string;
  eventLabel: string;
  eventLabelBg: string;
  eventLabelActiveBg: string;
  panelBorder: string;
  headerText: string;
  headerMuted: string;
  focusPillBg: string;
  focusPillText: string;
  countPillBg: string;
  countPillText: string;
  resetButtonBorder: string;
  resetButtonText: string;
}

const BAND_HEIGHT = 0.28;
const BAND_TOP = 0.72;
const EVENT_AREA_TOP = 0.12;
const EVENT_AREA_BOTTOM = 0.66;
const GRID_LEFT = 64;
const GRID_RIGHT = 24;
const COLLAPSED_CHART_HEIGHT = 82;
const EVENT_LABEL_SPAN_THRESHOLD = 300;

const EVENT_CATEGORY_ORDER = EVENT_TYPE_LABELS;

const CATEGORY_SYMBOL: Record<TimelineEventCategory, string> = {
  '战争': 'diamond',
  '政治': 'rect',
  '文化/科技': 'triangle',
  '外交': 'pin',
  '经济': 'roundRect',
  '其他': 'circle',
};

interface CategoryLabelItem {
  label: string;
  catIndex: number;
  catCount: number;
}

function readCssVar(name: string, fallback: string): string {
  if (typeof document === 'undefined') {
    return fallback;
  }

  const value = window.getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function colorToChannels(color: string): [number, number, number] | null {
  const normalized = color.trim();
  const hex = normalized.replace('#', '');

  if (hex.length === 3) {
    const channels = hex
      .split('')
      .map((channel) => Number.parseInt(channel + channel, 16));
    if (channels.length !== 3 || channels.some((channel) => Number.isNaN(channel))) {
      return null;
    }
    return channels as [number, number, number];
  }

  if (hex.length === 6 && /^#[0-9a-f]{6}$/i.test(normalized)) {
    return [
      Number.parseInt(hex.slice(0, 2), 16),
      Number.parseInt(hex.slice(2, 4), 16),
      Number.parseInt(hex.slice(4, 6), 16),
    ];
  }

  const match = normalized.match(/^rgba?\(([^)]+)\)$/i);
  if (!match || !match[1]) {
    return null;
  }

  const parts = match[1]
    .split(',')
    .slice(0, 3)
    .map((part) => Number.parseFloat(part.trim()));

  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    return null;
  }

  return parts as [number, number, number];
}

function colorWithAlpha(color: string, alpha: number): string {
  const channels = colorToChannels(color);
  if (!channels) {
    return color;
  }

  return `rgba(${channels[0]}, ${channels[1]}, ${channels[2]}, ${alpha})`;
}

function buildTimelineThemeColors(isLight: boolean): TimelineThemeColors {
  const textPrimary = readCssVar(
    '--color-text-primary',
    isLight ? '#2c241c' : '#f5ecd8',
  );
  const textSecondary = readCssVar(
    '--color-text-secondary',
    isLight ? '#57483a' : '#d2c3a3',
  );
  const textTertiary = readCssVar(
    '--color-text-tertiary',
    isLight ? '#887864' : '#95856e',
  );
  const primary = readCssVar('--color-primary', isLight ? '#9b6121' : '#c78f45');
  const secondary = readCssVar('--color-secondary', '#6b8797');
  const surface = readCssVar(
    '--color-bg-card',
    isLight ? 'rgba(255, 251, 243, 0.88)' : 'rgba(33, 27, 22, 0.82)',
  );
  const surfaceSecondary = readCssVar(
    '--color-bg-secondary',
    isLight ? '#fbf7ef' : '#1b1714',
  );
  const overlay = readCssVar(
    '--color-bg-overlay',
    isLight ? 'rgba(255, 251, 243, 0.84)' : 'rgba(7, 6, 5, 0.72)',
  );
  const borderLight = readCssVar(
    '--color-border-light',
    isLight ? 'rgba(118, 90, 51, 0.1)' : 'rgba(226, 198, 140, 0.12)',
  );
  const borderMedium = readCssVar(
    '--color-border-medium',
    isLight ? 'rgba(118, 90, 51, 0.16)' : 'rgba(226, 198, 140, 0.2)',
  );
  const hoverBg = readCssVar(
    '--theme-hover-bg',
    isLight ? 'rgba(155, 97, 33, 0.08)' : 'rgba(199, 143, 69, 0.12)',
  );
  const activeBg = readCssVar(
    '--theme-active-bg',
    isLight ? 'rgba(155, 97, 33, 0.14)' : 'rgba(199, 143, 69, 0.18)',
  );

  return {
    axisText: textSecondary,
    axisLine: borderMedium,
    tooltipBg: colorWithAlpha(overlay, isLight ? 0.96 : 0.92),
    tooltipBorder: colorWithAlpha(primary, isLight ? 0.36 : 0.5),
    tooltipText: textPrimary,
    tooltipMuted: textTertiary,
    tooltipDescription: textSecondary,
    sliderBg: colorWithAlpha(surfaceSecondary, isLight ? 0.52 : 0.36),
    sliderBorder: borderMedium,
    sliderFiller: colorWithAlpha(primary, isLight ? 0.18 : 0.24),
    sliderDataLine: colorWithAlpha(secondary, isLight ? 0.26 : 0.34),
    sliderDataArea: colorWithAlpha(secondary, isLight ? 0.08 : 0.14),
    sliderSelectedLine: colorWithAlpha(primary, isLight ? 0.48 : 0.58),
    sliderSelectedArea: colorWithAlpha(primary, isLight ? 0.18 : 0.24),
    sliderHandle: primary,
    sliderHandleBorder: colorWithAlpha(surface, 0.96),
    sliderMoveHandle: colorWithAlpha(primary, isLight ? 0.4 : 0.5),
    sliderMoveHandleBorder: colorWithAlpha(surface, 0.88),
    dynastyFill: colorWithAlpha(secondary, isLight ? 0.14 : 0.18),
    dynastyStroke: colorWithAlpha(secondary, isLight ? 0.24 : 0.32),
    dynastyLabel: textPrimary,
    dynastyWindowFill: colorWithAlpha(primary, isLight ? 0.12 : 0.18),
    dynastyWindowStroke: colorWithAlpha(primary, isLight ? 0.54 : 0.62),
    dynastyWindowShadow: colorWithAlpha(primary, isLight ? 0.18 : 0.24),
    dynastySelectedFill: colorWithAlpha(primary, isLight ? 0.18 : 0.28),
    dynastySelectedStroke: colorWithAlpha(primary, 0.92),
    dynastySelectedShadow: colorWithAlpha(primary, isLight ? 0.22 : 0.34),
    event: colorWithAlpha(secondary, isLight ? 0.92 : 0.94),
    eventStroke: colorWithAlpha(secondary, isLight ? 0.74 : 0.82),
    eventShadow: colorWithAlpha(secondary, isLight ? 0.18 : 0.3),
    eventMuted: colorWithAlpha(textTertiary, isLight ? 0.28 : 0.34),
    eventMutedStroke: colorWithAlpha(textTertiary, isLight ? 0.18 : 0.24),
    eventMutedShadow: colorWithAlpha(textTertiary, 0.08),
    eventActive: primary,
    eventActiveShadow: colorWithAlpha(primary, isLight ? 0.28 : 0.42),
    eventPointBorder: colorWithAlpha(surface, 0.96),
    eventLabel: textPrimary,
    eventLabelBg: colorWithAlpha(surface, isLight ? 0.92 : 0.84),
    eventLabelActiveBg: colorWithAlpha(primary, isLight ? 0.16 : 0.22),
    panelBorder: borderLight,
    headerText: textSecondary,
    headerMuted: textTertiary,
    focusPillBg: activeBg,
    focusPillText: textPrimary,
    countPillBg: hoverBg,
    countPillText: textSecondary,
    resetButtonBorder: borderMedium,
    resetButtonText: textSecondary,
  };
}

function getCategoryLaneY(
  laneIndex: number,
  laneCount: number,
  catIndex: number,
  catCount: number,
): number {
  const eventAreaHeight = EVENT_AREA_BOTTOM - EVENT_AREA_TOP;
  const bandHeight = eventAreaHeight / Math.max(catCount, 1);
  const bandTop = EVENT_AREA_TOP + bandHeight * catIndex;
  const laneHeight = bandHeight / Math.max(laneCount, 1);
  return bandTop + laneHeight * (laneIndex + 0.5);
}

function assignDynastyLanes(dynasties: Dynasty[]) {
  const laneEnds: number[] = [];
  const laneIndexes: number[] = [];

  for (const dynasty of dynasties) {
    const start = dynasty.startYear;
    const end = dynasty.endYear ?? dynasty.startYear;
    let laneIndex = laneEnds.findIndex((laneEnd) => start >= laneEnd);
    if (laneIndex === -1) {
      laneIndex = laneEnds.length;
      laneEnds.push(end);
    } else {
      laneEnds[laneIndex] = Math.max(laneEnds[laneIndex]!, end);
    }
    laneIndexes.push(laneIndex);
  }

  return { laneIndexes, laneCount: Math.max(laneEnds.length, 1) };
}

type DynastyBandDataItem = { value: TimeRange; dynasty: Dynasty; laneIndex: number };

function buildDynastyBandData(dynasties: Dynasty[], laneIndexes: number[]): DynastyBandDataItem[] {
  return dynasties.map((dynasty, i) => ({
    value: getDynastyRange(dynasty),
    dynasty,
    laneIndex: laneIndexes[i]!,
  }));
}

function buildCategorizedEventRenderData(
  events: Event[],
  timeRange: TimeRange,
  selectedEventId: string | null,
  highlightedDynastyId: string | null,
  showLabels: boolean,
  colors: TimelineThemeColors,
): { renderData: EventRenderDataItem[]; categoryLabels: CategoryLabelItem[] } {
  const hasDynastyHighlight = highlightedDynastyId !== null;

  // 1. Group events by category
  const categoryGroups = new Map<string, Event[]>();
  for (const event of events) {
    const cat = getTimelineEventCategory(event.eventType);
    if (!categoryGroups.has(cat)) {
      categoryGroups.set(cat, []);
    }
    categoryGroups.get(cat)!.push(event);
  }

  // 2. Build category info in order
  const activeCategories = EVENT_CATEGORY_ORDER.filter(
    (cat) => (categoryGroups.get(cat)?.length ?? 0) > 0,
  );
  const catCount = activeCategories.length;

  const renderData: EventRenderDataItem[] = [];
  const categoryLabels: CategoryLabelItem[] = [];

  for (let catIndex = 0; catIndex < activeCategories.length; catIndex++) {
    const cat = activeCategories[catIndex]!;
    const catEvents = categoryGroups.get(cat)!;

    // Assign lanes within this category
    const laneEnds: number[] = [];
    const laneIndexes: number[] = [];
    for (const event of catEvents) {
      const start = event.startYear;
      const end = eventEnd(event);
      let laneIndex = laneEnds.findIndex((laneEnd) => start > laneEnd);
      if (laneIndex === -1) {
        laneIndex = laneEnds.length;
        laneEnds.push(end);
      } else {
        laneEnds[laneIndex] = end;
      }
      laneIndexes.push(laneIndex);
    }
    const laneCount = Math.max(laneEnds.length, 1);

    categoryLabels.push({ label: cat, catIndex, catCount });

    // Build render items for this category
    for (let i = 0; i < catEvents.length; i++) {
      const event = catEvents[i]!;
      const inWindow = eventOverlapsRange(event, timeRange);
      const isActive = event.id === selectedEventId;
      const isDynastyHighlighted = hasDynastyHighlight && event.dynastyId === highlightedDynastyId;
      const isHighlightActive = isActive || (hasDynastyHighlight && isDynastyHighlighted);
      const laneIndex = laneIndexes[i] ?? 0;

      renderData.push({
        value: [event.startYear, eventEnd(event)],
        event,
        yValue: getCategoryLaneY(laneIndex, laneCount, catIndex, catCount),
        label: { show: (isHighlightActive || showLabels) && inWindow },
        isDynastyHighlighted,
        pointSymbolSize: isHighlightActive ? 13 : isDynastyHighlighted ? 11 : inWindow ? 9 : 7,
        pointItemStyle: {
          color: isHighlightActive
            ? colors.eventActive
            : isDynastyHighlighted
              ? colors.event
              : inWindow
                ? colors.event
                : colors.eventMuted,
          borderColor: colors.eventPointBorder,
          borderWidth: isHighlightActive ? 2 : 1.5,
          shadowColor: isHighlightActive
            ? colors.eventActiveShadow
            : isDynastyHighlighted
              ? colors.eventShadow
              : inWindow
                ? colors.eventShadow
                : colors.eventMutedShadow,
          shadowBlur: isHighlightActive ? 10 : isDynastyHighlighted ? 8 : inWindow ? 6 : 0,
        },
        rangeStyle: {
          fill: isHighlightActive
            ? colors.eventActive
            : isDynastyHighlighted
              ? colors.event
              : inWindow
                ? colors.event
                : colors.eventMuted,
          stroke: isHighlightActive
            ? colors.eventActive
            : isDynastyHighlighted
              ? colors.eventStroke
              : inWindow
                ? colors.eventStroke
                : colors.eventMutedStroke,
          lineWidth: isHighlightActive ? 5 : isDynastyHighlighted ? 4 : inWindow ? 3 : 2,
          shadowColor: isHighlightActive
            ? colors.eventActiveShadow
            : isDynastyHighlighted
              ? colors.eventShadow
              : inWindow
                ? colors.eventShadow
                : colors.eventMutedShadow,
          shadowBlur: isHighlightActive ? 10 : isDynastyHighlighted ? 8 : inWindow ? 4 : 0,
          opacity: isHighlightActive ? 0.95 : isDynastyHighlighted ? 0.9 : inWindow ? 0.82 : 0.44,
        },
        isActive,
      });
    }
  }

  return { renderData, categoryLabels };
}

function buildEventPointData(renderData: EventRenderDataItem[]) {
  return renderData.map((item) => {
    const category = getTimelineEventCategory(item.event.eventType);
    return {
      value: [item.event.startYear, item.yValue],
      event: item.event,
      symbolSize: item.pointSymbolSize,
      itemStyle: item.pointItemStyle,
      z: item.isActive ? 20 : item.isDynastyHighlighted ? 16 : 10,
      symbol: CATEGORY_SYMBOL[category] ?? 'circle',
    };
  });
}

function buildYearClusterRenderData(
  yearClusters: NonNullable<EChartsTimelineProps['clusterData']>['yearClusters'],
  categoryLabels: CategoryLabelItem[],
): YearClusterRenderDataItem[] {
  const categoryIndexMap = new Map(categoryLabels.map((item) => [item.label, item]));
  return yearClusters.map((cluster) => {
    const catInfo = categoryIndexMap.get(cluster.category);
    const yValue = catInfo ? getCategoryLaneY(0, 1, catInfo.catIndex, catInfo.catCount) : EVENT_AREA_TOP + 0.04;
    return {
      value: [cluster.year, yValue],
      clusterId: cluster.id,
      year: cluster.year,
      category: cluster.category,
      count: cluster.events.length,
      events: cluster.events,
    };
  });
}

function buildDynastyClusterRenderData(
  dynastyClusters: NonNullable<EChartsTimelineProps['clusterData']>['dynastyClusters'],
  categoryLabels: CategoryLabelItem[],
): DynastyClusterRenderDataItem[] {
  const categoryIndexMap = new Map(categoryLabels.map((item) => [item.label, item]));
  return dynastyClusters.map((cluster) => {
    const catInfo = categoryIndexMap.get(cluster.category);
    const yValue = catInfo ? getCategoryLaneY(0, 1, catInfo.catIndex, catInfo.catCount) : EVENT_AREA_TOP + 0.08;
    return {
      value: [cluster.startYear, cluster.endYear],
      clusterId: cluster.id,
      dynastyId: cluster.dynastyId,
      category: cluster.category,
      yValue,
      count: cluster.events.length,
      events: cluster.events,
    };
  });
}

function createYearClusterRenderItem(
  renderData: YearClusterRenderDataItem[],
  colors: TimelineThemeColors,
) {
  return (
    params: { dataIndex: number; coordSys?: { x: number; y: number; width: number; height: number } },
    api: { coord: (_value: [number, number]) => number[] },
  ) => {
    const item = renderData[params.dataIndex];
    if (!item) {
      return null;
    }

    const [x, y] = api.coord(item.value);
    return {
      type: 'group',
      info: { cluster: item },
      children: [
        {
          type: 'circle',
          shape: { cx: x, cy: y, r: Math.min(10 + item.count, 18) },
          style: {
            fill: colors.focusPillBg,
            stroke: colors.eventActive,
            lineWidth: 2,
            shadowBlur: 8,
            shadowColor: colors.eventActiveShadow,
          },
          info: { cluster: item },
        },
        {
          type: 'text',
          style: {
            x,
            y,
            text: `${item.count}`,
            textAlign: 'center',
            textVerticalAlign: 'middle',
            fill: colors.focusPillText,
            fontSize: 11,
            fontWeight: 700,
          },
          info: { cluster: item },
        },
      ],
    };
  };
}

function createDynastyClusterRenderItem(
  renderData: DynastyClusterRenderDataItem[],
  colors: TimelineThemeColors,
) {
  return (
    params: { dataIndex: number; coordSys?: { x: number; y: number; width: number; height: number } },
    api: { coord: (_value: [number, number]) => number[] },
  ) => {
    const item = renderData[params.dataIndex];
    if (!item || !params.coordSys) {
      return null;
    }

    const [startX, y] = api.coord([item.value[0], item.yValue]);
    const [endX] = api.coord([item.value[1], item.yValue]);
    if (startX === undefined || endX === undefined || y === undefined) {
      return null;
    }
    const width = Math.max(endX - startX, 20);
    const x = startX;
    const yTop = y - 9;
    return {
      type: 'group',
      info: { cluster: item },
      children: [
        {
          type: 'rect',
          shape: { x, y: yTop, width, height: 18, r: 9 },
          style: {
            fill: colorWithAlpha(colors.countPillBg, 0.96),
            stroke: colors.eventStroke,
            lineWidth: 1.5,
          },
          info: { cluster: item },
        },
        {
          type: 'text',
          style: {
            x: x + width / 2,
            y,
            text: `${item.count} 条`,
            textAlign: 'center',
            textVerticalAlign: 'middle',
            fill: colors.countPillText,
            fontSize: 10,
            fontWeight: 700,
          },
          info: { cluster: item },
        },
      ],
    };
  };
}

function createDynastyBandRenderItem(
  dynastyBandData: DynastyBandDataItem[],
  colors: TimelineThemeColors,
  highlightedDynastyIds: Set<string>,
  laneCount: number,
  eventCountByDynastyId: Map<string, number>,
) {
  return (
    params: {
      dataIndex: number;
      coordSys?: { x: number; y: number; width: number; height: number };
    },
    api: {
      value: (_dim: number) => number;
      coord: (_value: [number, number]) => number[];
    },
  ) => {
    const bandItem = dynastyBandData[params.dataIndex];
    if (!bandItem || !params.coordSys) {
      return null;
    }

    const { dynasty, laneIndex } = bandItem;
    if (!dynasty) {
      return null;
    }

    const perLaneBandHeight = BAND_HEIGHT / laneCount;
    const bandY = BAND_TOP + laneIndex * perLaneBandHeight;
    const startPoint = api.coord([api.value(0), bandY]);
    const endPoint = api.coord([api.value(1), bandY + perLaneBandHeight]);
    const [startX, startY] = startPoint;
    const [endX, endY] = endPoint;

    if (
      startX === undefined ||
      startY === undefined ||
      endX === undefined ||
      endY === undefined
    ) {
      return null;
    }

    const x = startX;
    const width = Math.max(endX - startX, 1);
    const y = Math.min(startY, endY);
    const height = Math.max(Math.abs(endY - startY), 1);
    const shape = echarts.graphic.clipRectByRect({ x, y, width, height }, params.coordSys);

    if (!shape) {
      return null;
    }

    const isWindowHighlighted = highlightedDynastyIds.has(dynasty.id);
    let fill = colors.dynastyFill;
    let stroke = colors.dynastyStroke;
    let shadowColor = 'transparent';
    let shadowBlur = 0;
    let lineWidth = 1;

    if (isWindowHighlighted) {
      fill = colors.dynastyWindowFill;
      stroke = colors.dynastyWindowStroke;
      shadowColor = colors.dynastyWindowShadow;
      shadowBlur = 6;
      lineWidth = 1.5;
    }

    const showLabel = shape.width >= Math.max(dynasty.name.length * 12 + 12, 36);
    const eventCount = eventCountByDynastyId.get(dynasty.id) ?? 0;

    return {
      type: 'group',
      info: { dynasty },
      children: [
        {
          type: 'rect',
          shape,
          style: {
            fill,
            stroke,
            lineWidth,
            shadowBlur,
            shadowColor,
          },
          info: { dynasty },
        },
        ...(showLabel
          ? [
              {
                type: 'text',
                style: {
                  x: shape.x + shape.width / 2,
                  y: shape.y + shape.height / 2,
                  text: eventCount > 0 ? `${dynasty.name} · ${eventCount}` : dynasty.name,
                  textAlign: 'center',
                  textVerticalAlign: 'middle',
                  fill: colors.dynastyLabel,
                  fontSize: 11,
                  fontWeight: isWindowHighlighted ? 650 : 600,
                },
                info: { dynasty },
              },
            ]
          : []),
      ],
    };
  };
}

function createEventRangeRenderItem(
  renderData: EventRenderDataItem[],
  colors: TimelineThemeColors,
) {
  return (
    params: {
      dataIndex: number;
      coordSys?: { x: number; y: number; width: number; height: number };
    },
    api: {
      coord: (_value: [number, number]) => number[];
    },
  ) => {
    const item = renderData[params.dataIndex];
    if (!item || !params.coordSys) {
      return null;
    }

    const [start, end] = item.value;
    const startPoint = api.coord([start, item.yValue]);
    const endPoint = api.coord([end, item.yValue]);
    const startX = startPoint[0];
    const endX = endPoint[0];
    const y = startPoint[1];

    if (startX === undefined || endX === undefined || y === undefined) {
      return null;
    }

    const rawX = Math.min(startX, endX);
    const rawWidth = Math.max(Math.abs(endX - startX), start === end ? 14 : 4);
    const hitArea = echarts.graphic.clipRectByRect(
      { x: rawX - 6, y: y - 12, width: rawWidth + 12, height: 24 },
      params.coordSys,
    );

    if (!hitArea) {
      return null;
    }

    const left = Math.max(rawX, params.coordSys.x);
    const right = Math.min(rawX + rawWidth, params.coordSys.x + params.coordSys.width);
    if (right <= left) {
      return null;
    }

    const centerX = (left + right) / 2;
    const renderedWidth = right - left;

    const showLabel = item.label.show && renderedWidth >= 40;

    return {
      type: 'group',
      children: [
        {
          type: 'rect',
          shape: hitArea,
          style: { fill: 'rgba(0,0,0,0)' },
        },
        {
          type: 'line',
          shape: {
            x1: left,
            y1: y,
            x2: right,
            y2: y,
          },
          style: {
            stroke: item.rangeStyle.stroke,
            lineWidth: item.rangeStyle.lineWidth,
            opacity: item.rangeStyle.opacity,
            lineCap: 'round',
            shadowBlur: item.rangeStyle.shadowBlur,
            shadowColor: item.rangeStyle.shadowColor,
          },
        },
        ...(start === end
          ? []
          : [
              {
                type: 'circle',
                shape: { cx: right, cy: y, r: item.isActive ? 4.4 : 3.4 },
                style: {
                  fill: item.rangeStyle.fill,
                  opacity: 0.72,
                },
              },
            ]),
        ...(showLabel
          ? [
              {
                type: 'text',
                style: {
                  x: centerX,
                  y: y - 12,
                  text: item.event.title,
                  textAlign: 'center',
                  textVerticalAlign: 'bottom',
                  fill: colors.eventLabel,
                  fontSize: 11,
                  fontWeight: 700,
                  backgroundColor: colors.eventLabelActiveBg,
                  padding: [2, 6],
                  borderRadius: 4,
                  width: Math.max(renderedWidth - 12, 40),
                  overflow: 'truncate' as const,
                },
              },
            ]
          : []),
      ],
    };
  };
}

function readCurrentRangeFromChart(chart: ECharts, boundsRange: TimeRange): TimeRange {
  const option = chart.getOption() as {
    dataZoom?: Array<{
      id?: string;
      startValue?: number;
      endValue?: number;
      start?: number;
      end?: number;
    }>;
  };

  const zoom =
    option.dataZoom?.find((item) => item.id === 'timeline-slider-range') ??
    option.dataZoom?.[0];

  if (!zoom) {
    return boundsRange;
  }

  let startValue = zoom.startValue;
  let endValue = zoom.endValue;

  if (startValue === undefined || endValue === undefined) {
    const span = boundsRange[1] - boundsRange[0];
    startValue = boundsRange[0] + ((zoom.start ?? 0) / 100) * span;
    endValue = boundsRange[0] + ((zoom.end ?? 100) / 100) * span;
  }

  return [startValue, endValue];
}

function formatRangeLabel(range: TimeRange): string {
  if (range[0] === range[1]) {
    return formatTimelineYear(range[0]);
  }

  return `${formatTimelineYear(range[0])} - ${formatTimelineYear(range[1])}`;
}

function buildOption(args: {
  boundsRange: TimeRange;
  timeRange: TimeRange;
  isCondensed: boolean;
  dynasties: Dynasty[];
  events: Event[];
  selectedEventId: string | null;
  highlightedDynastyIds: string[];
  highlightedDynastyId: string | null;
  colors: TimelineThemeColors;
  // feature flags
  showDynastyBands: boolean;
  showDynastyCountBadge: boolean;
  showCategoryLabels: boolean;
  showCategorySeparators: boolean;
  showSliderZoom: boolean;
  showEventLabels: boolean | null;
  eventLabelThreshold: number;
  showEventPoints: boolean;
  clusterData?: EChartsTimelineProps['clusterData'];
  enableAnimation: boolean;
  animationDuration: number;
  enablePan: boolean;
  enableZoom: boolean;
}) {
  const {
    boundsRange,
    timeRange,
    isCondensed,
    dynasties,
    events,
    selectedEventId,
    highlightedDynastyIds,
    highlightedDynastyId,
    colors,
    showDynastyBands: _showDynastyBands,
    showDynastyCountBadge: _showDynastyCountBadge,
    showCategoryLabels: _showCategoryLabels,
    showCategorySeparators: _showCategorySeparators,
    showSliderZoom: _showSliderZoom,
    showEventLabels: _showEventLabels,
    eventLabelThreshold: _eventLabelThreshold,
    showEventPoints: _showEventPoints,
    clusterData,
    enableAnimation: _enableAnimation,
    animationDuration: _animationDuration,
    enablePan: _enablePan,
    enableZoom: _enableZoom,
  } = args;

  const highlightedDynastyIdSet = new Set(highlightedDynastyIds);
  const { laneIndexes, laneCount } = assignDynastyLanes(dynasties);
  const dynastyBandData = isCondensed || !_showDynastyBands ? [] : buildDynastyBandData(dynasties, laneIndexes);
  const eventCountByDynastyId = isCondensed || !_showDynastyCountBadge
    ? new Map<string, number>()
    : (() => {
        const map = new Map<string, number>();
        for (const event of events) {
          if (event.dynastyId) {
            map.set(event.dynastyId, (map.get(event.dynastyId) ?? 0) + 1);
          }
        }
        return map;
      })();
  const visibleSpan = Math.abs(timeRange[1] - timeRange[0]);
  const showEvents = !isCondensed && _showEventPoints;
  const showEventLabels = showEvents
    && (_showEventLabels ?? visibleSpan <= _eventLabelThreshold);
  const { renderData: eventRenderData, categoryLabels } = showEvents
    ? buildCategorizedEventRenderData(events, timeRange, selectedEventId, highlightedDynastyId, showEventLabels, colors)
    : { renderData: [] as EventRenderDataItem[], categoryLabels: [] as CategoryLabelItem[] };
  const eventPointData = showEvents ? buildEventPointData(eventRenderData) : [];
  const yearClusterData = showEvents && clusterData ? buildYearClusterRenderData(clusterData.yearClusters, categoryLabels) : [];
  const dynastyClusterData = showEvents && clusterData ? buildDynastyClusterRenderData(clusterData.dynastyClusters, categoryLabels) : [];
  const separatorYData = showEvents && categoryLabels.length > 1
    ? (() => {
        const eventAreaHeight = EVENT_AREA_BOTTOM - EVENT_AREA_TOP;
        const bandHeight = eventAreaHeight / categoryLabels.length;
        const positions: number[] = [];
        for (let i = 1; i < categoryLabels.length; i++) {
          positions.push(EVENT_AREA_TOP + bandHeight * i);
        }
        return positions;
      })()
    : [];

  return {
    animation: _enableAnimation,
    animationDuration: _animationDuration,
    animationEasing: 'cubicOut' as const,
    grid: {
      left: GRID_LEFT,
      right: GRID_RIGHT,
      top: isCondensed ? 8 : 16,
      bottom: isCondensed ? 40 : 58,
      containLabel: false,
    },
    xAxis: {
      type: 'value',
      min: boundsRange[0],
      max: boundsRange[1],
      axisLabel: {
        color: colors.axisText,
        fontSize: 11,
        fontWeight: 500,
        margin: 10,
        formatter: (value: number) => formatTimelineYear(value, { short: true }),
      },
      axisLine: { show: true, lineStyle: { color: colors.axisLine } },
      axisTick: {
        show: true,
        length: 6,
        lineStyle: { color: colors.axisLine },
      },
      minorTick: {
        show: true,
        splitNumber: 4,
        length: 3,
        lineStyle: { color: colors.axisLine, opacity: 0.35 },
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: colors.axisLine,
          opacity: 0.12,
          type: 'dashed',
        },
      },
      minorSplitLine: {
        show: true,
        lineStyle: {
          color: colors.axisLine,
          opacity: 0.05,
        },
      },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 1,
      show: false,
    },
    tooltip: {
      show: !isCondensed,
      trigger: 'item',
      backgroundColor: colors.tooltipBg,
      borderColor: colors.tooltipBorder,
      textStyle: { color: colors.tooltipText, fontSize: 12 },
      formatter: (params: { data?: { event?: Event; dynasty?: Dynasty } } | unknown) => {
        const data = (params as { data?: { event?: Event; dynasty?: Dynasty } }).data;
        const dynasty = data?.dynasty;
        if (dynasty) {
          const dynastyEnd = dynasty.endYear ?? dynasty.startYear;
          return `<div style="font-weight:600;">${dynasty.name}</div><div style="margin-top:2px;color:${colors.tooltipMuted};">${formatTimelineYear(dynasty.startYear)} - ${formatTimelineYear(dynastyEnd)}</div>`;
        }

        const event = data?.event;
        if (!event) {
          return '';
        }

        const eventFinish = eventEnd(event);
        const yearText =
          eventFinish !== event.startYear
            ? `${formatTimelineYear(event.startYear)} - ${formatTimelineYear(eventFinish)}`
            : formatTimelineYear(event.startYear);
        const desc = event.description
          ? `<div style="margin-top:4px;color:${colors.tooltipDescription};max-width:240px;white-space:normal;">${event.description}</div>`
          : '';

        return `<div style="font-weight:600;">${event.title}</div><div style="margin-top:2px;color:${colors.tooltipMuted};">${yearText}</div>${desc}`;
      },
    },
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: 0,
        filterMode: 'none',
        zoomLock: true,
        zoomOnMouseWheel: _enableZoom,
        moveOnMouseWheel: false,
        moveOnMouseMove: _enablePan,
        startValue: timeRange[0],
        endValue: timeRange[1],
      },
      ...(_showSliderZoom
        ? [{
            id: 'timeline-slider-range',
        type: 'slider',
        xAxisIndex: 0,
        filterMode: 'none',
        zoomLock: true,
        height: isCondensed ? 16 : 22,
        bottom: isCondensed ? 6 : 8,
        brushSelect: false,
        showDetail: false,
        backgroundColor: colors.sliderBg,
        borderColor: colors.sliderBorder,
        fillerColor: colors.sliderFiller,
        dataBackground: {
          lineStyle: { color: colors.sliderDataLine },
          areaStyle: { color: colors.sliderDataArea },
        },
        selectedDataBackground: {
          lineStyle: { color: colors.sliderSelectedLine },
          areaStyle: { color: colors.sliderSelectedArea },
        },
        handleSize: 18,
        handleIcon:
          'path://M9.6,3.2h2.2v9.6H9.6V3.2z M14.2,3.2h2.2v9.6h-2.2V3.2z',
        handleStyle: {
          color: colors.sliderHandle,
          borderColor: colors.sliderHandleBorder,
          borderWidth: 1,
        },
        moveHandleSize: 8,
        moveHandleIcon:
          'path://M5.5,9.8V8.2h13v1.6H5.5z M8.2,5.6V4h7.6v1.6H8.2z M8.2,14V12.4h7.6V14H8.2z',
        moveHandleStyle: {
          color: colors.sliderMoveHandle,
          borderColor: colors.sliderMoveHandleBorder,
        },
        textStyle: { color: colors.axisText, fontSize: 10 },
        labelFormatter: (value: number) => formatTimelineYear(value, { short: true }),
        startValue: timeRange[0],
        endValue: timeRange[1],
      }]
      : []),
    ],
    series: [
      ...(!isCondensed && _showCategoryLabels && categoryLabels.length > 0
        ? [
            {
              id: 'category-labels',
              type: 'custom' as const,
              xAxisIndex: 0,
              yAxisIndex: 0,
              data: categoryLabels,
              z: 1,
              renderItem: (
                params: { dataIndex: number; coordSys?: { x: number; y: number; width: number; height: number } },
                api: { coord: (_value: [number, number]) => number[] },
              ) => {
                const item = categoryLabels[params.dataIndex];
                if (!item || !params.coordSys) {
                  return null;
                }
                const eventAreaHeight = EVENT_AREA_BOTTOM - EVENT_AREA_TOP;
                const bandHeight = eventAreaHeight / Math.max(item.catCount, 1);
                const yCenter = EVENT_AREA_TOP + bandHeight * (item.catIndex + 0.5);
                const [, yPx] = api.coord([0, yCenter]);
                const labelX = params.coordSys.x - 6;

                return {
                  type: 'group',
                  children: [
                    {
                      type: 'text',
                      style: {
                        x: labelX,
                        y: yPx,
                        text: item.label,
                        textAlign: 'right',
                        textVerticalAlign: 'middle',
                        fill: colors.axisText,
                        fontSize: 11,
                        fontWeight: 600,
                      },
                    },
                  ],
                };
              },
            },
          ]
        : []),
      ...(_showCategorySeparators && separatorYData.length > 0
        ? [
            {
              id: 'category-separators',
              type: 'custom' as const,
              xAxisIndex: 0,
              yAxisIndex: 0,
              data: separatorYData,
              z: 2,
              renderItem: (
                params: { dataIndex: number; coordSys?: { x: number; y: number; width: number; height: number } },
                api: { coord: (_value: [number, number]) => number[] },
              ) => {
                const yData = separatorYData[params.dataIndex];
                if (yData === undefined || !params.coordSys) {
                  return null;
                }
                const [, yPx] = api.coord([0, yData]);
                return {
                  type: 'line',
                  shape: {
                    x1: params.coordSys.x,
                    y1: yPx,
                    x2: params.coordSys.x + params.coordSys.width,
                    y2: yPx,
                  },
                  style: {
                    stroke: colors.axisLine,
                    lineWidth: 1,
                    opacity: 0.3,
                  },
                  silent: true,
                };
              },
            },
          ]
        : []),
      {
        id: 'dynasty-bands',
        type: 'custom',
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: dynastyBandData,
        z: 3,
        silent: isCondensed,
        renderItem: createDynastyBandRenderItem(
          dynastyBandData,
          colors,
          highlightedDynastyIdSet,
          laneCount,
          eventCountByDynastyId,
        ),
      },
      {
        id: 'event-ranges',
        type: 'custom',
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: eventRenderData,
        silent: isCondensed,
        z: 8,
        renderItem: createEventRangeRenderItem(eventRenderData, colors),
      },
      ...(!isCondensed && yearClusterData.length > 0
        ? [
            {
              id: 'year-clusters',
              type: 'custom' as const,
              xAxisIndex: 0,
              yAxisIndex: 0,
              data: yearClusterData,
              z: 11,
              renderItem: createYearClusterRenderItem(yearClusterData, colors),
            },
          ]
        : []),
      ...(!isCondensed && dynastyClusterData.length > 0
        ? [
            {
              id: 'dynasty-clusters',
              type: 'custom' as const,
              xAxisIndex: 0,
              yAxisIndex: 0,
              data: dynastyClusterData,
              z: 10,
              renderItem: createDynastyClusterRenderItem(dynastyClusterData, colors),
            },
          ]
        : []),
      {
        id: 'events',
        type: 'scatter',
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: eventPointData,
        silent: isCondensed,
        symbolSize: (_value: unknown, params: { data?: { symbolSize?: number } }) =>
          params.data?.symbolSize ?? 9,
        label: { show: false },
        itemStyle: {
          color: colors.event,
          borderColor: colors.eventPointBorder,
          borderWidth: 1.5,
          shadowColor: colors.eventShadow,
          shadowBlur: 6,
        },
        emphasis: {
          scale: 1.35,
          itemStyle: { color: colors.eventActive },
        },
        z: 14,
      },
    ],
  };
}

export function EChartsTimeline({
  minHeight,
  eventsData = [],
  dynastiesData = [],
  // controlled state
  timeRange: timeRangeProp,
  selectedEventId: selectedEventIdProp,
  highlightedDynastyId: highlightedDynastyIdProp,
  isCondensed: isCondensedProp,
  // initial state (uncontrolled)
  initialTimeRange,
  initialSelectedEventId = null,
  initialHighlightedDynastyId = null,
  initialIsCondensed = false,
  // features
  showHeader = true,
  showResetButton = true,
  showCondenseToggle = true,
  showDynastyBands = true,
  showDynastyCountBadge = true,
  showEventDetail = true,
  showCategoryLabels = true,
  showCategorySeparators = true,
  showSliderZoom = true,
  showEventLabels: showEventLabelsProp = null,
  eventLabelThreshold = EVENT_LABEL_SPAN_THRESHOLD,
  showEventPoints = true,
  // animation
  enableAnimation = false,
  animationDuration = 0,
  // behavior
  enablePan = true,
  enableZoom = true,
  // callbacks
  onTimeRangeChange,
  onEventSelect,
  onDynastyHighlight,
  onCondensedChange,
  onDynastyClick: onDynastyClickProp,
  onEventClick: onEventClickProp,
  onReset: onResetProp,
  clusterData,
}: EChartsTimelineProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ECharts | null>(null);
  const suppressDataZoomRef = useRef(false);

  // ── Internal state (uncontrolled mode) ──
  const [_isCondensed, _setIsCondensed] = useState(initialIsCondensed);
  const [_timeRange, _setTimeRange] = useState<TimeRange | null>(initialTimeRange ?? null);
  const [_selectedEventId, _setSelectedEventId] = useState<string | null>(initialSelectedEventId);
  const [_highlightedDynastyId, _setHighlightedDynastyId] = useState<string | null>(initialHighlightedDynastyId);
  const [highlightedRange, setHighlightedRange] = useState<TimeRange | null>(null);

  // ── Resolved values (controlled > uncontrolled) ──
  const isCondensed = isCondensedProp !== undefined ? isCondensedProp : _isCondensed;
  const timeRange = timeRangeProp !== undefined ? timeRangeProp : _timeRange;
  const selectedEventId = selectedEventIdProp !== undefined ? selectedEventIdProp : _selectedEventId;
  const highlightedDynastyId = highlightedDynastyIdProp !== undefined ? highlightedDynastyIdProp : _highlightedDynastyId;

  const themeMode = useThemeStore((state) => state.theme);

  // ── Setter helpers (update internal state + fire callback) ──
  const setIsCondensed = useCallback((value: boolean | ((p: boolean) => boolean)) => {
    const resolved = typeof value === 'function' ? (value as (p: boolean) => boolean)(isCondensed) : value;
    if (isCondensedProp === undefined) _setIsCondensed(resolved);
    onCondensedChange?.(resolved);
  }, [isCondensedProp, isCondensed, onCondensedChange]);

  const setTimeRange = useCallback((value: TimeRange | null | ((p: TimeRange | null) => TimeRange | null)) => {
    if (typeof value === 'function') {
      _setTimeRange((current) => {
        const resolved = (value as (p: TimeRange | null) => TimeRange | null)(current);
        if (resolved) onTimeRangeChange?.(resolved);
        return resolved;
      });
    } else {
      if (timeRangeProp === undefined) _setTimeRange(value);
      if (value) onTimeRangeChange?.(value);
    }
  }, [timeRangeProp, onTimeRangeChange]);

  const setSelectedEventId = useCallback((value: string | null | ((p: string | null) => string | null)) => {
    if (typeof value === 'function') {
      _setSelectedEventId((current) => {
        const resolved = (value as (p: string | null) => string | null)(current);
        onEventSelect?.(resolved);
        return resolved;
      });
    } else {
      if (selectedEventIdProp === undefined) _setSelectedEventId(value);
      onEventSelect?.(value);
    }
  }, [selectedEventIdProp, onEventSelect]);

  const setHighlightedDynastyId = useCallback((value: string | null | ((p: string | null) => string | null)) => {
    if (typeof value === 'function') {
      _setHighlightedDynastyId((current) => {
        const resolved = (value as (p: string | null) => string | null)(current);
        onDynastyHighlight?.(resolved);
        return resolved;
      });
    } else {
      if (highlightedDynastyIdProp === undefined) _setHighlightedDynastyId(value);
      onDynastyHighlight?.(value);
    }
  }, [highlightedDynastyIdProp, onDynastyHighlight]);

  const dynasties = useMemo(() => sortDynasties(dynastiesData), [dynastiesData]);
  const events = useMemo(() => sortEvents(eventsData), [eventsData]);
  const boundsRange = useMemo(() => buildBoundsRange(events, dynasties), [dynasties, events]);
  const defaultWindowRange = useMemo<TimeRange>(() => {
    const firstDynasty = dynasties[0];
    if (firstDynasty) {
      return focusRangeToDynasty(firstDynasty, boundsRange);
    }
    return buildDefaultWindowRange(boundsRange);
  }, [boundsRange, dynasties]);
  const hasExplicitHeight = minHeight !== undefined;
  const autoHeight = useMemo(() => {
    // Auto-height: compute based on visible features
    let h = 180; // dynasty bands + x-axis + axis labels + padding
    if (showEventPoints && eventsData.length > 0) h += 200; // event scatter + range area
    if (showSliderZoom) h += 40; // bottom slider
    return h;
  }, [showEventPoints, eventsData.length, showSliderZoom]);
  const chartHeight = isCondensed
    ? COLLAPSED_CHART_HEIGHT
    : (hasExplicitHeight ? minHeight! : autoHeight);
  const colors = useMemo(() => buildTimelineThemeColors(themeMode === 'light'), [themeMode]);

  useEffect(() => {
    setTimeRange((current) => {
      if (!current) {
        return defaultWindowRange;
      }

      return clampRangeToBounds(current, boundsRange);
    });
  }, [boundsRange, defaultWindowRange]);

  useEffect(() => {
    setHighlightedRange((current) => {
      if (!timeRange) {
        return current;
      }

      return isSameRange(current, timeRange) ? current : timeRange;
    });
  }, [timeRange]);

  useEffect(() => {
    if (!chartContainerRef.current || chartRef.current) {
      return;
    }

    const chart = echarts.init(chartContainerRef.current, undefined, { renderer: 'canvas' });
    chartRef.current = chart;

    const handleResize = () => {
      chart.resize();
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(chartContainerRef.current);

    return () => {
      observer.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  const effectiveRange = timeRange ?? boundsRange;
  const highlightedDynastyIds = useMemo(
    () => (highlightedRange ? getHighlightedDynastyIdsForRange(highlightedRange, dynasties) : []),
    [dynasties, highlightedRange],
  );
  const visibleEventCount = useMemo(
    () => events.filter((event) => eventOverlapsRange(event, effectiveRange)).length,
    [effectiveRange, events],
  );
  const visibleYearClusterCount = useMemo(
    () =>
      (clusterData?.yearClusters ?? []).filter(
        (cluster) => cluster.year >= effectiveRange[0] && cluster.year <= effectiveRange[1],
      ).length,
    [clusterData?.yearClusters, effectiveRange],
  );
  const visibleDynastyClusterCount = useMemo(
    () =>
      (clusterData?.dynastyClusters ?? []).filter(
        (cluster) => cluster.startYear <= effectiveRange[1] && cluster.endYear >= effectiveRange[0],
      ).length,
    [clusterData?.dynastyClusters, effectiveRange],
  );
  const highlightedDynastyNames = useMemo(
    () =>
      highlightedDynastyIds
        .map((id) => dynasties.find((dynasty) => dynasty.id === id)?.name)
        .filter((name): name is string => Boolean(name)),
    [dynasties, highlightedDynastyIds],
  );
  const displayedDynastyLabel = highlightedDynastyId
    ? dynasties.find((d) => d.id === highlightedDynastyId)?.name ?? '未高亮'
    : highlightedDynastyNames.length > 0
      ? highlightedDynastyNames.join('、')
      : '未高亮';
  const hasDynastyFocus = highlightedDynastyId !== null;
  const selectedEvent = useMemo(
    () => (selectedEventId ? events.find((e) => e.id === selectedEventId) ?? null : null),
    [events, selectedEventId],
  );
  const selectedEventDynasty = useMemo(
    () => (selectedEvent?.dynastyId ? dynasties.find((d) => d.id === selectedEvent.dynastyId) : null),
    [dynasties, selectedEvent],
  );
  const selectedEventCategory = useMemo(
    () => (selectedEvent ? getTimelineEventCategory(selectedEvent.eventType) : null),
    [selectedEvent],
  );
  const selectedEventYearText = useMemo(() => {
    if (!selectedEvent) return '';
    const finish = eventEnd(selectedEvent);
    return finish !== selectedEvent.startYear
      ? `${formatTimelineYear(selectedEvent.startYear)} - ${formatTimelineYear(finish)}`
      : formatTimelineYear(selectedEvent.startYear);
  }, [selectedEvent]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !timeRange) {
      return;
    }

    const option = buildOption({
      boundsRange,
      timeRange,
      isCondensed,
      dynasties,
      events,
      selectedEventId,
      highlightedDynastyIds,
      highlightedDynastyId,
      colors,
      showDynastyBands,
      showDynastyCountBadge,
      showCategoryLabels,
      showCategorySeparators,
      showSliderZoom,
      showEventLabels: showEventLabelsProp,
      eventLabelThreshold,
      showEventPoints,
      enableAnimation,
      animationDuration,
      enablePan,
      enableZoom,
      clusterData,
    });

    suppressDataZoomRef.current = true;
    chart.setOption(option, { notMerge: true } as SetOptionOpts);
    requestAnimationFrame(() => {
      suppressDataZoomRef.current = false;
    });
  }, [
    boundsRange,
    clusterData,
    colors,
    dynasties,
    enableAnimation,
    animationDuration,
    enablePan,
    enableZoom,
    eventLabelThreshold,
    events,
    highlightedDynastyIds,
    highlightedDynastyId,
    isCondensed,
    selectedEventId,
    showCategoryLabels,
    showCategorySeparators,
    showDynastyBands,
    showDynastyCountBadge,
    showEventLabelsProp,
    showEventPoints,
    showSliderZoom,
    timeRange,
  ]);

  const handleDataZoom = useCallback(() => {
    if (suppressDataZoomRef.current) {
      return;
    }

    const chart = chartRef.current;
    if (!chart) {
      return;
    }

    const nextRange = readCurrentRangeFromChart(chart, boundsRange);
    setTimeRange((current) => (isSameRange(current, nextRange) ? current : nextRange));
    setHighlightedRange(nextRange);
  }, [boundsRange, setTimeRange]);

  const applyNextRange = useCallback((nextRange: TimeRange) => {
    setHighlightedRange(nextRange);
    setTimeRange(nextRange);
  }, []);

  const handleDynastySingleClick = useCallback(
    (dynasty: Dynasty) => {
      const nextRange = focusRangeToDynastyWithContext(dynasty, boundsRange);
      setHighlightedDynastyId((current) =>
        current === dynasty.id ? null : dynasty.id,
      );
      applyNextRange(nextRange);
    },
    [applyNextRange, boundsRange],
  );

  const resolvePayload = useCallback(
    (params: unknown) => {
      const payload = params as {
        data?: { dynasty?: Dynasty; event?: Event };
        info?: { dynasty?: Dynasty; event?: Event; cluster?: YearClusterRenderDataItem | DynastyClusterRenderDataItem };
        event?: {
          target?: { info?: { dynasty?: Dynasty; event?: Event; cluster?: YearClusterRenderDataItem | DynastyClusterRenderDataItem } };
          topTarget?: { info?: { dynasty?: Dynasty; event?: Event; cluster?: YearClusterRenderDataItem | DynastyClusterRenderDataItem } };
        };
      };

      return {
        dynasty:
          payload.data?.dynasty ??
          payload.info?.dynasty ??
          payload.event?.target?.info?.dynasty ??
          payload.event?.topTarget?.info?.dynasty,
        eventData:
          payload.data?.event ??
          payload.info?.event ??
          payload.event?.target?.info?.event ??
          payload.event?.topTarget?.info?.event,
        cluster:
          payload.info?.cluster ??
          payload.event?.target?.info?.cluster ??
          payload.event?.topTarget?.info?.cluster,
      };
    },
    [],
  );

  const handleChartClick = useCallback(
    (params: unknown) => {
      const { dynasty, eventData, cluster } = resolvePayload(params);

      if (!timeRange) {
        return;
      }

      if (dynasty) {
        handleDynastySingleClick(dynasty);
        onDynastyClickProp?.(dynasty);
        return;
      }

      if (eventData) {
        setSelectedEventId((current) => (current === eventData.id ? null : eventData.id));
        onEventClickProp?.(eventData);
        const nextRange = moveRangeToEvent(timeRange ?? boundsRange, eventData, boundsRange);
        applyNextRange(nextRange);
        return;
      }

      if (cluster?.events?.length) {
        const firstEvent = cluster.events[0];
        if (firstEvent) {
          setSelectedEventId(firstEvent.id);
          onEventClickProp?.(firstEvent);
          const nextRange = moveRangeToEvent(timeRange ?? boundsRange, firstEvent, boundsRange);
          applyNextRange(nextRange);
        }
        return;
      }

      // 点击空白区域清除高亮
      setHighlightedDynastyId(null);
      setSelectedEventId(null);
    },
    [applyNextRange, handleDynastySingleClick, resolvePayload, timeRange, boundsRange],
  );

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) {
      return;
    }

    chart.on('dataZoom', handleDataZoom);
    chart.on('click', handleChartClick);

    return () => {
      chart.off('dataZoom', handleDataZoom);
      chart.off('click', handleChartClick);
    };
  }, [handleChartClick, handleDataZoom]);

  const handleReset = useCallback(() => {
    setSelectedEventId(null);
    setHighlightedDynastyId(null);
    setHighlightedRange(defaultWindowRange);
    setTimeRange(defaultWindowRange);
    onResetProp?.();
  }, [defaultWindowRange, onResetProp, setSelectedEventId, setHighlightedDynastyId, setTimeRange]);

  const handleToggleCondensed = useCallback(() => {
    setIsCondensed((current) => !current);
  }, [setIsCondensed]);

  if (events.length === 0 && dynasties.length === 0) {
    return (
      <StateView
        mode="empty"
        title="暂无时间轴数据"
        description="请先从外部传入朝代与事件数据。"
        minHeight={`${chartHeight + 56}px`}
      />
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        flex: isCondensed || hasExplicitHeight ? '0 0 auto' : 1,
        minHeight: isCondensed ? 'auto' : (hasExplicitHeight ? `${chartHeight + 56}px` : 0),
        overflow: 'hidden',
        border: 'var(--app-panel-border, 1px solid rgba(148, 163, 184, 0.18))',
        borderRadius: '12px',
        background: 'var(--app-panel-bg-soft, var(--color-bg-card))',
        boxShadow: 'var(--app-panel-shadow-sm, var(--shadow-sm))',
      }}
    >
      {showHeader && (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1,
          flexWrap: 'wrap',
          px: 2,
          py: isCondensed ? 0.5 : 1,
          borderBottom: `1px solid ${colors.panelBorder}`,
          fontSize: 12,
          color: colors.headerText,
        }}
      >
        <Box
          sx={{
            minWidth: 0,
            flex: '1 1 320px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: 0.6,
          }}
        >
          <Box
            sx={{
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
            }}
          >
            <Box component="span" sx={{ color: colors.headerMuted, whiteSpace: 'nowrap', flexShrink: 0 }}>
              {hasDynastyFocus ? '朝代聚焦' : '当前焦点'}
            </Box>
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                minWidth: 0,
                maxWidth: 'min(100%, 280px)',
                px: 0.9,
                py: 0.35,
                borderRadius: '999px',
                backgroundColor: colors.focusPillBg,
                color: colors.focusPillText,
                fontWeight: 600,
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={displayedDynastyLabel}
            >
              {displayedDynastyLabel}
            </Box>
            <Box component="span" sx={{ color: colors.headerMuted, whiteSpace: 'nowrap', flexShrink: 0 }}>
              事件选中
            </Box>
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                minWidth: 0,
                maxWidth: 'min(100%, 280px)',
                px: 0.9,
                py: 0.35,
                borderRadius: '999px',
                backgroundColor: colors.countPillBg,
                color: colors.countPillText,
                fontWeight: 600,
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={selectedEvent?.title ?? '未选择'}
            >
              {selectedEvent?.title ?? '未选择'}
            </Box>
          </Box>
          <Box
            sx={{
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
            }}
          >
            <Box component="span" sx={{ color: colors.headerMuted, whiteSpace: 'nowrap', flexShrink: 0 }}>
              时间范围
            </Box>
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                minWidth: 0,
                px: 0.75,
                py: 0.3,
                borderRadius: '999px',
                backgroundColor: colors.countPillBg,
                color: colors.countPillText,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={formatRangeLabel(effectiveRange)}
            >
              {formatRangeLabel(effectiveRange)}
            </Box>
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                minWidth: 0,
                px: 0.75,
                py: 0.3,
                borderRadius: '999px',
                backgroundColor: colors.countPillBg,
                color: colors.countPillText,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              窗口内 {visibleEventCount} / 共 {events.length} 个事件
            </Box>
            {clusterData && (
              <Box
                component="span"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  minWidth: 0,
                  px: 0.75,
                  py: 0.3,
                  borderRadius: '999px',
                  backgroundColor: colors.countPillBg,
                  color: colors.countPillText,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={`聚合 ${visibleYearClusterCount} 年组 / 折叠 ${visibleDynastyClusterCount} 朝代组 / 模式 ${clusterData.densityMode}`}
              >
                聚合 {visibleYearClusterCount} 年组 / 折叠 {visibleDynastyClusterCount} 朝代组 / 模式 {clusterData.densityMode}
              </Box>
            )}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
          {showResetButton && (
          <button
            type="button"
            onClick={handleReset}
            style={{
              flexShrink: 0,
              background: 'transparent',
              border: `1px solid ${colors.resetButtonBorder}`,
              borderRadius: 6,
              padding: '2px 10px',
              fontSize: 11,
              color: colors.resetButtonText,
              cursor: 'pointer',
            }}
          >
            重置视图
          </button>
          )}
          {showCondenseToggle && (
          <Tooltip title={isCondensed ? '展开时间轴内容' : '收起时间轴内容'} arrow>
            <IconButton
              size="small"
              aria-label={isCondensed ? '展开时间轴内容' : '收起时间轴内容'}
              onClick={handleToggleCondensed}
              sx={{
                width: 28,
                height: 28,
                border: `1px solid ${colors.resetButtonBorder}`,
                borderRadius: '8px',
                color: isCondensed ? colors.focusPillText : colors.resetButtonText,
                backgroundColor: isCondensed ? colors.focusPillBg : 'transparent',
                '&:hover': {
                  backgroundColor: isCondensed ? colors.focusPillBg : colors.countPillBg,
                },
              }}
            >
              {isCondensed ? (
                <ZoomOutMapIcon sx={{ fontSize: 18 }} />
              ) : (
                <ZoomInMapIcon sx={{ fontSize: 18 }} />
              )}
            </IconButton>
          </Tooltip>
          )}
        </Box>
      </Box>
      )}

      {showEventDetail && selectedEvent && !isCondensed && (
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            px: 2,
            py: 1.5,
            borderBottom: `1px solid ${colors.panelBorder}`,
            backgroundColor: colorWithAlpha(
              readCssVar('--color-bg-card', themeMode === 'light' ? 'rgba(255,251,243,0.88)' : 'rgba(33,27,22,0.82)'),
              themeMode === 'light' ? 0.6 : 0.5,
            ),
            alignItems: 'flex-start',
          }}
        >
          {/* 类型图标 */}
          <Box
            sx={{
              flexShrink: 0,
              mt: 0.3,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              backgroundColor: colors.focusPillBg,
              fontSize: 16,
            }}
          >
            {selectedEventCategory === '战争' ? '⚔' : selectedEventCategory === '政治' ? '🏛' : selectedEventCategory === '文化/科技' ? '📖' : '📋'}
          </Box>

          {/* 信息区域 */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
              <Box component="span" sx={{ fontWeight: 700, fontSize: 14, color: colors.tooltipText }}>
                {selectedEvent.title}
              </Box>
              <Box
                component="span"
                sx={{
                  px: 1,
                  py: 0.2,
                  borderRadius: '999px',
                  fontSize: 11,
                  backgroundColor: colors.countPillBg,
                  color: colors.countPillText,
                  fontWeight: 600,
                }}
              >
                {selectedEventYearText}
              </Box>
              {selectedEventCategory && (
                <Box
                  component="span"
                  sx={{
                    px: 1,
                    py: 0.2,
                    borderRadius: '999px',
                    fontSize: 11,
                    backgroundColor: colors.focusPillBg,
                    color: colors.focusPillText,
                    fontWeight: 600,
                  }}
                >
                  {selectedEventCategory}
                </Box>
              )}
              {selectedEventDynasty && (
                <Box
                  component="button"
                  type="button"
                  onClick={() => {
                    setHighlightedDynastyId((current) =>
                      current === selectedEventDynasty.id ? null : selectedEventDynasty.id,
                    );
                  }}
                  sx={{
                    px: 1,
                    py: 0.2,
                    borderRadius: '999px',
                    fontSize: 11,
                    backgroundColor: 'transparent',
                    border: `1px solid ${colors.resetButtonBorder}`,
                    color: colors.resetButtonText,
                    cursor: 'pointer',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: colors.countPillBg,
                    },
                  }}
                >
                  {selectedEventDynasty.name}
                </Box>
              )}
            </Box>

            {selectedEvent.description && (
              <Box
                sx={{
                  fontSize: 12,
                  color: colors.headerText,
                  lineHeight: 1.5,
                  maxHeight: 48,
                  overflow: 'hidden',
                }}
              >
                {selectedEvent.description}
              </Box>
            )}
          </Box>

          {/* 关闭按钮 */}
          <Box
            component="button"
            type="button"
            onClick={() => {
              setSelectedEventId(null);
            }}
            sx={{
              flexShrink: 0,
              backgroundColor: 'transparent',
              border: 'none',
              color: colors.resetButtonText,
              cursor: 'pointer',
              fontSize: 18,
              lineHeight: 1,
              p: 0.5,
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: colors.countPillBg,
                color: colors.tooltipText,
              },
            }}
          >
            ✕
          </Box>
        </Box>
      )}

      <Box
        ref={chartContainerRef}
        sx={{
          width: '100%',
          flex: isCondensed ? '0 0 auto' : 1,
          minHeight: isCondensed ? chartHeight : 0,
          height: isCondensed ? chartHeight : '100%',
        }}
      />
    </Box>
  );
}
