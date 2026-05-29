import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Drawer, IconButton, Tooltip } from '@mui/material';
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
import { EventDetailPanel } from './EventDetailPanel';
import {
  EVENT_TYPE_LABELS,
  getTimelineEventCategory,
  type TimelineEventCategory,
} from '@/features/timeline/utils/timelineFilters';
import {
  buildDefaultWindowRange,
  buildBoundsRange,
  clampRangeToBounds,
  eventOverlapsRange,
  focusRangeToDynasty,
  getDynastyRange,
  isSameRange,
  normalizeEventRange,
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
  isCondensed?: boolean;
  selectedDynastyId?: string | null;

  // ── Initial state (only for uncontrolled mode) ──
  initialTimeRange?: TimeRange;
  initialIsCondensed?: boolean;

  // ── Feature toggles ──
  /** 显示顶部信息栏，默认 true */
  showHeader?: boolean;
  /** 显示重置视图按钮，默认 true */
  showResetButton?: boolean;
  /** 显示收起/展开切换按钮，默认 true */
  showCondenseToggle?: boolean;
  /** 缩起后的显示模式，默认 default；地图模块可用 dynasties-only */
  condensedDisplayMode?: 'default' | 'dynasties-only';
  /** 显示朝代色带，默认 true */
  showDynastyBands?: boolean;
  /** 朝代色带上显示事件计数，默认 true */
  showDynastyCountBadge?: boolean;
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
  onCondensedChange?: (condensed: boolean) => void;
  onReset?: () => void;
  onEventClick?: (event: Event) => void;
  onDynastyClick?: (dynasty: Dynasty) => void;
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
  rangeStyle: {
    fill: string;
    stroke: string;
    lineWidth: number;
    shadowColor: string;
    shadowBlur: number;
    opacity: number;
  };
}

