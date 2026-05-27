/**
 * 计算 index 相对 centerIndex 在环形索引中的"最短偏移"
 * 例如 total=10,centerIndex=0,index=9 → -1
 */
export function getWrappedOffset(
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

/**
 * 把任意角度归一到 [-π, π]
 */
export function shortestAngle(from: number, to: number): number {
  let delta = to - from;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  return delta;
}
