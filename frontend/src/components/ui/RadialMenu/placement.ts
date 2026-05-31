import type { RadialMenuPadding, RadialMenuSide } from './types';

/**
 * 矩形区域定义
 */
export interface RadialRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 矩形内边距定义
 */
export interface RadialInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * 锚点解析结果
 * 位置由父级通过 side 指定，组件不再自行求解方向。
 */
export interface AnchorResolution {
  /** 锚点 X 坐标 */
  anchorX: number;
  /** 锚点 Y 坐标 */
  anchorY: number;
  /** 展开方向（度）- 0° 向右，180° 向左 */
  bearing: number;
}

/**
 * 将数值限制在指定范围内
 */
export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/**
 * 将角度转换为弧度
 */
export function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

/**
 * 将弧度转换为角度
 */
export function toDegrees(radians: number) {
  return (radians * 180) / Math.PI;
}

/**
 * 将角度归一化到 (-180, 180] 区间
 * 用于角度比较和计算
 */
export function normalizeDegrees(degrees: number) {
  let normalized = degrees % 360;

  if (normalized > 180) {
    normalized -= 360;
  }

  if (normalized <= -180) {
    normalized += 360;
  }

  return normalized;
}

/**
 * 解析内边距配置
 * 支持数字（四边相同）或对象（分别指定）
 */
export function resolveInsets(padding: RadialMenuPadding | undefined, fallback = 24): RadialInsets {
  if (typeof padding === 'number') {
    return { top: padding, right: padding, bottom: padding, left: padding };
  }

  return {
    top: padding?.top ?? fallback,
    right: padding?.right ?? fallback,
    bottom: padding?.bottom ?? fallback,
    left: padding?.left ?? fallback,
  };
}

/**
 * 根据 side 解析锚点位置与展开方向
 *
 * 位置完全由父级指定，且节点朝**外侧**展开（远离容器中心）：
 * - left  → 挂靠在容器左半区，垂直居中，朝左展开（bearing 180）
 * - right → 挂靠在容器右半区，垂直居中，朝右展开（bearing 0）
 *
 * 由于朝外展开，核心需要从边缘往内挪出 `reach`（展开半径 + 标签宽度）的距离，
 * 这样节点与标签才能完整落在容器内、不被裁切，同时不会盖住中间区域。
 *
 * `offset` 由父级控制，在锚点解算后整体朝外侧平移（left 朝左、right 朝右），
 * 用于把轮盘推出中间内容区。组件不再做自动方向求解或避让，行为简单可预测。
 *
 * @param side - 挂靠侧
 * @param rect - 容器矩形
 * @param inset - 距离边缘的内缩距离
 * @param reach - 朝外展开占用的宽度（半径 + 标签），决定核心离边缘多远
 * @param offset - 父级控制的朝外侧平移量（px）
 * @returns 锚点坐标与展开方向
 */
export function resolveAnchor(
  side: RadialMenuSide,
  rect: RadialRect,
  inset: number,
  reach: number,
  offset: number,
): AnchorResolution {
  const centerY = rect.y + rect.height / 2;
  const edgeOffset = inset + reach;

  if (side === 'right') {
    return {
      anchorX: rect.x + rect.width - edgeOffset + offset,
      anchorY: centerY,
      bearing: 0,
    };
  }

  return {
    anchorX: rect.x + edgeOffset - offset,
    anchorY: centerY,
    bearing: 180,
  };
}
