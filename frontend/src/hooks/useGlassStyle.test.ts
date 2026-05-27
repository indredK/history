/**
 * useGlassStyle / useComponentGlassStyle / useGlassPerformance 单元测试 (§2.8)
 *
 * 3 个公开 hook:
 *   useGlassStyle(options, perf): { style, className, hoverStyle }
 *   useComponentGlassStyle(componentType, perf): { style, className, hoverStyle }
 *   useGlassPerformance(): { supportsBlur, reducedMotion, isLowEnd, shouldBlur, performanceClasses }
 *
 * 设计:
 * - 把 useResponsive 与 ../config/styles 全部 mock 掉,避免依赖真实环境检测
 * - 通过修改 mock 返回值,逐分支覆盖 enableBlur on/off / reducedMotion / hover / GPU 加速等
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("./useResponsive", () => ({
  useResponsive: () => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isSmallMobile: false,
    isLandscape: true,
    screenWidth: 1280,
    screenHeight: 800,
  }),
}));

// stylesMock state — 可在每个测试里改
const stylesState = {
  supportsBlur: true,
  reducedMotion: false,
  isLowEnd: false,
  shouldBlur: true,
  performanceClasses: ["glass-perf-a"] as string[],
};

vi.mock("../config/styles", async () => {
  const baseConfig = {
    blur: {
      none: "0px",
      light: "12px",
      medium: "20px",
      heavy: "32px",
      ultra: "48px",
    },
    bgOpacity: {
      ultraLight: 0.1,
      light: 0.3,
      medium: 0.5,
      high: 0.7,
      solid: 0.85,
    },
    border: {
      color: "rgba(255,255,255,0.18)",
      width: "1px",
      radius: { sm: "8px", md: "12px", lg: "16px", xl: "24px", full: "9999px" },
    },
    shadow: {
      sm: "0 2px 8px rgba(0,0,0,0.1)",
      md: "0 4px 16px rgba(0,0,0,0.12)",
      lg: "0 8px 32px rgba(0,0,0,0.15)",
      glow: "0 0 20px rgba(255,255,255,0.1)",
      inset: "inset 0 1px 1px rgba(255,255,255,0.1)",
    },
    animation: {
      easing: "cubic-bezier(0.4,0,0.2,1)",
      duration: { fast: "150ms", normal: "250ms", slow: "350ms" },
      hoverDuration: "150ms",
      blurDuration: "200ms",
      opacityDuration: "200ms",
    },
    fallback: {
      bgColor: "rgba(255,255,255,0.95)",
      borderColor: "rgba(0,0,0,0.08)",
    },
    performance: {
      willChange: ["backdrop-filter", "background-color"],
      containment: "layout style paint",
    },
    components: {
      card: { blur: "12px", bgOpacity: 0.6, hoverOpacityDelta: 0.15 },
      navigation: { blur: "20px", bgOpacity: 0.7 },
    },
  };

  return {
    getGlassConfig: () => baseConfig,
    supportsBackdropFilter: () => stylesState.supportsBlur,
    prefersReducedMotion: () => stylesState.reducedMotion,
    isLowEndDevice: () => stylesState.isLowEnd,
    shouldEnableBlur: () => stylesState.shouldBlur,
    getPerformanceClasses: () => stylesState.performanceClasses,
  };
});

import {
  useGlassStyle,
  useComponentGlassStyle,
  useGlassPerformance,
} from "./useGlassStyle";

describe("useGlassStyle / useComponentGlassStyle / useGlassPerformance", () => {
  beforeEach(() => {
    stylesState.supportsBlur = true;
    stylesState.reducedMotion = false;
    stylesState.isLowEnd = false;
    stylesState.shouldBlur = true;
    stylesState.performanceClasses = ["glass-perf-a"];
  });

  describe("useGlassStyle", () => {
    it("默认参数 → enableBlur 分支:backdropFilter / backgroundColor / borderRadius", () => {
      const { result } = renderHook(() => useGlassStyle());
      const style = result.current.style;
      expect(style.backdropFilter).toBe("blur(20px)");
      expect(style.WebkitBackdropFilter).toBe("blur(20px)");
      // bgColor 默认走 CSS 变量 'rgba(var(--glass-surface-rgb),' 与 opacityValue 拼接
      expect(style.backgroundColor).toBe("rgba(var(--glass-surface-rgb), 0.5)");
      expect(style.borderRadius).toBe("12px"); // md
      expect(style.boxShadow).toBe("0 4px 16px rgba(0,0,0,0.12)");
      expect(result.current.className).toMatch(/glass-effect/);
      expect(result.current.className).toMatch(/glass-blur-medium/);
      expect(result.current.hoverStyle).toBeUndefined();
    });

    it("supportsBlur=false → 走 fallback 分支(无 backdropFilter)", () => {
      stylesState.supportsBlur = false;
      const { result } = renderHook(() => useGlassStyle());
      const style = result.current.style;
      expect(style.backdropFilter).toBeUndefined();
      expect(style.backgroundColor).toBe("rgba(255,255,255,0.95)");
      expect(result.current.className).toMatch(/glass-no-blur/);
    });

    it("forceDisableBlur=true 也走 fallback 分支", () => {
      const { result } = renderHook(() =>
        useGlassStyle({}, { forceDisableBlur: true }),
      );
      expect(result.current.style.backdropFilter).toBeUndefined();
      expect(result.current.className).toMatch(/glass-no-blur/);
    });

    it("isLowEnd=true → fallback + 多一个 glass-low-end-device 类,无 willChange", () => {
      stylesState.isLowEnd = true;
      const { result } = renderHook(() => useGlassStyle());
      expect(result.current.style.backdropFilter).toBeUndefined();
      expect(result.current.className).toMatch(/glass-low-end-device/);
      expect(result.current.style.willChange).toBeUndefined();
    });

    it("reducedMotion=true → transition='none' + glass-reduced-motion 类", () => {
      stylesState.reducedMotion = true;
      const { result } = renderHook(() => useGlassStyle());
      expect(result.current.style.transition).toBe("none");
      expect(result.current.className).toMatch(/glass-reduced-motion/);
    });

    it("hover=true 且非 reducedMotion → 生成 hoverStyle(opacity+0.1,clamp 0.95)", () => {
      const { result } = renderHook(() =>
        useGlassStyle({ hover: true, bgOpacity: "high" /* 0.7 */ }),
      );
      expect(result.current.hoverStyle).toBeDefined();
      // 0.7 + 0.1 → 0.799999... (JS float),clamp 至 0.95 之内,直接断 toBeCloseTo
      const bg = result.current.hoverStyle?.backgroundColor as string;
      const match = bg.match(/rgba\(var\(--glass-surface-rgb\), ([\d.]+)\)/);
      expect(match).not.toBeNull();
      expect(Number(match![1])).toBeCloseTo(0.8, 5);
    });

    it("hover=true 且 opacity 已经接近上限 → clamp 到 0.95", () => {
      const { result } = renderHook(() =>
        useGlassStyle({ hover: true, bgOpacity: "solid" /* 0.85 */ }),
      );
      // 0.85 + 0.1 = 0.95 → clamp 命中 0.95
      expect(result.current.hoverStyle?.backgroundColor).toBe(
        "rgba(var(--glass-surface-rgb), 0.95)",
      );
    });

    it("hover=true 但 reducedMotion=true → 无 hoverStyle", () => {
      stylesState.reducedMotion = true;
      const { result } = renderHook(() => useGlassStyle({ hover: true }));
      expect(result.current.hoverStyle).toBeUndefined();
    });

    it("enableGPUAcceleration=true → 添加 transform: translateZ(0) + backfaceVisibility", () => {
      const { result } = renderHook(() =>
        useGlassStyle({}, { enableGPUAcceleration: true }),
      );
      expect(result.current.style.transform).toBe("translateZ(0)");
      expect(
        (result.current.style as Record<string, string>)['backfaceVisibility'],
      ).toBe("hidden");
    });

    it("shadow='none' 时 boxShadow='none' 且 className 不带 glass-shadow-* 类", () => {
      const { result } = renderHook(() => useGlassStyle({ shadow: "none" }));
      expect(result.current.style.boxShadow).toBe("none");
      expect(result.current.className).not.toMatch(/glass-shadow-/);
    });

    it("enableContainment=true(默认)→ style.contain 被写", () => {
      const { result } = renderHook(() => useGlassStyle());
      expect((result.current.style as Record<string, string>)['contain']).toBe(
        "layout style paint",
      );
    });
  });

  describe("useComponentGlassStyle", () => {
    it("card 组件:blur=12px,bgOpacity=0.6,有 hoverOpacityDelta → hoverStyle 存在", () => {
      const { result } = renderHook(() => useComponentGlassStyle("card"));
      expect(result.current.style.backdropFilter).toBe("blur(12px)");
      expect(result.current.style.backgroundColor).toBe(
        "rgba(var(--glass-surface-rgb), 0.6)",
      );
      // 0.6 + 0.15 = 0.75(无 float 问题,因为只 1 次小数加法刚好对齐)
      const bg = result.current.hoverStyle?.backgroundColor as string;
      const match = bg.match(/rgba\(var\(--glass-surface-rgb\), ([\d.]+)\)/);
      expect(match).not.toBeNull();
      expect(Number(match![1])).toBeCloseTo(0.75, 5);
      expect(result.current.className).toMatch(/glass-card/);
    });

    it("navigation 组件:无 hoverOpacityDelta → 无 hoverStyle", () => {
      const { result } = renderHook(() => useComponentGlassStyle("navigation"));
      expect(result.current.style.backdropFilter).toBe("blur(20px)");
      expect(result.current.hoverStyle).toBeUndefined();
    });

    it("supportsBlur=false → fallback 分支(无 backdropFilter)+ glass-no-blur 类", () => {
      stylesState.supportsBlur = false;
      const { result } = renderHook(() => useComponentGlassStyle("card"));
      expect(result.current.style.backdropFilter).toBeUndefined();
      expect(result.current.className).toMatch(/glass-no-blur/);
    });
  });

  describe("useGlassPerformance", () => {
    it("useEffect 后回填 5 个字段", async () => {
      stylesState.isLowEnd = true;
      stylesState.reducedMotion = true;
      stylesState.shouldBlur = false;
      stylesState.supportsBlur = false;
      stylesState.performanceClasses = ["a", "b"];

      const { result } = renderHook(() => useGlassPerformance());
      // useEffect 是同步触发的(happy-dom + React 19),mount 后立刻可读
      await act(async () => {});
      expect(result.current).toEqual({
        supportsBlur: false,
        reducedMotion: true,
        isLowEnd: true,
        shouldBlur: false,
        performanceClasses: ["a", "b"],
      });
    });
  });
});
