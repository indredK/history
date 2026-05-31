/**
 * RadialMenu 几何计算与尺寸推导
 * 纯函数 + 常量，无 React 依赖。
 */

import type { RadialMenuLayout } from './layout';
import { clamp, normalizeDegrees, toDegrees, toRadians } from './placement';

export { clamp, toRadians } from './placement';

/** 轨道渲染缓冲区 - 在可见范围外额外渲染的节点数量 */
export const ORBIT_BUFFER = 2;

/** 轨道淡出开始位置 - 归一化距离 */
const ORBIT_FADE_START = 1.0;

/** 轨道淡出结束位置 - 归一化距离 */
const ORBIT_FADE_END = 1.7;

/** 轨道最小缩放比例 - 远离中心的节点缩放到此比例 */
const ORBIT_MIN_SCALE = 0.74;

/** 轨道位置限制 - 节点位置的最大归一化偏移 */
const ORBIT_POSITION_CLAMP = 1.12;

/** 滚轮步进增量 - 累积此值后触发一次切换 */
export const WHEEL_STEP_DELTA = 18;

/** 滚轮重置时间（毫秒）- 超过此时间后重置累积值 */
export const WHEEL_RESET_MS = 160;

/** 动画缓动系数 - 控制动画平滑度 */
export const MOTION_EASING = 0.22;

/** 动画吸附阈值 - 小于此值时直接吸附到目标 */
export const MOTION_SNAP_THRESHOLD = 0.002;

/** 时间轴密度混合比例 - 真实年份分布与均匀分布的混合权重 */
export const TIMELINE_DENSITY_BLEND = 0.7;

/**
 * 轨道节点的视觉属性
 * 包含位置、透明度、缩放等渲染所需的所有信息
 */
export interface OrbitNodeVisual {
  /** 归一化位置 - 相对于中心的偏移量（-1 到 1） */
  normalized: number;
  /** 透明度 - 0 到 1 */
  opacity: number;
  /** 缩放比例 - 0 到 1 */
  scale: number;
  /** 节点中心 X 坐标 */
  x: number;
  /** 节点中心 Y 坐标 */
  y: number;
  /** 节点角度（度） */
  angle: number;
  /** X 方向单位向量 */
  dx: number;
  /** Y 方向单位向量 */
  dy: number;
  /** 主轴方向 - 决定标签排列方向 */
  axis: 'horizontal' | 'vertical';
  /** 标签放置位置 - 相对于节点的位置 */
  labelPlacement: 'before' | 'after';
}

/**
 * 时间轴刻度位置信息
 */
export interface TimelinePosition {
  /** 刻度中心 X 坐标 */
  x: number;
  /** 刻度中心 Y 坐标 */
  y: number;
  /** 刻度角度（度） */
  angle: number;
  /** X 方向单位向量 */
  dx: number;
  /** Y 方向单位向量 */
  dy: number;
  /** 标签位置 - 相对于刻度的方向 */
  labelPosition: 'left' | 'right' | 'top' | 'bottom';
}

type Axis = 'horizontal' | 'vertical';

/**
 * 根据方向向量判断主轴方向
 * 用于决定标签应该水平还是垂直排列
 */
function getAxis(dx: number, dy: number): Axis {
  return Math.abs(dx) >= Math.abs(dy) ? 'horizontal' : 'vertical';
}

/**
 * 计算轨道节点的视觉属性
 *
 * 根据节点相对于中心的偏移量，计算其位置、透明度、缩放等属性。
 * 远离中心的节点会逐渐淡出和缩小。
 *
 * @param offset - 节点相对于中心的偏移量（整数索引差）
 * @param halfSpan - 可见范围的半径（节点数量）
 * @param layout - 布局参数
 * @returns 节点的视觉属性
 */
export function getOrbitNodeVisual(
  offset: number,
  halfSpan: number,
  layout: Pick<RadialMenuLayout, 'anchorX' | 'anchorY' | 'bearing' | 'orbitArcSpan' | 'orbitRadius' | 'nodeSize'>,
): OrbitNodeVisual {
  const normalized = halfSpan > 0 ? offset / halfSpan : 0;
  const absNorm = Math.abs(normalized);
  const fade = 1 - clamp((absNorm - ORBIT_FADE_START) / (ORBIT_FADE_END - ORBIT_FADE_START), 0, 1);
  const opacity = fade;
  const scale = ORBIT_MIN_SCALE + (1 - ORBIT_MIN_SCALE) * fade;
  const posNorm = clamp(normalized, -ORBIT_POSITION_CLAMP, ORBIT_POSITION_CLAMP);
  const angleOffset = posNorm * (layout.orbitArcSpan / 2);
  const angle = layout.bearing + angleOffset;
  const angleRad = toRadians(angle);
  const radius = layout.orbitRadius + Math.abs(posNorm) * Math.max(18, layout.nodeSize * 0.68);
  const dx = Math.cos(angleRad);
  const dy = Math.sin(angleRad);
  const x = layout.anchorX + dx * radius;
  const y = layout.anchorY + dy * radius;
  const axis = getAxis(dx, dy);

  return {
    normalized,
    opacity,
    scale,
    x,
    y,
    angle,
    dx,
    dy,
    axis,
    labelPlacement: axis === 'horizontal'
      ? (dx >= 0 ? 'after' : 'before')
      : (dy >= 0 ? 'after' : 'before'),
  };
}

