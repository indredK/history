import type { RadialMenuDensity, RadialMenuMode, RadialMenuSide } from './types';
import {
  clamp,
  resolveAnchor,
  type RadialInsets,
  type RadialRect,
} from './placement';

/**
 * 布局计算常量
 */
const LAYOUT_CONSTANTS = {
  /** 最小显示高度阈值 - 低于此高度时隐藏组件 */
  MIN_DISPLAY_HEIGHT: 220,
  /** 紧凑模式高度阈值 - 低于此高度时切换到紧凑模式 */
  COMPACT_HEIGHT_THRESHOLD: 420,
  /** 时间轴半径计算的项目数起点 */
  TIMELINE_RADIUS_ITEM_START: 5,
  /** 时间轴半径计算的项目数终点 */
  TIMELINE_RADIUS_ITEM_END: 20,
  /** 时间轴半径相对于容器的最大比例 */
  TIMELINE_RADIUS_SCALE_CAP: 0.36,
  /** 时间轴弧度计算的项目数起点 */
  TIMELINE_ARC_ITEM_START: 5,
  /** 时间轴弧度计算的项目数终点 */
  TIMELINE_ARC_ITEM_END: 20,
  /** 时间轴指针相对半径的内缩量（像素） */
  POINTER_INSET: 14,
  /** 时间轴指针最小长度（像素） */
  POINTER_MIN_LENGTH: 28,
} as const;

export interface RadialMenuLayoutContext {
  hostWidth: number;
  hostHeight: number;
  side: RadialMenuSide;
  inset: number;
  offset: number;
  boundaryRect: RadialRect;
  safeInsets: RadialInsets;
  orbitItemCount: number;
  timelineItemCount: number;
  mode: RadialMenuMode;
  density: RadialMenuDensity;
  compactBelow: number;
  hiddenBelow: number;
}

export interface RadialMenuLayout {
  displayMode: 'full' | 'compact' | 'hidden';
  anchorX: number;
  anchorY: number;
  bearing: number;
  surfaceWidth: number;
  surfaceHeight: number;
  coreSize: number;
  orbitRadius: number;
  timelineRadius: number;
  orbitArcSpan: number;
  timelineArcSpan: number;
  pointerLength: number;
  nodeSize: number;
  labelMaxWidth: number;
  tickWidth: number;
  visibleOrbitCount: number;
}

/**
 * 密度预设
 * 半径与弧度为固定基准值，组件不再根据空余空间反复求解。
 * 时间轴半径/弧度仍会根据项目数和容器尺寸做轻量自适应（见下方函数）。
 */
interface DensityPreset {
  coreSize: number;
  nodeSize: number;
  labelMaxWidth: number;
  tickWidth: number;
  visibleOrbitCount: number;
  orbitRadius: number;
  orbitArcSpan: number;
  timelineRadiusMin: number;
  timelineRadiusMax: number;
  timelineArcMin: number;
  timelineArcMax: number;
}

const DENSITY_PRESETS: Record<RadialMenuDensity, DensityPreset> = {
  comfortable: {
    coreSize: 104,
    nodeSize: 48,
    labelMaxWidth: 220,
    tickWidth: 72,
    visibleOrbitCount: 7,
    orbitRadius: 300,
    orbitArcSpan: 104,
    timelineRadiusMin: 160,
    timelineRadiusMax: 248,
    timelineArcMin: 180,
    timelineArcMax: 122,
  },
  compact: {
    coreSize: 84,
    nodeSize: 42,
    labelMaxWidth: 164,
    tickWidth: 56,
    visibleOrbitCount: 5,
    orbitRadius: 210,
    orbitArcSpan: 84,
    timelineRadiusMin: 124,
    timelineRadiusMax: 182,
    timelineArcMin: 164,
    timelineArcMax: 112,
  },
};

/**
 * 计算时间轴半径
 * 根据项目数量在 [min, max] 间插值，并受容器尺寸上限约束。
 */
function getTimelineRadius(itemCount: number, preset: DensityPreset, hostWidth: number, hostHeight: number) {
  if (itemCount <= 1) {
    return preset.timelineRadiusMin;
  }

  const ratio = clamp(
    (itemCount - LAYOUT_CONSTANTS.TIMELINE_RADIUS_ITEM_START) /
      (LAYOUT_CONSTANTS.TIMELINE_RADIUS_ITEM_END - LAYOUT_CONSTANTS.TIMELINE_RADIUS_ITEM_START),
    0,
    1,
  );
  const desired = preset.timelineRadiusMin + ratio * (preset.timelineRadiusMax - preset.timelineRadiusMin);
  const scaleCap = Math.min(hostWidth, hostHeight) * LAYOUT_CONSTANTS.TIMELINE_RADIUS_SCALE_CAP;

  return clamp(desired, preset.timelineRadiusMin, Math.max(preset.timelineRadiusMin, scaleCap));
}

/**
 * 计算时间轴弧度张角
 * 根据项目数量动态调整，项目越多张角越大。
 */
