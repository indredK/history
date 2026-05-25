/**
 * useStyleAwareGlass / useIsClassicStyle / useCurrentStyle 单元测试 (§2.8)
 *
 * 三个 hook:
 *   useStyleAwareGlass(options) → 根据 style/theme/screenWidth 返回 CSS 属性对象
 *   useIsClassicStyle() → boolean
 *   useCurrentStyle() → 'glass' | 'classic'
 *
 * 测试策略:
 * - useResponsive 返回 screenWidth,因此用 vi.mock 替换为稳定值
 * - useStyleStore / useThemeStore 是真实 Zustand store,直接 setState 切换
 * - 验证 classic 与 glass 两条分支的输出关键字
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";

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

import { useStyleStore, useThemeStore } from "@/store";
import {
  useStyleAwareGlass,
  useIsClassicStyle,
  useCurrentStyle,
} from "./useStyleAwareGlass";

describe("useStyleAwareGlass 系列", () => {
  beforeEach(() => {
    // 重置 stores 到默认值
    useStyleStore.setState({ style: "glass" });
    useThemeStore.setState({ theme: "light" });
  });

  describe("useCurrentStyle / useIsClassicStyle", () => {
    it("默认 glass → useCurrentStyle='glass',useIsClassicStyle=false", () => {
      const cur = renderHook(() => useCurrentStyle());
      const cla = renderHook(() => useIsClassicStyle());
      expect(cur.result.current).toBe("glass");
      expect(cla.result.current).toBe(false);
    });

    it("切到 classic → useCurrentStyle='classic',useIsClassicStyle=true", () => {
      useStyleStore.setState({ style: "classic" });
      const cur = renderHook(() => useCurrentStyle());
      const cla = renderHook(() => useIsClassicStyle());
      expect(cur.result.current).toBe("classic");
      expect(cla.result.current).toBe(true);
    });
  });

  describe("useStyleAwareGlass:classic 分支", () => {
    beforeEach(() => {
      useStyleStore.setState({ style: "classic" });
    });

    it("backdropFilter='none',背景色 / 边框走 var(--classic-...)", () => {
      const { result } = renderHook(() => useStyleAwareGlass());
      expect(result.current.backdropFilter).toBe("none");
      expect(result.current.WebkitBackdropFilter).toBe("none");
      expect(result.current.backgroundColor).toBe("var(--classic-bg-surface)");
      expect(result.current.border).toContain("var(--classic-border-color)");
      expect(result.current.boxShadow).toBe("0 1px 3px rgba(0, 0, 0, 0.12)");
    });

    it("dark 主题下 classic 仍走同一 var(...) 值(代码逻辑里 dark/light 同 var)", () => {
      useThemeStore.setState({ theme: "dark" });
      const { result } = renderHook(() => useStyleAwareGlass());
      expect(result.current.backgroundColor).toBe("var(--classic-bg-surface)");
    });
  });

  describe("useStyleAwareGlass:glass 分支", () => {
    beforeEach(() => {
      useStyleStore.setState({ style: "glass" });
    });

    it("默认参数:medium blur(20px on desktop)+ medium opacity(0.5)+ lg radius", () => {
      const { result } = renderHook(() => useStyleAwareGlass());
      expect(result.current.backdropFilter).toBe("blur(20px)");
      expect(result.current.WebkitBackdropFilter).toBe("blur(20px)");
      expect(result.current.backgroundColor).toMatch(
        /rgba\(255, 255, 255, 0\.5\)/,
      );
      expect(result.current.borderRadius).toBe("16px"); // desktop lg
    });

    it("dark 主题:背景色 base 切到 30,30,30,border 用 rgba(255,255,255,0.15)", () => {
      useThemeStore.setState({ theme: "dark" });
      const { result } = renderHook(() => useStyleAwareGlass());
      expect(result.current.backgroundColor).toMatch(
        /rgba\(30, 30, 30, 0\.5\)/,
      );
      expect(result.current.border).toContain("rgba(255, 255, 255, 0.15)");
    });

    it("light 主题 border 用 rgba(0,0,0,0.12)", () => {
      const { result } = renderHook(() => useStyleAwareGlass());
      expect(result.current.border).toContain("rgba(0, 0, 0, 0.12)");
    });

    it("自定义 blur='heavy' → 32px(desktop)", () => {
      const { result } = renderHook(() =>
        useStyleAwareGlass({ blur: "heavy" }),
      );
      expect(result.current.backdropFilter).toBe("blur(32px)");
    });

    it("shadow='none' → boxShadow='none'", () => {
      const { result } = renderHook(() =>
        useStyleAwareGlass({ shadow: "none" }),
      );
      expect(result.current.boxShadow).toBe("none");
    });

    it("customBgBase 覆写背景色 base", () => {
      const { result } = renderHook(() =>
        useStyleAwareGlass({
          customBgBase: "200, 200, 200",
          bgOpacity: "high",
        }),
      );
      expect(result.current.backgroundColor).toBe("rgba(200, 200, 200, 0.7)");
    });

    it("borderRadius='full' → 9999px", () => {
      const { result } = renderHook(() =>
        useStyleAwareGlass({ borderRadius: "full" }),
      );
      expect(result.current.borderRadius).toBe("9999px");
    });

    it("transition 字符串含 duration 与 easing", () => {
      const { result } = renderHook(() => useStyleAwareGlass());
      expect(result.current.transition).toMatch(/^all \d+ms cubic-bezier/);
    });
  });
});
