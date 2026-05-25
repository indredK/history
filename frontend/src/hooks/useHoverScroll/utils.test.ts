/**
 * useHoverScroll/utils.ts 单元测试 (§2.8)
 *
 * 纯函数模块,覆盖所有导出:
 *   calculateScrollStep, isScrollComplete, calculateTargetFromMousePosition,
 *   isPointInScrollbarArea, getScrollbarAreaBounds,
 *   serializeScrollState, deserializeScrollState
 */
import { describe, it, expect } from "vitest";
import {
  calculateScrollStep,
  isScrollComplete,
  calculateTargetFromMousePosition,
  isPointInScrollbarArea,
  getScrollbarAreaBounds,
  serializeScrollState,
  deserializeScrollState,
} from "./utils";

describe("useHoverScroll/utils", () => {
  describe("calculateScrollStep", () => {
    it("(target - current) * easing", () => {
      expect(calculateScrollStep(0, 100, 0.1)).toBeCloseTo(10, 5);
      expect(calculateScrollStep(50, 100, 0.5)).toBeCloseTo(25, 5);
    });
    it("easing 被 clamp 到 [0.001, 1]", () => {
      // easing=2 → clamp 至 1
      expect(calculateScrollStep(0, 100, 2)).toBeCloseTo(100, 5);
      // easing=-1 → clamp 至 0.001
      expect(calculateScrollStep(0, 1000, -1)).toBeCloseTo(1, 5);
      // easing=0 → clamp 至 0.001
      expect(calculateScrollStep(0, 1000, 0)).toBeCloseTo(1, 5);
    });
  });

  describe("isScrollComplete", () => {
    it("|current - target| < threshold(默认 0.5)→ true", () => {
      expect(isScrollComplete(100, 100.3)).toBe(true);
      expect(isScrollComplete(100, 100.7)).toBe(false);
    });
    it("自定义 threshold", () => {
      expect(isScrollComplete(100, 105, 10)).toBe(true);
      expect(isScrollComplete(100, 115, 10)).toBe(false);
    });
  });

  describe("calculateTargetFromMousePosition", () => {
    it("mouseX 位于容器中点 → 返回 maxScroll/2", () => {
      expect(calculateTargetFromMousePosition(150, 100, 200, 1000)).toBeCloseTo(
        250,
        5,
      );
    });
    it("mouseX 在容器外左侧 → ratio clamp 至 0", () => {
      expect(calculateTargetFromMousePosition(50, 100, 200, 1000)).toBe(0);
    });
    it("mouseX 在容器外右侧 → ratio clamp 至 1", () => {
      expect(calculateTargetFromMousePosition(500, 100, 200, 1000)).toBe(1000);
    });
    it("containerWidth <= 0 → 直接返回 0", () => {
      expect(calculateTargetFromMousePosition(50, 100, 0, 1000)).toBe(0);
    });
    it("maxScroll <= 0 → 直接返回 0", () => {
      expect(calculateTargetFromMousePosition(150, 100, 200, 0)).toBe(0);
    });
  });

  describe("isPointInScrollbarArea / getScrollbarAreaBounds", () => {
    const rect: DOMRect = {
      left: 100,
      right: 500,
      top: 0,
      bottom: 300,
      width: 400,
      height: 300,
      x: 100,
      y: 0,
      toJSON: () => ({}),
    };

    it("点在底部 16px 区域内 → true", () => {
      expect(isPointInScrollbarArea(200, 290, rect, 16)).toBe(true);
      expect(isPointInScrollbarArea(200, 284, rect, 16)).toBe(true); // 边界
    });
    it("点在 scrollbar 区域之上 → false", () => {
      expect(isPointInScrollbarArea(200, 283, rect, 16)).toBe(false);
    });
    it("点在容器左侧外 → false", () => {
      expect(isPointInScrollbarArea(50, 290, rect, 16)).toBe(false);
    });
    it("点在容器右侧外 → false", () => {
      expect(isPointInScrollbarArea(600, 290, rect, 16)).toBe(false);
    });

    it("getScrollbarAreaBounds 返回 4 边界", () => {
      expect(getScrollbarAreaBounds(rect, 16)).toEqual({
        left: 100,
        right: 500,
        top: 284,
        bottom: 300,
      });
    });
  });

  describe("serialize / deserializeScrollState", () => {
    it("round-trip", () => {
      const state = {
        scrollLeft: 100,
        targetScroll: 200,
        maxScroll: 500,
        isEnabled: true,
      };
      expect(deserializeScrollState(serializeScrollState(state))).toEqual(
        state,
      );
    });

    it("反序列化字段缺失 → 抛 Invalid scroll state format", () => {
      expect(() => deserializeScrollState("{}")).toThrowError(
        /Invalid scroll state format/,
      );
      expect(() =>
        deserializeScrollState(
          JSON.stringify({
            scrollLeft: 0,
            targetScroll: 0,
            maxScroll: 0,
            // 缺 isEnabled
          }),
        ),
      ).toThrowError(/Invalid scroll state format/);
    });

    it("反序列化字段类型错误 → 抛错", () => {
      expect(() =>
        deserializeScrollState(
          JSON.stringify({
            scrollLeft: "0",
            targetScroll: 0,
            maxScroll: 0,
            isEnabled: true,
          }),
        ),
      ).toThrowError(/Invalid scroll state format/);
    });
  });
});
