import { describe, expect, it } from 'vitest';
import {
  buildCircularCarouselLayout,
  getCircularCarouselItemLayout,
  getWrappedCircularOffset,
} from './circularCarousel';

describe('utils/circularCarousel', () => {
  it('getWrappedCircularOffset 会沿最短路径回绕', () => {
    expect(getWrappedCircularOffset(0, 22, 24)).toBe(2);
    expect(getWrappedCircularOffset(23, 1, 24)).toBe(-2);
  });

  it('getCircularCarouselItemLayout 让当前项落在轨道前侧', () => {
    const layout = getCircularCarouselItemLayout(4, 4, 10, {
      radiusX: 4.4,
      radiusZ: 2.5,
      visibleSlots: 7,
    });

    expect(layout.x).toBeCloseTo(0);
    expect(layout.y).toBeGreaterThan(0);
    expect(layout.z).toBeGreaterThan(0);
    expect(layout.opacity).toBe(1);
    expect(layout.visible).toBe(true);
  });

  it('buildCircularCarouselLayout 会把远处项目压到不可见区', () => {
    const layout = buildCircularCarouselLayout(24, 10, { visibleSlots: 7 });
    const hiddenItem = layout[16]!;
    const nearItem = layout[11]!;

    expect(hiddenItem.visible).toBe(false);
    expect(hiddenItem.opacity).toBe(0);
    expect(nearItem.visible).toBe(true);
    expect(nearItem.opacity).toBeGreaterThan(0.8);
  });
});