/**
 * 计算每个时间轴刻度的归一化位置比例（0=弧线起点，1=弧线终点）。
 *
 * 当所有刻度都有有效年份时，按真实年份在 [min,max] 区间内线性映射，
 * 再与均匀分布按 TIMELINE_DENSITY_BLEND 混合：密集时期刻度自然靠拢、
 * 长治时期拉开，弧线即成「时间密度图」；混合保留最小间距避免重叠。
 */
export function getTimelineRatios(years: Array<number | null | undefined>): number[] {
  const count = years.length;

  if (count <= 1) {
    return years.map(() => 0);
  }

  const uniform = years.map((_, index) => index / (count - 1));
  const allValid = years.every((year) => typeof year === 'number' && Number.isFinite(year));

  if (!allValid) {
    return uniform;
  }

  const numericYears = years as number[];
  const minYear = Math.min(...numericYears);
  const maxYear = Math.max(...numericYears);
  const span = maxYear - minYear;

  if (span <= 0) {
    return uniform;
  }

  return numericYears.map((year, index) => {
    const real = (year - minYear) / span;
    const even = index / (count - 1);
    return TIMELINE_DENSITY_BLEND * real + (1 - TIMELINE_DENSITY_BLEND) * even;
  });
}

/**
 * 计算时间轴刻度的位置信息
 *
 * @param ratio - 刻度在弧线上的归一化位置（0 到 1）
 * @param totalItems - 时间轴总项目数
 * @param layout - 布局参数
 * @returns 刻度的位置信息
 */
export function getTimelinePosition(
  ratio: number,
  totalItems: number,
  layout: Pick<RadialMenuLayout, 'anchorX' | 'anchorY' | 'bearing' | 'timelineArcSpan' | 'timelineRadius'>,
): TimelinePosition {
  const halfArc = layout.timelineArcSpan / 2;
  const angleOffset = totalItems <= 1 ? 0 : (clamp(ratio, 0, 1) * 2 - 1) * halfArc;
  const angle = layout.bearing + angleOffset;
  const angleRad = toRadians(angle);
  const dx = Math.cos(angleRad);
  const dy = Math.sin(angleRad);
  const x = layout.anchorX + dx * layout.timelineRadius;
  const y = layout.anchorY + dy * layout.timelineRadius;
  const axis = getAxis(dx, dy);

  return {
    x,
    y,
    angle,
    dx,
    dy,
    labelPosition: axis === 'horizontal'
      ? (dx >= 0 ? 'right' : 'left')
      : (dy >= 0 ? 'bottom' : 'top'),
  };
}

/**
 * 生成 SVG 弧线路径
 *
 * @param startAngleOffset - 起始角度偏移（相对于 bearing）
 * @param endAngleOffset - 结束角度偏移（相对于 bearing）
 * @param radius - 弧线半径
 * @param layout - 布局参数
 * @returns SVG 路径字符串
 */
export function getTimelineArcPath(
  startAngleOffset: number,
  endAngleOffset: number,
  radius: number,
  layout: Pick<RadialMenuLayout, 'anchorX' | 'anchorY' | 'bearing'>,
) {
  const startRadians = toRadians(layout.bearing + startAngleOffset);
  const endRadians = toRadians(layout.bearing + endAngleOffset);
  const startX = layout.anchorX + Math.cos(startRadians) * radius;
  const startY = layout.anchorY + Math.sin(startRadians) * radius;
  const endX = layout.anchorX + Math.cos(endRadians) * radius;
  const endY = layout.anchorY + Math.sin(endRadians) * radius;
  const largeArcFlag = Math.abs(endAngleOffset - startAngleOffset) > 180 ? 1 : 0;

  return `M ${startX.toFixed(1)} ${startY.toFixed(1)} A ${radius.toFixed(1)} ${radius.toFixed(1)} 0 ${largeArcFlag} 1 ${endX.toFixed(1)} ${endY.toFixed(1)}`;
}

/**
 * 将点击坐标投影到弧线上，返回归一化比例
 *
 * 用于时间轴点击交互，将鼠标点击位置映射到最近的刻度。
 *
 * @param x - 点击位置 X 坐标
 * @param y - 点击位置 Y 坐标
 * @param layout - 布局参数
 * @returns 归一化比例（0 到 1）
 */
export function projectPointToArcRatio(
  x: number,
  y: number,
  layout: Pick<RadialMenuLayout, 'anchorX' | 'anchorY' | 'bearing' | 'timelineArcSpan'>,
) {
  const absoluteAngle = toDegrees(Math.atan2(y - layout.anchorY, x - layout.anchorX));
  const relativeAngle = normalizeDegrees(absoluteAngle - layout.bearing);
  const halfArc = layout.timelineArcSpan / 2;

  return clamp((relativeAngle + halfArc) / layout.timelineArcSpan, 0, 1);
}

/**
 * 格式化时间轴年份显示
 *
 * @param value - 年份数值（负数表示公元前）
 * @param fallback - 当值无效时的后备文本
 * @returns 格式化后的年份字符串
 */
export function formatTimelineYear(value: number | null | undefined, fallback: string | undefined) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value < 0 ? `前${Math.abs(Math.trunc(value))}` : String(Math.trunc(value));
  }

  return fallback || '';
}
