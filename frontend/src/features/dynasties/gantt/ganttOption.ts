/**
 * 朝代甘特图 - ECharts option 构建
 *
 * 用 custom series 在 category 轴（63 个政权行）上画时间区间矩形：
 *  - polity-bands：每行一条整行底色带（政权整体区间）
 *  - sub-rulers：行内上半轨（君主区间）
 *  - sub-eras：行内下半轨（年号区间）
 *
 * renderItem 用 api.coord 把 [年份, 行号] 映射为像素，api.size 求单行像素高，
 * echarts.graphic.clipRectByRect 把矩形裁剪到坐标系内（横向滚动溢出部分自动裁掉）。
 * 模式与 EChartsTimeline.tsx 的 band renderItem 一致。
 */

import * as echarts from 'echarts/core';
import type { EChartsCoreOption } from 'echarts/core';
import { formatTimelineYear } from '@/features/timeline/utils/dynastyUtils';
import type { GanttColors } from './ganttPalette';
import type { GanttDatum, GanttModel } from './ganttData';

/** custom series renderItem 的窄接口（仅取本场景需要的部分），与项目现有写法一致 */
interface RenderItemParams {
  dataIndex: number;
  coordSys?: { x: number; y: number; width: number; height: number };
}
interface RenderItemApi {
  coord: (value: [number, number]) => number[];
  size: (value: [number, number]) => number[];
}

type Lane = 'full' | 'top' | 'bottom';

/** 行内底色带相对单行高的占比（留 10% 行间隙） */
const ROW_FILL_RATIO = 0.9;

function makeBarRenderItem(
  data: GanttDatum[],
  lane: Lane,
  getFill: (d: GanttDatum) => string,
  getStroke: (d: GanttDatum) => string,
  labelColor: string,
) {
  return (params: RenderItemParams, api: RenderItemApi) => {
    const d = data[params.dataIndex];
    if (!d || !params.coordSys) return null;

    const [start, end, yIndex] = d.value;
    const startPoint = api.coord([start, yIndex]); // 行中心像素
    const endPoint = api.coord([end, yIndex]);
    const startX = startPoint[0];
    const endX = endPoint[0];
    const centerY = startPoint[1];
    if (startX === undefined || endX === undefined || centerY === undefined) {
      return null;
    }

    const bandH = api.size([0, 1])[1] ?? 0; // 单行像素高
    const rowH = bandH * ROW_FILL_RATIO;
    const halfH = rowH / 2;

    let top: number;
    let height: number;
    if (lane === 'full') {
      top = centerY - halfH;
      height = rowH;
    } else if (lane === 'top') {
      top = centerY - halfH;
      height = halfH - 1;
    } else {
      top = centerY + 1;
      height = halfH - 1;
    }

    const x = Math.min(startX, endX);
    const width = Math.max(Math.abs(endX - startX), 2); // 单年区间也保底 2px
    const rect = echarts.graphic.clipRectByRect(
      { x, y: top, width, height },
      params.coordSys,
    );
    if (!rect) return null;

    const children: unknown[] = [
      {
        type: 'rect',
        shape: rect,
        style: {
          fill: getFill(d),
          stroke: getStroke(d),
          lineWidth: lane === 'full' ? 0 : 0.5,
        },
      },
    ];

    // 仅在足够宽时画文字，避免重叠
    const minLabelWidth = d.title.length * (lane === 'full' ? 13 : 11) + 8;
    if (rect.width >= minLabelWidth) {
      children.push({
        type: 'text',
        style: {
          x: rect.x + rect.width / 2,
          y: rect.y + rect.height / 2,
          text: d.title,
          textAlign: 'center',
          textVerticalAlign: 'middle',
          fill: labelColor,
          fontSize: lane === 'full' ? 11 : 9,
          fontWeight: lane === 'full' ? 600 : 400,
        },
        silent: true,
      });
    }

    return { type: 'group', children };
  };
}

/** 当前视窗：横向用年值（与 pxPerYear→可见年数 换算对齐），纵向用百分比（category 轴原生） */
export interface GanttViewWindow {
  xStartValue: number;
  xEndValue: number;
  yStart: number;
  yEnd: number;
}