interface EventLabelDataItem {
  value: [number, number];
  event: Event;
  label: { show: boolean };
  symbol: string;
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
  eventLabel: string;
  eventLabelBg: string;
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
const COLLAPSED_DYNASTY_ONLY_HEIGHT = 54;
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
    sliderFiller: colorWithAlpha(secondary, isLight ? 0.14 : 0.18),
    sliderDataLine: colorWithAlpha(secondary, isLight ? 0.26 : 0.34),
    sliderDataArea: colorWithAlpha(secondary, isLight ? 0.08 : 0.14),
    sliderSelectedLine: colorWithAlpha(secondary, isLight ? 0.34 : 0.42),
    sliderSelectedArea: colorWithAlpha(secondary, isLight ? 0.12 : 0.18),
    sliderHandle: colorWithAlpha(secondary, isLight ? 0.78 : 0.86),
    sliderHandleBorder: colorWithAlpha(surface, 0.96),
    sliderMoveHandle: colorWithAlpha(secondary, isLight ? 0.3 : 0.4),
    sliderMoveHandleBorder: colorWithAlpha(surface, 0.88),
    dynastyFill: colorWithAlpha(secondary, isLight ? 0.14 : 0.18),
    dynastyStroke: colorWithAlpha(secondary, isLight ? 0.24 : 0.32),
    dynastyLabel: textPrimary,
    dynastyWindowFill: colorWithAlpha(primary, isLight ? 0.18 : 0.24),
    dynastyWindowStroke: colorWithAlpha(primary, isLight ? 0.72 : 0.82),
    dynastyWindowShadow: colorWithAlpha(primary, isLight ? 0.28 : 0.38),
    dynastySelectedFill: colorWithAlpha(primary, isLight ? 0.34 : 0.44),
    dynastySelectedStroke: colorWithAlpha(primary, 1),
    dynastySelectedShadow: colorWithAlpha(primary, isLight ? 0.38 : 0.52),
    event: colorWithAlpha(secondary, isLight ? 0.92 : 0.94),
    eventStroke: colorWithAlpha(secondary, isLight ? 0.74 : 0.82),
    eventShadow: colorWithAlpha(secondary, isLight ? 0.18 : 0.3),
    eventMuted: colorWithAlpha(textTertiary, isLight ? 0.28 : 0.34),
    eventMutedStroke: colorWithAlpha(textTertiary, isLight ? 0.18 : 0.24),
    eventMutedShadow: colorWithAlpha(textTertiary, 0.08),
    eventActive: isLight ? '#b86b1f' : '#f0b35c',
    eventActiveShadow: colorWithAlpha(primary, isLight ? 0.42 : 0.62),
    eventLabel: textPrimary,
    eventLabelBg: colorWithAlpha(surface, isLight ? 0.92 : 0.84),
    panelBorder: borderLight,
    headerText: textSecondary,
    headerMuted: textTertiary,
    focusPillBg: activeBg,
    focusPillText: textPrimary,
    countPillBg: colorWithAlpha(secondary, isLight ? 0.16 : 0.22),
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
  showLabels: boolean,
  colors: TimelineThemeColors,
  selectedEventId?: string | null,
): { renderData: EventRenderDataItem[]; categoryLabels: CategoryLabelItem[] } {
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
      const [start, end] = normalizeEventRange(event);
      let laneIndex = laneEnds.findIndex((laneEnd) => start > laneEnd + 1);
      if (laneIndex === -1) {
        laneIndex = laneEnds.length;
        laneEnds.push(end);
      } else {
        laneEnds[laneIndex] = Math.max(laneEnds[laneIndex]!, end);
      }
      laneIndexes.push(laneIndex);
    }
    const laneCount = Math.max(laneEnds.length, 1);

    categoryLabels.push({ label: cat, catIndex, catCount });

    // Build render items for this category
    for (let i = 0; i < catEvents.length; i++) {
      const event = catEvents[i]!;
      const inWindow = eventOverlapsRange(event, timeRange);
      const isSelected = selectedEventId === event.id;
      const laneIndex = laneIndexes[i] ?? 0;

      renderData.push({
        value: normalizeEventRange(event),
        event,
        yValue: getCategoryLaneY(laneIndex, laneCount, catIndex, catCount),
        label: { show: showLabels && inWindow },
        rangeStyle: {
          fill: isSelected ? colors.eventActive : (inWindow ? colors.event : colors.eventMuted),
          stroke: isSelected ? colors.eventActive : (inWindow ? colors.eventStroke : colors.eventMutedStroke),
          lineWidth: isSelected ? 5 : (inWindow ? 3 : 2),
          shadowColor: isSelected ? colors.eventActiveShadow : (inWindow ? colors.eventShadow : colors.eventMutedShadow),
          shadowBlur: isSelected ? 14 : (inWindow ? 4 : 0),
          opacity: isSelected ? 1 : (inWindow ? 0.82 : 0.44),
        },
      });
    }
  }

  return { renderData, categoryLabels };
}

function buildEventLabelData(renderData: EventRenderDataItem[]): EventLabelDataItem[] {
  return renderData.map((item) => {
    const category = getTimelineEventCategory(item.event.eventType);
    const [start, end] = item.value;
    return {
      value: [(start + end) / 2, item.yValue],
      event: item.event,
      label: item.label,
      symbol: CATEGORY_SYMBOL[category] ?? 'circle',
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
      ],
    };
  };
}

