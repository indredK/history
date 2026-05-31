/**
 * 朝代甘特泳道图
 *
 * 用 ECharts custom series 把 time.json 画成「政权 × 时间」的甘特泳道图：
 * 左侧 63 个政权为行，顶部为公元年份轴，行内色块表示政权/君主/年号区间。
 * 固定像素尺寸 + 原生横纵滚动；横向密度（每年像素）可通过顶部控件栏缩放，
 * 实现整图的收缩（一屏概览）/ 展开（看年号细节）。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Paper, Slider, Tooltip, Typography } from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import * as echarts from 'echarts/core';
import { CustomChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { ECharts } from 'echarts/core';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { ResponsiveIconButton } from '@/components/ui/ResponsiveButton';
import { uiUtils } from '@/config';
import { loadJsonData } from '@/utils/services/dataLoaders';
import { useThemeStore } from '@/store';
import { buildGanttModel, type TimeBlock } from './ganttData';
import { buildGanttColors } from './ganttPalette';
import { buildGanttOption } from './ganttOption';

echarts.use([CustomChart, GridComponent, TooltipComponent, CanvasRenderer]);

/** 单行像素高（含行内间隙） */
const ROW_HEIGHT = 28;
/** 顶部年份轴 + 上下留白预留高度 */
const AXIS_PAD = 48;
/** 左侧政权名列宽（与 ganttOption.grid.left 对齐） */
const LABEL_WIDTH = 88;
/** 右侧留白（与 ganttOption.grid.right 对齐，用于「适应宽度」反算） */
const GRID_RIGHT = 24;

/** 横向密度：每年对应像素。默认贴合首版静态密度 */
const DEFAULT_PX_PER_YEAR = 1.25;
/** 最大收缩：2000+ 年可压进一屏概览 */
const MIN_PX_PER_YEAR = 0.2;
/** 最大展开：放大看君主 / 年号细节 */
const MAX_PX_PER_YEAR = 10;
/** −/+ 每次按钮缩放的倍率 */
const ZOOM_STEP = 1.5;

const clampPx = (v: number) =>
  Math.min(MAX_PX_PER_YEAR, Math.max(MIN_PX_PER_YEAR, v));

export function DynastyGanttChart() {
  const [blocks, setBlocks] = useState<TimeBlock[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pxPerYear, setPxPerYear] = useState<number>(DEFAULT_PX_PER_YEAR);
  const theme = useThemeStore((s) => s.theme);

  const hostRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ECharts | null>(null);
  /** 外层滚动视口，用于「适应宽度」读取可视宽度 */
  const scrollRef = useRef<HTMLDivElement>(null);

  // 加载 time.json（独立于明细 tab）
  useEffect(() => {
    let cancelled = false;
    loadJsonData<TimeBlock[]>('/data/json/time.json')
      .then((data) => {
        if (!cancelled) setBlocks(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
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

  // 图表总尺寸：纵向按行数固定（保持 28px 可读），横向按年份跨度 × 缩放密度 → 容器原生滚动
  const chartSize = useMemo(() => {
    if (!model) return null;
    const span = model.bounds[1] - model.bounds[0];
    return {
      height: model.categories.length * ROW_HEIGHT + AXIS_PAD,
      width: Math.round(span * pxPerYear) + LABEL_WIDTH,
    };
  }, [model, pxPerYear]);

  const zoomOut = useCallback(() => setPxPerYear((v) => clampPx(v / ZOOM_STEP)), []);
  const zoomIn = useCallback(() => setPxPerYear((v) => clampPx(v * ZOOM_STEP)), []);

  // 适应宽度：反算让整跨度恰好铺满视口的密度（减去左右留白，与 grid.left/right 对齐）
  const fitWidth = useCallback(() => {
    const vw = scrollRef.current?.clientWidth;
    if (!vw || !model) return;
    const span = model.bounds[1] - model.bounds[0];
    if (span <= 0) return;
    setPxPerYear(clampPx((vw - LABEL_WIDTH - GRID_RIGHT) / span));
  }, [model]);

  // host 仅在数据就绪后才渲染（加载期是 LoadingSkeleton 占位），
  // 因此不能像模板那样只在 mount 时 init —— 那时 host 还没进 DOM。
  const isReady = Boolean(model && chartSize);

  // ECharts 实例：host 挂载后 init + ResizeObserver + 卸载 dispose
  useEffect(() => {
    if (!isReady || !hostRef.current || chartRef.current) return;
    const chart = echarts.init(hostRef.current, undefined, { renderer: 'canvas' });
    chartRef.current = chart;
    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(hostRef.current);
    return () => {
      observer.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, [isReady]);

  // 数据 / 主题变化时重设 option
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !model || !colors) return;
    chart.setOption(buildGanttOption(model, colors), { notMerge: true });
  }, [model, colors]);

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

  if (!model || !chartSize) {
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

  const atMin = pxPerYear <= MIN_PX_PER_YEAR + 1e-6;
  const atMax = pxPerYear >= MAX_PX_PER_YEAR - 1e-6;

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
          min={MIN_PX_PER_YEAR}
          max={MAX_PX_PER_YEAR}
          step={0.05}
          size="small"
          onChange={(_, val) => setPxPerYear(clampPx(val as number))}
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

      {/* 滚动视口：横向 / 纵向溢出原生滚动 */}
      <Box
        ref={scrollRef}
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          borderRadius: 'var(--glass-radius-lg, 16px)',
          border: '1px solid var(--theme-glass-border)',
          backgroundColor: 'rgba(var(--glass-surface-rgb), 0.4)',
        }}
      >
        <Box
          ref={hostRef}
          sx={{
            height: chartSize.height,
            width: chartSize.width,
            minWidth: '100%',
          }}
        />
      </Box>
    </Box>
  );
}