export function buildGanttOption(
  model: GanttModel,
  colors: GanttColors,
  view?: GanttViewWindow,
): EChartsCoreOption {
  // 兜底：未传 view 时显示整段时间 + 全部行（防御性，避免任何 undefined 解构抛错）
  const win: GanttViewWindow = view ?? {
    xStartValue: model.bounds[0],
    xEndValue: model.bounds[1],
    yStart: 0,
    yEnd: 100,
  };
  const option = {
    animation: false,
    grid: {
      left: 88, // 容纳最长 4~5 字政权名
      right: 36, // 24 留白 + 右侧纵向滑块宽
      top: 32, // 顶部年份轴留白
      bottom: 58, // 底部横向滑块(22) + 全程刻度轴 + 留白
      containLabel: false,
    },
    xAxis: [
      // [0] 顶部年份轴：随 dataZoom 缩放，显示当前窗口刻度
      {
        type: 'value',
        position: 'top',
        min: model.bounds[0],
        max: model.bounds[1],
        axisLabel: {
          color: colors.axisText,
          fontSize: 11,
          formatter: (v: number) => formatTimelineYear(v, { short: true }),
        },
        axisLine: { lineStyle: { color: colors.axisLine } },
        splitLine: {
          show: true,
          lineStyle: { color: colors.splitLine, type: 'dashed' },
        },
      },
      // [1] 底部全程刻度轴：固定整段 bounds、不受 dataZoom 影响，作为滑块的年份参照尺
      {
        type: 'value',
        position: 'bottom',
        min: model.bounds[0],
        max: model.bounds[1],
        axisLabel: {
          color: colors.axisText,
          fontSize: 10,
          formatter: (v: number) => formatTimelineYear(v, { short: true }),
        },
        axisLine: { lineStyle: { color: colors.axisLine } },
        axisTick: { show: true, lineStyle: { color: colors.axisLine } },
        splitLine: { show: false },
      },
    ],
    yAxis: {
      type: 'category',
      data: model.categories,
      inverse: true, // category[0]=秦 显示在最上
      axisLabel: { color: colors.axisText, fontSize: 11, interval: 0 },
      axisTick: { show: false },
      axisLine: { lineStyle: { color: colors.axisLine } },
      splitLine: { show: true, lineStyle: { color: colors.splitLine } },
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: colors.tooltipBg,
      borderColor: colors.tooltipBorder,
      textStyle: { color: colors.tooltipText, fontSize: 12 },
      formatter: (p: { data?: GanttDatum }) => {
        const d = p.data;
        if (!d) return '';
        const range = `${formatTimelineYear(d.value[0])} - ${formatTimelineYear(d.value[1])}`;
        return `<b>${d.title}</b><br/>${d.rowName} · ${range}`;
      },
    },
    dataZoom: [
      // ── 横向：时间缩放（inside）。Ctrl+滚轮缩放，拖空白横向平移 ──
      {
        id: 'gantt-x-inside',
        type: 'inside',
        xAxisIndex: 0,
        filterMode: 'none', // 必须 none：跨窗口的政权带靠 clipRect 裁剪，不能被过滤删除
        zoomOnMouseWheel: 'ctrl',
        moveOnMouseMove: true,
        moveOnMouseWheel: false,
        minValueSpan: 10, // 最窄 10 年：放大极限
        startValue: win.xStartValue,
        endValue: win.xEndValue,
      },
      // ── 横向：底部时间滑块 ──
      {
        id: 'gantt-x-slider',
        type: 'slider',
        xAxisIndex: 0,
        filterMode: 'none',
        orient: 'horizontal',
        left: 88, // 与 grid.left 对齐 → 滑块刻度对齐绘图区
        right: 36, // 与 grid.right 对齐
        bottom: 8,
        height: 22,
        brushSelect: false,
        showDetail: true, // 拖动时两端显示具体年份
        minValueSpan: 10, // 最窄 10 年：滑块收到最小即 10 年跨度
        labelPrecision: 0, // 年份取整，不显示小数
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
        handleIcon: 'path://M9.6,3.2h2.2v9.6H9.6V3.2z M14.2,3.2h2.2v9.6h-2.2V3.2z',
        handleStyle: {
          color: colors.sliderHandle,
          borderColor: colors.sliderHandleBorder,
          borderWidth: 1,
        },
        moveHandleSize: 8,
        moveHandleStyle: {
          color: colors.sliderMoveHandle,
          borderColor: colors.sliderMoveHandleBorder,
        },
        textStyle: { color: colors.axisText, fontSize: 10 },
        labelFormatter: (v: number) => formatTimelineYear(v, { short: true }),
        startValue: win.xStartValue,
        endValue: win.xEndValue,
      },
      // ── 纵向：行平移（inside）。普通滚轮翻行，不抢横向缩放 ──
      {
        id: 'gantt-y-inside',
        type: 'inside',
        yAxisIndex: 0,
        filterMode: 'none',
        zoomOnMouseWheel: false,
        moveOnMouseWheel: true,
        moveOnMouseMove: false,
        start: win.yStart,
        end: win.yEnd,
      },
      // ── 纵向：右侧滚动条 ──
      {
        id: 'gantt-y-slider',
        type: 'slider',
        yAxisIndex: 0,
        filterMode: 'none',
        orient: 'vertical',
        right: 6,
        width: 12,
        top: 32, // 与 grid.top 对齐
        bottom: 40, // 与 grid.bottom 对齐
        showDetail: false,
        showDataShadow: false,
        brushSelect: false,
        backgroundColor: colors.sliderBg,
        borderColor: colors.sliderBorder,
        fillerColor: colors.sliderFiller,
        handleStyle: {
          color: colors.sliderHandle,
          borderColor: colors.sliderHandleBorder,
          borderWidth: 1,
        },
        moveHandleStyle: {
          color: colors.sliderMoveHandle,
          borderColor: colors.sliderMoveHandleBorder,
        },
        start: win.yStart,
        end: win.yEnd,
      },
    ],
    series: [
      {
        id: 'polity-bands',
        type: 'custom',
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: model.polityData,
        z: 2,
        renderItem: makeBarRenderItem(
          model.polityData,
          'full',
          (d) => colors.bandFill(d.rowName),
          () => 'transparent',
          colors.label,
        ),
      },
      {
        id: 'sub-rulers',
        type: 'custom',
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: model.rulerData,
        z: 3,
        renderItem: makeBarRenderItem(
          model.rulerData,
          'top',
          (d) => colors.subFill(d.rowName, 'ruler'),
          (d) => colors.subStroke(d.rowName),
          colors.label,
        ),
      },
      {
        id: 'sub-eras',
        type: 'custom',
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: model.eraData,
        z: 3,
        renderItem: makeBarRenderItem(
          model.eraData,
          'bottom',
          (d) => colors.subFill(d.rowName, 'era'),
          (d) => colors.subStroke(d.rowName),
          colors.label,
        ),
      },
    ],
  };

  return option as EChartsCoreOption;
}