function getTimelineArcSpan(itemCount: number, preset: DensityPreset) {
  if (itemCount <= LAYOUT_CONSTANTS.TIMELINE_ARC_ITEM_START) {
    return preset.timelineArcMin;
  }

  if (itemCount >= LAYOUT_CONSTANTS.TIMELINE_ARC_ITEM_END) {
    return preset.timelineArcMax;
  }

  const ratio =
    (itemCount - LAYOUT_CONSTANTS.TIMELINE_ARC_ITEM_START) /
    (LAYOUT_CONSTANTS.TIMELINE_ARC_ITEM_END - LAYOUT_CONSTANTS.TIMELINE_ARC_ITEM_START);

  return preset.timelineArcMin + ratio * (preset.timelineArcMax - preset.timelineArcMin);
}

/**
 * 构造内部可用矩形（扣除安全内边距）
 */
function createInnerRect(boundaryRect: RadialRect, safeInsets: RadialInsets): RadialRect {
  return {
    x: safeInsets.left,
    y: safeInsets.top,
    width: Math.max(0, boundaryRect.width - safeInsets.left - safeInsets.right),
    height: Math.max(0, boundaryRect.height - safeInsets.top - safeInsets.bottom),
  };
}

/**
 * 隐藏态布局 - 所有几何值归零
 */
function createHiddenLayout(context: RadialMenuLayoutContext): RadialMenuLayout {
  return {
    displayMode: 'hidden',
    anchorX: 0,
    anchorY: 0,
    bearing: 0,
    surfaceWidth: context.hostWidth,
    surfaceHeight: context.hostHeight,
    coreSize: 0,
    orbitRadius: 0,
    timelineRadius: 0,
    orbitArcSpan: 0,
    timelineArcSpan: 0,
    pointerLength: 0,
    nodeSize: 0,
    labelMaxWidth: 0,
    tickWidth: 0,
    visibleOrbitCount: 0,
  };
}

/**
 * 计算径向菜单布局
 *
 * 位置由父级 side 决定（left 朝右 / right 朝左），组件只负责：
 * 1. 根据容器尺寸判断 hidden / compact / full
 * 2. 选择对应密度预设
 * 3. 解析锚点位置
 * 4. 输出固定（时间轴轻量自适应）的几何参数
 *
 * @param context - 布局上下文
 * @returns 布局结果
 */
export function getRadialMenuLayout(context: RadialMenuLayoutContext): RadialMenuLayout {
  const hiddenByThreshold =
    context.hostWidth <= context.hiddenBelow || context.hostHeight <= LAYOUT_CONSTANTS.MIN_DISPLAY_HEIGHT;

  if (hiddenByThreshold) {
    return createHiddenLayout(context);
  }

  const isCompact =
    context.density === 'compact' ||
    context.hostWidth <= context.compactBelow ||
    context.hostHeight <= LAYOUT_CONSTANTS.COMPACT_HEIGHT_THRESHOLD;
  const displayMode: 'full' | 'compact' = isCompact ? 'compact' : 'full';
  const preset = DENSITY_PRESETS[isCompact ? 'compact' : 'comfortable'];

  const innerRect = createInnerRect(context.boundaryRect, context.safeInsets);

  // 朝外展开：核心从边缘内移一个半径的距离，让节点扇向边缘侧。
  // 偏离中心的节点半径会略微增大（见 getOrbitNodeVisual），这里一并计入，
  // 避免最外侧节点越过容器边缘。标签朝最外侧延伸，落在 inset 预留的间距里。
  // 上限：核心最多移到容器水平中线，避免窄容器里越过中线。
  const offCenterBump = Math.max(18, preset.nodeSize * 0.68);
  const maxReach = Math.max(preset.coreSize / 2, innerRect.width / 2 - context.inset);
  const reach = Math.min(preset.orbitRadius + offCenterBump, maxReach);
  const anchor = resolveAnchor(context.side, innerRect, context.inset, reach, context.offset);

  const timelineItemCount = Math.max(context.timelineItemCount, 1);
  const timelineRadius = getTimelineRadius(timelineItemCount, preset, context.hostWidth, context.hostHeight);
  const timelineArcSpan = getTimelineArcSpan(timelineItemCount, preset);
  const pointerLength = Math.max(
    Math.max(timelineRadius, preset.orbitRadius) - LAYOUT_CONSTANTS.POINTER_INSET,
    LAYOUT_CONSTANTS.POINTER_MIN_LENGTH,
  );

  return {
    displayMode,
    anchorX: anchor.anchorX,
    anchorY: anchor.anchorY,
    bearing: anchor.bearing,
    surfaceWidth: context.hostWidth,
    surfaceHeight: context.hostHeight,
    coreSize: preset.coreSize,
    orbitRadius: preset.orbitRadius,
    timelineRadius,
    orbitArcSpan: preset.orbitArcSpan,
    timelineArcSpan,
    pointerLength,
    nodeSize: preset.nodeSize,
    labelMaxWidth: preset.labelMaxWidth,
    tickWidth: preset.tickWidth,
    visibleOrbitCount: preset.visibleOrbitCount,
  };
}
