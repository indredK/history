/**
 * 朝代甘特泳道图
 *
 * 用 ECharts custom series 把 time.json 画成「政权 × 时间」的甘特泳道图：
 * 左侧 63 个政权为行，顶部为公元年份轴，行内色块表示政权/君主/年号区间。
 *
 * 图表填满可视区，缩放交给 ECharts dataZoom：
 *  - 横向：Ctrl+滚轮缩放时间 / 底部时间滑块拖动 / 拖空白平移；
 *  - 纵向：普通滚轮翻行 / 右侧滚动条（行高 ~28px 可读，超出窗口内部滚动）。
 * 顶部「每年像素」控件（−/滑块/+/适应宽度）与横向 dataZoom 双向联动：
 * 视口宽固定时「每年像素」等价于「可见年数」，即 dataZoom 横向窗口宽。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Paper, Slider, Tooltip, Typography } from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import * as echarts from 'echarts/core';
import { CustomChart } from 'echarts/charts';
import {
  AxisPointerComponent,
  DataZoomComponent,
  GridComponent,
  TooltipComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { ECharts } from 'echarts/core';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { ResponsiveIconButton } from '@/components/ui/ResponsiveButton';
import { uiUtils } from '@/config';
import { loadJsonData } from '@/utils/services/dataLoaders';
import { useThemeStore } from '@/store';
import { buildGanttModel, type GanttModel, type TimeBlock } from './ganttData';
import { buildGanttColors } from './ganttPalette';
import { buildGanttOption, type GanttViewWindow } from './ganttOption';

echarts.use([
  CustomChart,
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
  AxisPointerComponent,
  CanvasRenderer,
]);

/** 单行像素高（含行内间隙），决定纵向可见行数 */
const ROW_HEIGHT = 28;
/** 左侧政权名列宽（与 ganttOption.grid.left 对齐） */
const LABEL_WIDTH = 88;
/** 右侧留白（与 ganttOption.grid.right 对齐） */
const GRID_RIGHT = 36;
/** 顶部年份轴留白（与 ganttOption.grid.top 对齐） */
const GRID_TOP = 32;
/** 底部时间滑块区高（与 ganttOption.grid.bottom 对齐） */
const GRID_BOTTOM = 40;

/** 横向密度：每年对应像素。默认贴合首版静态密度 */
const DEFAULT_PX_PER_YEAR = 1.25;
/** 放大极限：最窄可见 10 年（与 ganttOption 的 minValueSpan 对齐） */
const MIN_VISIBLE_YEARS = 10;
/** px 上下限的兜底值（chart 尚未 init、拿不到绘图宽时用） */
const FALLBACK_MIN_PX = 0.2;
const FALLBACK_MAX_PX = 10;
/** −/+ 每次按钮缩放的倍率 */
const ZOOM_STEP = 1.5;

const clampPx = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

/** 绘图区像素宽 = 画布宽 − 左右留白（与 grid 同坐标系，换算可见年数用） */
const getPlotWidth = (chart: ECharts) =>
  Math.max(1, chart.getWidth() - LABEL_WIDTH - GRID_RIGHT);

/** 绘图区像素高 = 画布高 − 上下留白（算可见行数用） */
const getPlotHeight = (chart: ECharts) =>
  Math.max(1, chart.getHeight() - GRID_TOP - GRID_BOTTOM);

/**
 * px/年 的动态上下限：
 *  - 上限 = 绘图宽 / 10  → 放大可推到 10 年窗口（最窄）
 *  - 下限 = 绘图宽 / 总跨度 → 缩小到整段时间铺满一屏（最宽，无滑块死区）
 */
function pxBoundsFor(
  plotW: number,
  bounds: [number, number],
): { minPx: number; maxPx: number } {
  const span = Math.max(1, bounds[1] - bounds[0]);
  const maxPx = plotW / MIN_VISIBLE_YEARS;
  const minPx = plotW / span;
  // 极端窄视口兜底：保证 min ≤ max
  return { minPx: Math.min(minPx, maxPx), maxPx };
}

/** pxPerYear + 绘图宽 → 横向年值窗口；锚点保持左端，窗口比总跨度宽时铺满全程 */
function xWindowFromPx(
  px: number,
  plotW: number,
  bounds: [number, number],
  anchorStart: number,
): { xStartValue: number; xEndValue: number } {
  const visibleYears = plotW / px;
  const span = bounds[1] - bounds[0];
  let s = anchorStart;
  let e = s + visibleYears;
  if (visibleYears >= span) {
    s = bounds[0];
    e = bounds[1];
  } else if (e > bounds[1]) {
    e = bounds[1];
    s = e - visibleYears;
  } else if (s < bounds[0]) {
    s = bounds[0];
    e = s + visibleYears;
  }
  return { xStartValue: s, xEndValue: e };
}

