/**
 * RadialMenu 几何计算与尺寸推导
 * 纯函数 + 常量，无 React 依赖。
 */

export const MAX_VISIBLE_ITEMS = 5;
export const ARC_SPAN_DEGREES = 76;
export const BASE_RADIUS = 144;
export const RADIUS_VARIATION = 18;
export const WHEEL_STEP_DELTA = 18;
export const WHEEL_RESET_MS = 160;
export const MOTION_EASING = 0.22;
export const MOTION_SNAP_THRESHOLD = 0.002;

// 时间轴动态弧度配置
// 少刻度：小直径半圆（180°弧）
// 多刻度：大直径1/3圆（120°弧），弧线更长，刻度更分散
export const TIMELINE_MIN_RADIUS = 160;  // 少量刻度时的半径
export const TIMELINE_MAX_RADIUS = 240;  // 大量刻度时的大半径（接近组件高度的一半）
export const TIMELINE_MIN_ARC = 180;     // 少量刻度时的弧度（半圆）
export const TIMELINE_MAX_ARC = 120;     // 大量刻度时的弧度（1/3圆）
export const TIMELINE_ITEMS_THRESHOLD_LOW = 5;   // 少量刻度阈值
export const TIMELINE_ITEMS_THRESHOLD_HIGH = 20; // 大量刻度阈值

// ─── 尺寸推导链（单一数据源）───────────────────────────
// 所有容器尺寸都由 TIMELINE_MAX_RADIUS 推导，改半径时其余自动联动。
export const TICK_HALF_WIDTH = 36;       // 刻度按钮半宽，刻度最远触及 = 半径 + 此值
export const CONTENT_BUFFER = 20;        // 内容盒在最大触及点外的留白
export const HOVER_BUFFER = 50;          // hover 检测盒（anchor）额外缓冲，避免误触收起
// SVG / 刻度容器的中心点 = 最大半径 + 刻度半宽 + 留白
export const TIMELINE_CENTER = TIMELINE_MAX_RADIUS + TICK_HALF_WIDTH + CONTENT_BUFFER;
export const TIMELINE_BOX = TIMELINE_CENTER * 2;                       // 内容盒边长
export const ANCHOR_BOX = (TIMELINE_MAX_RADIUS + TICK_HALF_WIDTH + HOVER_BUFFER) * 2; // hover 检测盒边长
export const MENU_MIN_HEIGHT = ANCHOR_BOX;                             // 容器最小高度跟随 hover 盒

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function getTimelineArcConfig(itemCount: number) {
  if (itemCount <= TIMELINE_ITEMS_THRESHOLD_LOW) {
    return { radius: TIMELINE_MIN_RADIUS, arcSpan: TIMELINE_MIN_ARC };
  }
  if (itemCount >= TIMELINE_ITEMS_THRESHOLD_HIGH) {
    return { radius: TIMELINE_MAX_RADIUS, arcSpan: TIMELINE_MAX_ARC };
  }
  // 线性插值
  const ratio = (itemCount - TIMELINE_ITEMS_THRESHOLD_LOW) / (TIMELINE_ITEMS_THRESHOLD_HIGH - TIMELINE_ITEMS_THRESHOLD_LOW);
  return {
    radius: TIMELINE_MIN_RADIUS + ratio * (TIMELINE_MAX_RADIUS - TIMELINE_MIN_RADIUS),
    arcSpan: TIMELINE_MIN_ARC + ratio * (TIMELINE_MAX_ARC - TIMELINE_MIN_ARC),
  };
}

export function getTimelinePosition(
  index: number,
  totalItems: number,
  side: 'left' | 'right',
  radius: number,
  arcSpan: number,
) {
  const halfArc = arcSpan / 2;

  if (totalItems <= 1) {
    const direction = side === 'left' ? 1 : -1;
    return {
      x: radius * direction,
      y: 0,
      angle: 0,
    };
  }

  // 从 -halfArc 到 +halfArc 度分布
  const normalized = index / (totalItems - 1);
  const angleDeg = (normalized * 2 - 1) * halfArc;
  const angleRad = toRadians(angleDeg);
  const direction = side === 'left' ? 1 : -1;

  return {
    x: Math.cos(angleRad) * radius * direction,
    y: Math.sin(angleRad) * radius,
    angle: angleDeg,
  };
}

export function getPointerAngle(angle: number, side: 'left' | 'right') {
  return side === 'left' ? angle : 180 - angle;
}

export function getTimelineArcPath(startAngle: number, endAngle: number, radius: number) {
  const startRadians = toRadians(startAngle);
  const endRadians = toRadians(endAngle);
  const startX = TIMELINE_CENTER + Math.cos(startRadians) * radius;
  const startY = TIMELINE_CENTER + Math.sin(startRadians) * radius;
  const endX = TIMELINE_CENTER + Math.cos(endRadians) * radius;
  const endY = TIMELINE_CENTER + Math.sin(endRadians) * radius;
  const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;

  return `M ${startX.toFixed(1)} ${startY.toFixed(1)} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX.toFixed(1)} ${endY.toFixed(1)}`;
}

export function formatTimelineYear(value: number | null | undefined, fallback: string | undefined) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(Math.trunc(value));
  }

  return fallback || '';
}
