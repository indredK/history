export interface CircularCarouselOptions {
  angleStep?: number | undefined;
  radiusX?: number | undefined;
  radiusZ?: number | undefined;
  visibleSlots?: number | undefined;
  verticalLift?: number | undefined;
  zOffset?: number | undefined;
}

export interface CircularTrackPoint {
  x: number;
  y: number;
  z: number;
}

export interface CircularCarouselItemLayout extends CircularTrackPoint {
  angle: number;
  offset: number;
  emphasis: number;
  opacity: number;
  visible: boolean;
}

const DEFAULT_VISIBLE_SLOTS = 7;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function resolveVisibleSlots(total: number, requested?: number | undefined): number {
  const safeTotal = Math.max(1, total);
  const fallback = Math.min(DEFAULT_VISIBLE_SLOTS, safeTotal);
  const base = Math.min(requested ?? fallback, safeTotal);

  if (base <= 2) {
    return base;
  }

  return base % 2 === 0 ? base - 1 : base;
}

export function getWrappedCircularOffset(
  index: number,
  centerIndex: number,
  total: number,
): number {
  if (total <= 0) {
    return 0;
  }

  const half = total / 2;
  let offset = index - centerIndex;

  offset = ((offset + half) % total + total) % total - half;

  if (total % 2 === 0 && offset === -half) {
    return half;
  }

  return offset;
}

export function getCircularTrackPoint(
  angle: number,
  options: CircularCarouselOptions = {},
): CircularTrackPoint {
  const radiusX = options.radiusX ?? 4.2;
  const radiusZ = options.radiusZ ?? 2.4;
  const verticalLift = options.verticalLift ?? 0.14;
  const zOffset = options.zOffset ?? radiusZ * 0.72;

  return {
    x: Math.sin(angle) * radiusX,
    y: Math.cos(angle) * verticalLift,
    z: Math.cos(angle) * radiusZ - zOffset,
  };
}

export function getCircularCarouselItemLayout(
  index: number,
  centerIndex: number,
  total: number,
  options: CircularCarouselOptions = {},
): CircularCarouselItemLayout {
  const visibleSlots = resolveVisibleSlots(total, options.visibleSlots);
  const maxOffset = Math.max(1, Math.floor(visibleSlots / 2));
  const angleStep = options.angleStep ?? Math.PI / (visibleSlots + 1);
  const offset = getWrappedCircularOffset(index, centerIndex, total);
  const boundedOffset = Math.max(-maxOffset, Math.min(maxOffset, offset));
  const angle = boundedOffset * angleStep;
  const point = getCircularTrackPoint(angle, options);

  const fadeStart = maxOffset - 0.45;
  const hiddenDistance = maxOffset + 0.95;
  const opacity = clamp01(
    1 - Math.max(0, Math.abs(offset) - fadeStart) /
      Math.max(hiddenDistance - fadeStart, 0.01),
  );
  const emphasis = clamp01(1 - Math.abs(offset) / (maxOffset + 0.6));

  return {
    ...point,
    angle,
    offset,
    emphasis,
    opacity,
    visible: opacity > 0.04,
  };
}

export function buildCircularCarouselLayout(
  total: number,
  centerIndex: number,
  options: CircularCarouselOptions = {},
): CircularCarouselItemLayout[] {
  return Array.from({ length: total }, (_, index) =>
    getCircularCarouselItemLayout(index, centerIndex, total, options),
  );
}