function createDynastyBandRenderItem(
  dynastyBandData: DynastyBandDataItem[],
  colors: TimelineThemeColors,
  laneCount: number,
  eventCountByDynastyId: Map<string, number>,
  selectedDynastyId?: string | null,
  bandTop = BAND_TOP,
  bandHeight = BAND_HEIGHT,
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

    const perLaneBandHeight = bandHeight / laneCount;
    const bandY = bandTop + laneIndex * perLaneBandHeight;
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

    const fill = colors.dynastyFill;
    const stroke = colors.dynastyStroke;
    const shadowColor = 'transparent';
    const shadowBlur = 0;
    const lineWidth = 1;

    const showLabel = shape.width >= Math.max(dynasty.name.length * 12 + 12, 36);
    const eventCount = eventCountByDynastyId.get(dynasty.id) ?? 0;
    const isSelected = selectedDynastyId === dynasty.id;

    return {
      type: 'group',
      name: 'dynasty-band-group',
      info: { dynasty },
      children: [
        {
          type: 'rect',
          name: 'dynasty-band-rect',
          shape,
          style: {
            fill: isSelected ? colors.dynastySelectedFill : fill,
            stroke: isSelected ? colors.dynastySelectedStroke : stroke,
            lineWidth: isSelected ? 2.5 : lineWidth,
            shadowBlur: isSelected ? 18 : shadowBlur,
            shadowColor: isSelected ? colors.dynastySelectedShadow : shadowColor,
          },
          emphasis: {
            style: {
              fill: colors.dynastySelectedFill,
              stroke: colors.dynastySelectedStroke,
              lineWidth: 2.5,
              shadowBlur: 18,
              shadowColor: colors.dynastySelectedShadow,
            },
          },
          info: { dynasty },
        },
        ...(showLabel
          ? [
              {
                type: 'text',
                name: 'dynasty-band-label',
                style: {
                  x: shape.x + shape.width / 2,
                  y: shape.y + shape.height / 2,
                  text: eventCount > 0 ? `${dynasty.name} · ${eventCount}` : dynasty.name,
                  textAlign: 'center',
                  textVerticalAlign: 'middle',
                  fill: colors.dynastyLabel,
                  fontSize: 11,
                  fontWeight: 600,
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
          emphasis: {
            style: {
              stroke: colors.eventActive,
              lineWidth: Math.max(item.rangeStyle.lineWidth + 2.5, 5),
              opacity: 1,
              shadowBlur: 14,
              shadowColor: colors.eventActiveShadow,
            },
          },
        },
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
  colors: TimelineThemeColors;
  // feature flags
  showDynastyBands: boolean;
  showDynastyCountBadge: boolean;
  showCategoryLabels: boolean;
  showCategorySeparators: boolean;
  showSliderZoom: boolean;
  condensedDisplayMode: 'default' | 'dynasties-only';
  showEventLabels: boolean | null;
  eventLabelThreshold: number;
  showEventPoints: boolean;
  selectedDynastyId: string | null | undefined;
  selectedEventId?: string | null;
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
    colors,
    showDynastyBands: _showDynastyBands,
    showDynastyCountBadge: _showDynastyCountBadge,
    showCategoryLabels: _showCategoryLabels,
    showCategorySeparators: _showCategorySeparators,
    showSliderZoom: _showSliderZoom,
    condensedDisplayMode: _condensedDisplayMode,
    showEventLabels: _showEventLabels,
    eventLabelThreshold: _eventLabelThreshold,
    showEventPoints: _showEventPoints,
    selectedDynastyId,
    selectedEventId,
    clusterData,
    enableAnimation: _enableAnimation,
    animationDuration: _animationDuration,
    enablePan: _enablePan,
    enableZoom: _enableZoom,
  } = args;

  const isDynastyOnlyCondensed = isCondensed && _condensedDisplayMode === 'dynasties-only';
  const { laneIndexes, laneCount } = assignDynastyLanes(dynasties);
  const shouldRenderDynastyBands = _showDynastyBands && (!isCondensed || isDynastyOnlyCondensed);
  const dynastyBandData = shouldRenderDynastyBands ? buildDynastyBandData(dynasties, laneIndexes) : [];
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
  const isDynastyFocusedLayout = !showEvents;
  const dynastyBandTop = isDynastyOnlyCondensed
    ? 0.22
    : (isDynastyFocusedLayout ? 0.42 : BAND_TOP);
  const dynastyBandHeight = isDynastyOnlyCondensed
    ? 0.52
    : (isDynastyFocusedLayout ? 0.34 : BAND_HEIGHT);
  const showEventLabels = showEvents
    && (_showEventLabels ?? visibleSpan <= _eventLabelThreshold);
  const { renderData: eventRenderData, categoryLabels } = showEvents
    ? buildCategorizedEventRenderData(events, timeRange, showEventLabels, colors, selectedEventId)
    : { renderData: [] as EventRenderDataItem[], categoryLabels: [] as CategoryLabelItem[] };
  const eventLabelData = showEvents ? buildEventLabelData(eventRenderData) : [];
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
      bottom: isDynastyOnlyCondensed ? 10 : (isCondensed ? 40 : 58),
      containLabel: false,
    },
    xAxis: {
      type: 'value',
      min: boundsRange[0],
      max: boundsRange[1],
      axisLabel: {
        show: !isDynastyOnlyCondensed,
        color: colors.axisText,
        fontSize: 11,
        fontWeight: 500,
        margin: 10,
        formatter: (value: number) => formatTimelineYear(value, { short: true }),
      },
      axisLine: { show: !isDynastyOnlyCondensed, lineStyle: { color: colors.axisLine } },
      axisTick: {
        show: !isDynastyOnlyCondensed,
        length: 6,
        lineStyle: { color: colors.axisLine },
      },
      minorTick: {
        show: !isDynastyOnlyCondensed,
        splitNumber: 4,
        length: 3,
        lineStyle: { color: colors.axisLine, opacity: 0.35 },
      },
      splitLine: {
        show: !isDynastyOnlyCondensed,
        lineStyle: {
          color: colors.axisLine,
          opacity: 0.12,
          type: 'dashed',
        },
      },
      minorSplitLine: {
        show: !isDynastyOnlyCondensed,
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
      triggerOn: 'mousemove|click',
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

        const [eventStart, eventFinish] = normalizeEventRange(event);
        const yearText =
          eventFinish !== eventStart
            ? `${formatTimelineYear(eventStart)} - ${formatTimelineYear(eventFinish)}`
            : formatTimelineYear(eventStart);
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
        zoomLock: !_enableZoom,
        zoomOnMouseWheel: _enableZoom,
        moveOnMouseWheel: false,
        moveOnMouseMove: _enablePan,
        preventDefaultMouseMove: _enablePan,
        cursorGrab: _enablePan ? 'grab' : 'default',
        cursorGrabbing: _enablePan ? 'grabbing' : 'default',
        startValue: timeRange[0],
        endValue: timeRange[1],
      },
      ...(_showSliderZoom && !isDynastyOnlyCondensed
        ? [{
            id: 'timeline-slider-range',
        type: 'slider',
        xAxisIndex: 0,
        filterMode: 'none',
        zoomLock: false,
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
        silent: isCondensed && !isDynastyOnlyCondensed,
        renderItem: createDynastyBandRenderItem(
          dynastyBandData,
          colors,
          laneCount,
          eventCountByDynastyId,
          selectedDynastyId,
          dynastyBandTop,
          dynastyBandHeight,
        ),
      },
      {
        id: 'event-ranges',
        type: 'custom',
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: eventRenderData,
        silent: false,
        z: 8,
        renderItem: createEventRangeRenderItem(eventRenderData, colors),
      },
      ...(!isCondensed && eventLabelData.length > 0
        ? [
            {
              id: 'event-labels',
              type: 'scatter' as const,
              xAxisIndex: 0,
              yAxisIndex: 0,
              data: eventLabelData,
              silent: true,
              symbolSize: 1,
              labelLayout: {
                hideOverlap: true,
              },
              itemStyle: {
                opacity: 0,
                color: 'transparent',
              },
              label: {
                show: true,
                position: 'top' as const,
                distance: 10,
                color: colors.eventLabel,
                fontSize: 11,
                fontWeight: 700,
                backgroundColor: colors.eventLabelBg,
                borderColor: colorWithAlpha(colors.eventStroke, 0.34),
                borderWidth: 1,
                borderRadius: 4,
                padding: [2, 6],
                overflow: 'truncate' as const,
                width: 120,
                formatter: (params: { data?: { event?: Event } }) => params.data?.event?.title ?? '',
              },
              emphasis: {
                disabled: true,
              },
              tooltip: {
                show: false,
              },
              z: 15,
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
              silent: true,
              renderItem: createDynastyClusterRenderItem(dynastyClusterData, colors),
            },
          ]
        : []),
    ],
  };
}

export function EChartsTimeline({
  minHeight,
  eventsData = [],
  dynastiesData = [],
  // controlled state
  timeRange: timeRangeProp,
  isCondensed: isCondensedProp,
  selectedDynastyId,
  // initial state (uncontrolled)
  initialTimeRange,
  initialIsCondensed = false,
  // features
  showHeader = true,
  showResetButton = true,
  showCondenseToggle = true,
  condensedDisplayMode = 'default',
  showDynastyBands = true,
  showDynastyCountBadge = true,
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
  onCondensedChange,
  onReset: onResetProp,
  onEventClick,
  onDynastyClick,
  clusterData,
}: EChartsTimelineProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ECharts | null>(null);
  const suppressDataZoomRef = useRef(false);
  const skipNextOptionSyncRef = useRef(false);
  const pendingRangeCommitRef = useRef<number | null>(null);

  // ── Internal state (uncontrolled mode) ──
  const [_isCondensed, _setIsCondensed] = useState(initialIsCondensed);
  const [_timeRange, _setTimeRange] = useState<TimeRange | null>(initialTimeRange ?? null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // ── Resolved values (controlled > uncontrolled) ──
  const isCondensed = isCondensedProp !== undefined ? isCondensedProp : _isCondensed;
  const timeRange = timeRangeProp !== undefined ? timeRangeProp : _timeRange;
  const isDynastyOnlyCondensed = isCondensed && condensedDisplayMode === 'dynasties-only';

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

  const setTimeRangeLocal = useCallback((value: TimeRange | null | ((p: TimeRange | null) => TimeRange | null)) => {
    if (typeof value === 'function') {
      _setTimeRange((current) => (value as (p: TimeRange | null) => TimeRange | null)(current));
      return;
    }

    if (timeRangeProp === undefined) {
      _setTimeRange(value);
    }
  }, [timeRangeProp]);

  const commitRangeToParent = useCallback((range: TimeRange | null) => {
    if (!range) {
      return;
    }
    onTimeRangeChange?.(range);
  }, [onTimeRangeChange]);

  const dynasties = useMemo(() => sortDynasties(dynastiesData), [dynastiesData]);
  const events = useMemo(() => sortEvents(eventsData), [eventsData]);
  const dynastyBandLookup = useMemo(() => {
    const { laneIndexes } = assignDynastyLanes(dynasties);
    return buildDynastyBandData(dynasties, laneIndexes);
  }, [dynasties]);
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
    ? (isDynastyOnlyCondensed ? COLLAPSED_DYNASTY_ONLY_HEIGHT : COLLAPSED_CHART_HEIGHT)
    : (hasExplicitHeight ? minHeight! : autoHeight);
  const colors = useMemo(() => buildTimelineThemeColors(themeMode === 'light'), [themeMode]);

  useEffect(() => {
    if (timeRangeProp !== undefined) {
      return;
    }

    setTimeRange((current) => {
      if (!current) {
        return defaultWindowRange;
      }

      return clampRangeToBounds(current, boundsRange);
    });
  }, [boundsRange, defaultWindowRange, setTimeRange, timeRangeProp]);

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

  useEffect(() => () => {
    if (pendingRangeCommitRef.current !== null) {
      window.clearTimeout(pendingRangeCommitRef.current);
    }
  }, []);

  const effectiveRange = timeRange ?? boundsRange;
  const selectedEventId = selectedEvent?.id ?? null;
  const visibleEventCount = useMemo(
    () => events.filter((event) => eventOverlapsRange(event, effectiveRange)).length,
    [effectiveRange, events],
  );

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) {
      return;
    }

    if (skipNextOptionSyncRef.current) {
      skipNextOptionSyncRef.current = false;
      return;
    }

    const option = buildOption({
      boundsRange,
      timeRange: effectiveRange,
      isCondensed,
      dynasties,
      events,
      colors,
      showDynastyBands,
      showDynastyCountBadge,
      showCategoryLabels,
      showCategorySeparators,
      showSliderZoom,
      condensedDisplayMode,
      showEventLabels: showEventLabelsProp,
      eventLabelThreshold,
      showEventPoints,
      selectedDynastyId,
      selectedEventId,
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
    isCondensed,
    showCategoryLabels,
    showCategorySeparators,
    showDynastyBands,
    showDynastyCountBadge,
    showEventLabelsProp,
    showEventPoints,
    showSliderZoom,
    condensedDisplayMode,
    selectedDynastyId,
    selectedEventId,
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
    skipNextOptionSyncRef.current = true;
    setTimeRangeLocal((current) => (isSameRange(current, nextRange) ? current : nextRange));
    if (pendingRangeCommitRef.current !== null) {
      window.clearTimeout(pendingRangeCommitRef.current);
    }
    pendingRangeCommitRef.current = window.setTimeout(() => {
      pendingRangeCommitRef.current = null;
      commitRangeToParent(nextRange);
    }, 120);
  }, [boundsRange, commitRangeToParent, setTimeRangeLocal]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) {
      return;
    }

    chart.on('dataZoom', handleDataZoom);

    return () => {
      chart.off('dataZoom', handleDataZoom);
    };
  }, [handleDataZoom]);

  const handleChartClick = useCallback((params: unknown) => {
    const clickParams = params as {
      info?: { dynasty?: Dynasty };
      data?: { dynasty?: Dynasty; event?: Event };
      dataIndex?: number;
      seriesId?: string;
    };
    const dynasty =
      clickParams.info?.dynasty
      ?? clickParams.data?.dynasty
      ?? (
        clickParams.seriesId === 'dynasty-bands' &&
        clickParams.dataIndex !== undefined
          ? dynastyBandLookup[clickParams.dataIndex]?.dynasty
          : undefined
      );
    if (dynasty) {
      onDynastyClick?.(dynasty);
      return;
    }

    const event = clickParams.data?.event;
    if (!event) {
      return;
    }

    setSelectedEvent(event);
    onEventClick?.(event);
  }, [dynastyBandLookup, onDynastyClick, onEventClick]);

  const handleDynastyBandClick = useCallback((params: unknown) => {
    const clickParams = params as {
      info?: { dynasty?: Dynasty };
      dataIndex?: number;
    };
    const dynasty =
      clickParams.info?.dynasty
      ?? (
        clickParams.dataIndex !== undefined
          ? dynastyBandLookup[clickParams.dataIndex]?.dynasty
          : undefined
      );

    if (dynasty) {
      onDynastyClick?.(dynasty);
    }
  }, [dynastyBandLookup, onDynastyClick]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) {
      return;
    }

    chart.on('click', handleChartClick);
    chart.on('click', { seriesId: 'dynasty-bands' }, handleDynastyBandClick);

    return () => {
      chart.off('click', handleChartClick);
      chart.off('click', handleDynastyBandClick);
    };
  }, [handleChartClick, handleDynastyBandClick]);

  const handleReset = useCallback(() => {
    setTimeRange(defaultWindowRange);
    onResetProp?.();
  }, [defaultWindowRange, onResetProp, setTimeRange]);

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
        position: 'relative',
        zIndex: 1,
        pointerEvents: 'auto',
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
      {(showHeader || showCondenseToggle) && (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: isDynastyOnlyCondensed ? 'flex-end' : 'space-between',
          gap: 1,
          flexWrap: 'wrap',
          px: 2,
          py: isCondensed ? 0.5 : 1,
          borderBottom: `1px solid ${colors.panelBorder}`,
          fontSize: 12,
          color: colors.headerText,
        }}
      >
        {!isDynastyOnlyCondensed && showHeader && (
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
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={formatRangeLabel(effectiveRange)}
              >
                {formatRangeLabel(effectiveRange)}
              </Box>
              {events.length > 0 && (
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
              )}
            </Box>
          </Box>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
          {showHeader && !isDynastyOnlyCondensed && showResetButton && (
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

      <Box
        ref={chartContainerRef}
        sx={{
          width: '100%',
          flex: isCondensed ? '0 0 auto' : 1,
          minHeight: isCondensed ? chartHeight : 0,
          height: isCondensed ? chartHeight : '100%',
        }}
      />

      <Drawer
        anchor="right"
        open={selectedEvent !== null}
        onClose={() => setSelectedEvent(null)}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '100%', sm: 420 },
              p: 2,
              background: 'var(--app-panel-bg-soft, var(--color-bg-card))',
              borderLeft: 'var(--app-panel-border, 1px solid rgba(148, 163, 184, 0.18))',
            },
          },
        }}
      >
        {selectedEvent ? (
          <EventDetailPanel
            event={selectedEvent}
            isFavorite={false}
            onToggleFavorite={() => {}}
            onShare={() => {}}
          />
        ) : null}
      </Drawer>
    </Box>
  );
}
