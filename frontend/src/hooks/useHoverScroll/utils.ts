/**
 * 悬停滚动工具函数模块
 * 提供滚动计算、区域检测和状态序列化的纯函数
 */

// ============ 类型定义 ============

export interface AreaBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface SerializedScrollState {
  scrollLeft: number;
  targetScroll: number;
  maxScroll: number;
  isEnabled: boolean;
}

export interface ScrollState {
  scrollLeft: number;
  maxScroll: number;
  hasScrollableContent: boolean;
}

// ============ 滚动计算函数 ============

/**
 * 计算滚动步长
 */
export function calculateScrollStep(
  currentScroll: number,
  targetScroll: number,
  easing: number
): number {
  const clampedEasing = Math.max(0.001, Math.min(1, easing));
  return (targetScroll - currentScroll) * clampedEasing;
}

/**
 * 判断滚动是否完成
 */
export function isScrollComplete(
  currentScroll: number,
  targetScroll: number,
  threshold: number = 0.5
): boolean {
  return Math.abs(currentScroll - targetScroll) < threshold;
}

/**
 * 根据鼠标位置计算目标滚动位置
 */
export function calculateTargetFromMousePosition(
  mouseX: number,
  containerLeft: number,
  containerWidth: number,
  maxScroll: number
): number {
  if (containerWidth <= 0 || maxScroll <= 0) return 0;
  const relativeX = mouseX - containerLeft;
  const ratio = Math.max(0, Math.min(1, relativeX / containerWidth));
  return ratio * maxScroll;
}

// ============ 区域检测函数 ============

/**
 * 判断点是否在滚动轴区域内
 */
export function isPointInScrollbarArea(
  mouseX: number,
  mouseY: number,
  containerRect: DOMRect,
  scrollbarAreaHeight: number
): boolean {
  const scrollbarTop = containerRect.bottom - scrollbarAreaHeight;
  return (
    mouseX >= containerRect.left &&
    mouseX <= containerRect.right &&
    mouseY >= scrollbarTop &&
    mouseY <= containerRect.bottom
  );
}

/**
 * 获取滚动轴区域边界
 */
export function getScrollbarAreaBounds(
  containerRect: DOMRect,
  scrollbarAreaHeight: number
): AreaBounds {
  return {
    left: containerRect.left,
    right: containerRect.right,
    top: containerRect.bottom - scrollbarAreaHeight,
    bottom: containerRect.bottom
  };
}

// ============ 状态序列化函数 ============

export function serializeScrollState(state: SerializedScrollState): string {
  return JSON.stringify(state);
}

export function deserializeScrollState(json: string): SerializedScrollState {
  const parsed = JSON.parse(json);
  if (
    typeof parsed.scrollLeft !== 'number' ||
    typeof parsed.targetScroll !== 'number' ||
    typeof parsed.maxScroll !== 'number' ||
    typeof parsed.isEnabled !== 'boolean'
  ) {
    throw new Error('Invalid scroll state format');
  }
  return {
    scrollLeft: parsed.scrollLeft,
    targetScroll: parsed.targetScroll,
    maxScroll: parsed.maxScroll,
    isEnabled: parsed.isEnabled
  };
}