/** 据绘图高定初始可见行数 → 纵向百分比窗口（顶部对齐） */
function yWindowInitial(
  plotH: number,
  rowCount: number,
): { yStart: number; yEnd: number } {
  const visibleRows = Math.max(1, Math.floor(plotH / ROW_HEIGHT));
  const pct = Math.min(100, (visibleRows / rowCount) * 100);
  return { yStart: 0, yEnd: pct };
}

/** chart.getOption().dataZoom 的窄类型 */
interface RawZoom {
  id?: string;
  startValue?: number;
  endValue?: number;
  start?: number;
  end?: number;
}

export function DynastyGanttChart() {
  const [blocks, setBlocks] = useState<TimeBlock[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pxPerYear, setPxPerYear] = useState<number>(DEFAULT_PX_PER_YEAR);
  /** px/年 的动态上下限（随视口宽度变化），驱动滑块 min/max 与按钮禁用态 */
  const [pxBounds, setPxBounds] = useState<{ minPx: number; maxPx: number }>({
    minPx: FALLBACK_MIN_PX,
    maxPx: FALLBACK_MAX_PX,
  });
  const theme = useThemeStore((s) => s.theme);

  const hostRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ECharts | null>(null);
  /** 视口容器，用于 fitWidth 兜底测宽 */
  const scrollRef = useRef<HTMLDivElement>(null);

  // 事件 / resize 回调里读最新值用的 ref（model 加载后不再变，故回调可保持稳定）
  const modelRef = useRef<GanttModel | null>(null);
  const pxPerYearRef = useRef(pxPerYear);
  const pxBoundsRef = useRef(pxBounds);
  const viewRef = useRef<GanttViewWindow | null>(null);
  /** true 时屏蔽程序化 dispatch/setOption 引发的 dataZoom 事件回声 */
  const suppressDataZoomRef = useRef(false);
  /** true 时跳过一次 px→窗口 下发（该次 px 来自 dataZoom 反算） */
  const skipNextOptionSyncRef = useRef(false);

  // 加载 time.json（独立于明细 tab）
  useEffect(() => {
    let cancelled = false;
    loadJsonData<TimeBlock[]>('/data/json/time.json')
      .then((data) => {
        if (!cancelled) setBlocks(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '未知错误');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const model = useMemo(
    () => (blocks ? buildGanttModel(blocks) : null),
    [blocks],
  );
  const colors = useMemo(
    () => (model ? buildGanttColors(theme === 'light', model.categories) : null),
    [theme, model],
  );

  // 让事件回调读到最新 model / pxPerYear
  modelRef.current = model;
  pxPerYearRef.current = pxPerYear;
  pxBoundsRef.current = pxBounds;

  /** 重算 px 上下限（init / resize 后调用），并把 pxPerYear 钳进新界 */
  const refreshPxBounds = useCallback((chart: ECharts, m: GanttModel) => {
    const next = pxBoundsFor(getPlotWidth(chart), m.bounds);
    pxBoundsRef.current = next;
    setPxBounds(next);
    setPxPerYear((v) => clampPx(v, next.minPx, next.maxPx));
  }, []);

  /** 用户拖滑块 / 滚轮 → 读窗口、反算 pxPerYear（防回环） */
  const handleDataZoom = useCallback(() => {
    if (suppressDataZoomRef.current) return;
    const chart = chartRef.current;
    const m = modelRef.current;
    if (!chart || !m) return;

    const opt = chart.getOption() as { dataZoom?: RawZoom[] };
    const zooms = opt.dataZoom ?? [];
    const xz =
      zooms.find((d) => d.id === 'gantt-x-slider') ??
      zooms.find((d) => d.id === 'gantt-x-inside');
    const yz =
      zooms.find((d) => d.id === 'gantt-y-slider') ??
      zooms.find((d) => d.id === 'gantt-y-inside');
    if (!xz) return;

    const span = m.bounds[1] - m.bounds[0];
    // 横向窗口解析为年值（slider 给 startValue/endValue，inside 兜底用百分比换算）
    let xs = xz.startValue;
    let xe = xz.endValue;
    if (xs === undefined || xe === undefined) {
      xs = m.bounds[0] + ((xz.start ?? 0) / 100) * span;
      xe = m.bounds[0] + ((xz.end ?? 100) / 100) * span;
    }

    const prev = viewRef.current;
    viewRef.current = {
      xStartValue: xs,
      xEndValue: xe,
      yStart: yz?.start ?? prev?.yStart ?? 0,
      yEnd: yz?.end ?? prev?.yEnd ?? 100,
    };

    const visibleYears = Math.max(1e-6, xe - xs);
    const b = pxBoundsRef.current;
    const nextPx = clampPx(getPlotWidth(chart) / visibleYears, b.minPx, b.maxPx);
    if (Math.abs(nextPx - pxPerYearRef.current) > 1e-4) {
      skipNextOptionSyncRef.current = true; // 这次 setPxPerYear 不要再下发窗口
      setPxPerYear(nextPx);
    }
  }, []);

  /** resize：保持 pxPerYear 不变，按新绘图尺寸重算横向窗口 + 纵向可见行 */
  const handleResize = useCallback(() => {
    const chart = chartRef.current;
    const m = modelRef.current;
    if (!chart || !m || !viewRef.current) return;

    // 视口宽变 → 重算 px 上下限（可能把 pxPerYear 钳进新界）
    const nextBounds = pxBoundsFor(getPlotWidth(chart), m.bounds);
    pxBoundsRef.current = nextBounds;
    setPxBounds(nextBounds);
    const px = clampPx(pxPerYearRef.current, nextBounds.minPx, nextBounds.maxPx);
    if (Math.abs(px - pxPerYearRef.current) > 1e-4) setPxPerYear(px);

    const plotW = getPlotWidth(chart);
    const plotH = getPlotHeight(chart);
    const anchor = viewRef.current.xStartValue;
    const xWin = xWindowFromPx(px, plotW, m.bounds, anchor);

    const visibleRows = Math.max(1, Math.floor(plotH / ROW_HEIGHT));
    const yPct = Math.min(100, (visibleRows / m.categories.length) * 100);
    const yStart = Math.min(viewRef.current.yStart, 100 - yPct);
    const yEnd = yStart + yPct;

    viewRef.current = { ...xWin, yStart, yEnd };
    suppressDataZoomRef.current = true;
    chart.dispatchAction({
      type: 'dataZoom',
      batch: [
        { dataZoomId: 'gantt-x-inside', startValue: xWin.xStartValue, endValue: xWin.xEndValue },
        { dataZoomId: 'gantt-x-slider', startValue: xWin.xStartValue, endValue: xWin.xEndValue },
        { dataZoomId: 'gantt-y-inside', start: yStart, end: yEnd },
        { dataZoomId: 'gantt-y-slider', start: yStart, end: yEnd },
      ],
    });
    requestAnimationFrame(() => {
      suppressDataZoomRef.current = false;
    });
  }, []);

  // ── 相交高亮：竖线扫过时，高亮该年份命中的所有色块（整列）──
  /** 上次高亮的命中签名，去重避免每像素重复 dispatch */
  const lastHitSigRef = useRef<string>('');
  /** rAF 节流句柄 */
  const hoverRafRef = useRef<number | null>(null);

  /** 三个 series 的 id 与对应数据，命中判断用 */
  const SERIES_DEFS: { id: string; key: 'polityData' | 'rulerData' | 'eraData' }[] = useMemo(
    () => [
      { id: 'polity-bands', key: 'polityData' },
      { id: 'sub-rulers', key: 'rulerData' },
      { id: 'sub-eras', key: 'eraData' },
    ],
    [],
  );

  /** 根据鼠标像素 X 求年份 → 找出所有「区间含该年」的色块 → highlight（整列） */
  const handleHoverMove = useCallback(
    (offsetX: number, offsetY: number) => {
      const chart = chartRef.current;
      const m = modelRef.current;
      if (!chart || !m) return;

      // 仅在绘图区内响应（避开左侧标签列 / 顶部轴 / 底部滑块区）
      if (
        offsetX < LABEL_WIDTH ||
        offsetX > chart.getWidth() - GRID_RIGHT ||
        offsetY < GRID_TOP ||
        offsetY > chart.getHeight() - GRID_BOTTOM
      ) {
        if (lastHitSigRef.current !== '') {
          chart.dispatchAction({ type: 'downplay' });
          lastHitSigRef.current = '';
        }
        return;
      }

      // 像素 → 年份（顶部缩放轴 x[0]）
      const year = chart.convertFromPixel({ xAxisIndex: 0 }, offsetX) as number;
      if (typeof year !== 'number' || Number.isNaN(year)) return;

      // 命中：区间 [start,end] 含 year
      const batch: { seriesId: string; dataIndex: number[] }[] = [];
      const sigParts: string[] = [];
      for (const def of SERIES_DEFS) {
        const arr = m[def.key];
        const hits: number[] = [];
        for (let i = 0; i < arr.length; i++) {
          const [s, e] = arr[i]!.value;
          if (year >= s && year <= e) hits.push(i);
        }
        if (hits.length) {
          batch.push({ seriesId: def.id, dataIndex: hits });
          sigParts.push(`${def.id}:${hits.join(',')}`);
        }
      }

      const sig = sigParts.join('|');
      if (sig === lastHitSigRef.current) return; // 命中集合没变，跳过
      lastHitSigRef.current = sig;

      chart.dispatchAction({ type: 'downplay' }); // 先清旧高亮
      if (batch.length) chart.dispatchAction({ type: 'highlight', batch });
    },
    [SERIES_DEFS],
  );

  const isReady = Boolean(model && colors);

  // ECharts 实例：init + ResizeObserver + 绑 dataZoom 事件 + 卸载 dispose
  useEffect(() => {
    if (!isReady || !hostRef.current || chartRef.current) return;
    const chart = echarts.init(hostRef.current, undefined, { renderer: 'canvas' });
    chartRef.current = chart;
    // 首帧据真实绘图宽确定 px 上下限
    if (modelRef.current) refreshPxBounds(chart, modelRef.current);

    const observer = new ResizeObserver(() => {
      chart.resize();
      handleResize();
    });
    observer.observe(hostRef.current);
    chart.on('dataZoom', handleDataZoom);

    // 相交高亮：zrender 原生 mousemove（rAF 节流）+ 移出清除
    const zr = chart.getZr();
    const onZrMove = (e: { offsetX: number; offsetY: number }) => {
      const { offsetX, offsetY } = e;
      if (hoverRafRef.current !== null) return;
      hoverRafRef.current = requestAnimationFrame(() => {
        hoverRafRef.current = null;
        handleHoverMove(offsetX, offsetY);
      });
    };
    const onZrOut = () => {
      const c = chartRef.current;
      if (c && lastHitSigRef.current !== '') {
        c.dispatchAction({ type: 'downplay' });
        lastHitSigRef.current = '';
      }
    };
    zr.on('mousemove', onZrMove);
    zr.on('globalout', onZrOut);

    return () => {
      observer.disconnect();
      chart.off('dataZoom', handleDataZoom);
      zr.off('mousemove', onZrMove);
      zr.off('globalout', onZrOut);
      if (hoverRafRef.current !== null) {
        cancelAnimationFrame(hoverRafRef.current);
        hoverRafRef.current = null;
      }
      chart.dispose();
      chartRef.current = null;
    };
  }, [isReady, handleResize, handleDataZoom, refreshPxBounds, handleHoverMove]);

  // 数据 / 主题变化时重设 option：首帧据视口算初始窗口，之后用 viewRef 回填（不丢窗口）
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !model || !colors) return;

    let view = viewRef.current;
    if (!view) {
      const xWin = xWindowFromPx(
        pxPerYearRef.current,
        getPlotWidth(chart),
        model.bounds,
        model.bounds[0],
      );
      const yWin = yWindowInitial(getPlotHeight(chart), model.categories.length);
      view = { ...xWin, ...yWin };
      viewRef.current = view;
    }

    suppressDataZoomRef.current = true;
    chart.setOption(buildGanttOption(model, colors, view), { notMerge: true });
    requestAnimationFrame(() => {
      suppressDataZoomRef.current = false;
    });
  }, [model, colors]);

  // pxPerYear 变化（控件操作）→ 换算横向窗口并程序化下发（防回环）
  useEffect(() => {
    const chart = chartRef.current;
    const m = modelRef.current;
    if (!chart || !m || !viewRef.current) return;

    if (skipNextOptionSyncRef.current) {
      skipNextOptionSyncRef.current = false; // 本次 px 来自 dataZoom 反算，不回写
      return;
    }

    const xWin = xWindowFromPx(
      pxPerYear,
      getPlotWidth(chart),
      m.bounds,
      viewRef.current.xStartValue,
    );
    viewRef.current = { ...viewRef.current, ...xWin };

    suppressDataZoomRef.current = true;
    chart.dispatchAction({
      type: 'dataZoom',
      batch: [
        { dataZoomId: 'gantt-x-inside', startValue: xWin.xStartValue, endValue: xWin.xEndValue },
        { dataZoomId: 'gantt-x-slider', startValue: xWin.xStartValue, endValue: xWin.xEndValue },
      ],
    });
    requestAnimationFrame(() => {
      suppressDataZoomRef.current = false;
    });
  }, [pxPerYear]);

  const zoomOut = useCallback(
    () =>
      setPxPerYear((v) =>
        clampPx(v / ZOOM_STEP, pxBoundsRef.current.minPx, pxBoundsRef.current.maxPx),
      ),
    [],
  );
  const zoomIn = useCallback(
    () =>
      setPxPerYear((v) =>
        clampPx(v * ZOOM_STEP, pxBoundsRef.current.minPx, pxBoundsRef.current.maxPx),
      ),
    [],
  );

  // 适应宽度：横向铺满全程（pxPerYear = 下限 → 窗口落到整 bounds）
  const fitWidth = useCallback(() => {
    setPxPerYear(pxBoundsRef.current.minPx);
  }, []);

  if (error) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            backgroundColor: 'var(--theme-glass-bg)',
            border: '1px solid var(--theme-glass-border)',
            borderRadius: 'var(--glass-radius-lg, 16px)',
          }}
        >
          <Typography color="error" variant="h6">
            时间轴加载失败: {error}
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (!model || !colors) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <LoadingSkeleton />
      </Box>
    );
  }

  const atMin = pxPerYear <= pxBounds.minPx + 1e-6;
  const atMax = pxPerYear >= pxBounds.maxPx - 1e-6;

  const zoomBtnSx = {
    width: 32,
    height: 32,
    borderRadius: 1.5,
    color: 'var(--color-text-secondary)',
    '&:hover': { color: 'var(--color-primary)' },
  } as const;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        gap: 1,
      }}
    >
      {/* 缩放控件栏：固定在顶部，不随内容滚动 */}
      <Box
        sx={{
          flex: '0 0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: 0.5,
        }}
      >
        <Tooltip title="缩小（收缩时间轴）" arrow>
          <span>
            <ResponsiveIconButton
              aria-label="缩小"
              onClick={zoomOut}
              disabled={atMin}
              responsive={false}
              sx={zoomBtnSx}
            >
              <RemoveIcon sx={{ fontSize: 18 }} />
            </ResponsiveIconButton>
          </span>
        </Tooltip>

        <Slider
          aria-label="时间轴横向缩放"
          value={pxPerYear}
          min={pxBounds.minPx}
          max={pxBounds.maxPx}
          step={(pxBounds.maxPx - pxBounds.minPx) / 100 || 0.05}
          size="small"
          onChange={(_, val) =>
            setPxPerYear(clampPx(val as number, pxBounds.minPx, pxBounds.maxPx))
          }
          sx={{ width: 160, mx: 1, ...uiUtils.getThemedSliderStyles('timeline') }}
        />

        <Tooltip title="放大（展开时间轴）" arrow>
          <span>
            <ResponsiveIconButton
              aria-label="放大"
              onClick={zoomIn}
              disabled={atMax}
              responsive={false}
              sx={zoomBtnSx}
            >
              <AddIcon sx={{ fontSize: 18 }} />
            </ResponsiveIconButton>
          </span>
        </Tooltip>

        <Box
          sx={{
            width: '1px',
            height: 20,
            mx: 0.5,
            backgroundColor: 'var(--theme-glass-border)',
          }}
        />

        <Tooltip title="适应宽度（整图一屏）" arrow>
          <span>
            <ResponsiveIconButton
              aria-label="适应宽度"
              onClick={fitWidth}
              responsive={false}
              sx={zoomBtnSx}
            >
              <FitScreenIcon sx={{ fontSize: 18 }} />
            </ResponsiveIconButton>
          </span>
        </Tooltip>
      </Box>

      {/* 视口容器：图表填满，缩放/滚动由 ECharts dataZoom 接管 */}
      <Box
        ref={scrollRef}
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          borderRadius: 'var(--glass-radius-lg, 16px)',
          border: '1px solid var(--theme-glass-border)',
          backgroundColor: 'rgba(var(--glass-surface-rgb), 0.4)',
        }}
      >
        <Box ref={hostRef} sx={{ width: '100%', height: '100%' }} />
      </Box>
    </Box>
  );
}
