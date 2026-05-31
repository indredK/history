/**
 * RadialMenu 几何计算与尺寸推导
 * 纯函数 + 常量，无 React 依赖。
 */

export const MAX_VISIBLE_ITEMS = 7;
export const ARC_SPAN_DEGREES = 50;
export const BASE_RADIUS = 360;
export const RADIUS_VARIATION = 30;

// 径向轨道缓冲与景深：
// 以「连续中心」(RAF 缓动后的 animatedIndex) 为锚，对称渲染 5 个实显节点
// 两侧各 ORBIT_BUFFER 个缓冲节点。缓冲节点的透明度/缩放按到中心的「连续
// 归一化距离」平滑衰减，进出列表恒发生在 opacity≈0 处，取代旧实现里
// 切片 [floor, floor+4] 不对称、节点在可见区凭空出现/消失的硬切。
//
// 关键约束：ORBIT_FADE_END 必须 ≤ 最外层缓冲节点的归一化距离，
// 否则最外层在卸载时仍有可见透明度 → 重现跳变。
// BUFFER=2 时最外层归一化距离约为 1.75 (中心处于半整数时)，故 FADE_END=1.7。
export const ORBIT_BUFFER = 2;
const ORBIT_FADE_START = 1.0;  // |normalized| ≤ 此值：完全显示（含弧线两端实显节点）
const ORBIT_FADE_END = 1.7;    // |normalized| ≥ 此值：完全隐藏
const ORBIT_MIN_SCALE = 0.74;  // 淡出边缘的最小缩放
const ORBIT_POSITION_CLAMP = 1.12; // 角度/半径的归一化上限，防止缓冲节点绕过 90° 跳到另一侧

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

// 时间轴「真实年代比例」与「均匀分布」的混合系数。
// 1 = 完全按真实年份（密集时期刻度挤在一起，可能重叠）；
// 0 = 完全均匀（退化为旧行为）。取 0.7：主体反映年代密度，
// 同时保留 (1-0.7)/(n-1) 的最小间距，让相邻刻度不至于完全重合。
export const TIMELINE_DENSITY_BLEND = 0.7;

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
  ratio: number,
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

  // ratio ∈ [0,1] → 从 -halfArc 到 +halfArc 度分布
  const angleDeg = (clamp(ratio, 0, 1) * 2 - 1) * halfArc;
  const angleRad = toRadians(angleDeg);
  const direction = side === 'left' ? 1 : -1;

  return {
    x: Math.cos(angleRad) * radius * direction,
    y: Math.sin(angleRad) * radius,
    angle: angleDeg,
  };
}

/**
 * 计算每个时间轴刻度的归一化位置比例（0=弧线起点，1=弧线终点）。
 *
 * 当所有刻度都有有效年份时，按真实年份在 [min,max] 区间内线性映射，
 * 再与均匀分布按 TIMELINE_DENSITY_BLEND 混合：密集时期刻度自然靠拢、
 * 长治时期拉开，弧线即成「时间密度图」；混合保留最小间距避免重叠。
 *
 * 任一年份缺失（null/NaN）或年份全相同时回退为纯均匀分布（旧行为）。
 * 输入假定已按年份升序排列（消费方 emperors/dynasties 均已排序）。
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

export function getPointerAngle(angle: number, side: 'left' | 'right') {
  return side === 'left' ? angle : 180 - angle;
}

/**
 * 计算径向节点相对「连续中心」的视觉状态（位置 + 透明度 + 缩放）。
 *
 * @param offset   节点 globalIndex 与连续中心(animatedIndex 经端点钳制)的差值
 * @param halfSpan 半窗口大小 = (visibleCount-1)/2，5 个实显节点时为 2
 * @param side     菜单贴靠侧，决定 x 方向
 *
 * normalized = offset / halfSpan：实显节点落在 [-1,1]，缓冲节点向外延伸。
 * 透明度/缩放按 |normalized| 在 [FADE_START,FADE_END] 间线性衰减，使节点
 * 进出列表恒发生在 opacity≈0 处——这是平滑滚动、消除「排队/凭空出现」的关键。
 * 位置归一化经 POSITION_CLAMP 钳制，防止缓冲节点角度越过 90° 翻到弧线另一侧。
 */
export function getOrbitNodeVisual(offset: number, halfSpan: number, side: 'left' | 'right') {
  const normalized = halfSpan > 0 ? offset / halfSpan : 0;
  const absNorm = Math.abs(normalized);

  const fade = 1 - clamp(
    (absNorm - ORBIT_FADE_START) / (ORBIT_FADE_END - ORBIT_FADE_START),
    0,
    1,
  );
  const opacity = fade;
  const scale = ORBIT_MIN_SCALE + (1 - ORBIT_MIN_SCALE) * fade;

  const posNorm = clamp(normalized, -ORBIT_POSITION_CLAMP, ORBIT_POSITION_CLAMP);
  const angle = posNorm * ARC_SPAN_DEGREES;
  const angleRad = toRadians(angle);
  const radius = BASE_RADIUS + Math.abs(posNorm) * RADIUS_VARIATION;
  const x = Math.cos(angleRad) * radius * (side === 'left' ? 1 : -1);
  const y = Math.sin(angleRad) * radius;

  return { normalized, opacity, scale, x, y };
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
