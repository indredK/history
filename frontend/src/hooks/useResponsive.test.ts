/**
 * useResponsive 系列 Hook 单元测试 (§2.8)
 *
 * 覆盖 5 个公开 hook:
 *   useResponsive, useMediaQuery, useTouchDevice, useOrientation, useViewport
 *
 * 关键点:
 * - useResponsive 使用 150ms 防抖 → 用 vi.useFakeTimers + vi.advanceTimersByTime
 * - 通过修改 window.innerWidth/innerHeight + 派发 'resize' 事件来模拟尺寸变化
 * - useMediaQuery:覆写 window.matchMedia 为 mock,验证 'change' 监听器接入
 * - useTouchDevice:用 vi.stubGlobal/Object.defineProperty 写 navigator.maxTouchPoints
 * - useOrientation:用 vi.stubGlobal 覆盖 window.screen.orientation
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import {
  useResponsive,
  useMediaQuery,
  useTouchDevice,
  useOrientation,
  useViewport,
} from "./useResponsive";

// 直接覆写 window.innerWidth/innerHeight 在 happy-dom 下是可行的;
// 包成 helper 让测试更可读
const setWindow = (width: number, height: number) => {
  (window as unknown as { innerWidth: number }).innerWidth = width;
  (window as unknown as { innerHeight: number }).innerHeight = height;
};

describe("useResponsive", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setWindow(1280, 800); // 默认 desktop 横屏
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("初始 desktop(1280x800)→ isDesktop=true,isMobile/isTablet=false", () => {
    const { result } = renderHook(() => useResponsive());
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isSmallMobile).toBe(false);
    expect(result.current.isLandscape).toBe(true);
    expect(result.current.screenWidth).toBe(1280);
    expect(result.current.screenHeight).toBe(800);
  });

  it("初始 tablet(800x600)→ isTablet=true", () => {
    setWindow(800, 600);
    const { result } = renderHook(() => useResponsive());
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isDesktop).toBe(false);
  });

  it("初始 mobile(400x800)→ isMobile=true,isLandscape=false", () => {
    setWindow(400, 800);
    const { result } = renderHook(() => useResponsive());
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isLandscape).toBe(false);
    // 400 >= 375(mobileSm),所以 isSmallMobile=false
    expect(result.current.isSmallMobile).toBe(false);
  });

  it("初始 smallMobile(320x600)→ isSmallMobile=true", () => {
    setWindow(320, 600);
    const { result } = renderHook(() => useResponsive());
    expect(result.current.isSmallMobile).toBe(true);
    expect(result.current.isMobile).toBe(true);
  });

  it("resize 事件经 150ms 防抖 → 200ms 后才更新", () => {
    const { result } = renderHook(() => useResponsive());
    expect(result.current.isDesktop).toBe(true);

    // 调小尺寸 + 派发 resize
    setWindow(400, 800);
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    // 防抖未完成 → state 还是初始值
    expect(result.current.isDesktop).toBe(true);

    // 推进 150ms → 触发更新
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isDesktop).toBe(false);
  });

  it("orientationchange 立即生效(无防抖)", () => {
    const { result } = renderHook(() => useResponsive());
    setWindow(800, 1000); // 切到竖屏
    act(() => {
      window.dispatchEvent(new Event("orientationchange"));
    });
    expect(result.current.isLandscape).toBe(false);
    expect(result.current.screenHeight).toBe(1000);
  });
});

describe("useMediaQuery", () => {
  let listeners: ((e: { matches: boolean }) => void)[] = [];
  let currentMatches = false;

  beforeEach(() => {
    listeners = [];
    currentMatches = false;
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        get matches() {
          return currentMatches;
        },
        media: "",
        onchange: null,
        addEventListener: (_t: string, cb: (e: { matches: boolean }) => void) =>
          listeners.push(cb),
        removeEventListener: (
          _t: string,
          cb: (e: { matches: boolean }) => void,
        ) => {
          listeners = listeners.filter((l) => l !== cb);
        },
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => true,
      })),
    );
    // 也要挂在 window 上,因为代码用 window.matchMedia
    (window as unknown as { matchMedia: typeof window.matchMedia }).matchMedia =
      globalThis.matchMedia as unknown as typeof window.matchMedia;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("初始 matches=false → 返回 false", () => {
    currentMatches = false;
    const { result } = renderHook(() =>
      useMediaQuery("(prefers-color-scheme: dark)"),
    );
    expect(result.current).toBe(false);
  });

  it("初始 matches=true → 返回 true", () => {
    currentMatches = true;
    const { result } = renderHook(() => useMediaQuery("(min-width: 1024px)"));
    expect(result.current).toBe(true);
  });

  it("change 事件触发 → state 同步更新", () => {
    const { result } = renderHook(() =>
      useMediaQuery("(prefers-reduced-motion: reduce)"),
    );
    expect(result.current).toBe(false);
    act(() => {
      listeners.forEach((cb) => cb({ matches: true }));
    });
    expect(result.current).toBe(true);
  });
});

describe("useTouchDevice", () => {
  beforeEach(() => {
    // 默认非触屏:删除 ontouchstart,maxTouchPoints=0
    delete (window as unknown as { ontouchstart?: unknown }).ontouchstart;
    Object.defineProperty(navigator, "maxTouchPoints", {
      configurable: true,
      value: 0,
    });
  });

  afterEach(() => {
    delete (window as unknown as { ontouchstart?: unknown }).ontouchstart;
    Object.defineProperty(navigator, "maxTouchPoints", {
      configurable: true,
      value: 0,
    });
  });

  it("'ontouchstart' 不在 window 且 maxTouchPoints=0 → false", () => {
    const { result } = renderHook(() => useTouchDevice());
    expect(result.current).toBe(false);
  });

  it("navigator.maxTouchPoints > 0 → true", () => {
    Object.defineProperty(navigator, "maxTouchPoints", {
      configurable: true,
      value: 5,
    });
    const { result } = renderHook(() => useTouchDevice());
    expect(result.current).toBe(true);
  });

  it("window.ontouchstart 存在 → true", () => {
    (window as unknown as { ontouchstart: null }).ontouchstart = null;
    const { result } = renderHook(() => useTouchDevice());
    expect(result.current).toBe(true);
  });
});

describe("useOrientation", () => {
  it("window.screen.orientation 不存在 → 默认 {angle:0, type:'unknown'}", () => {
    const orig = Object.getOwnPropertyDescriptor(window.screen, "orientation");
    Object.defineProperty(window.screen, "orientation", {
      configurable: true,
      value: undefined,
    });
    try {
      const { result } = renderHook(() => useOrientation());
      expect(result.current).toEqual({ angle: 0, type: "unknown" });
    } finally {
      if (orig) Object.defineProperty(window.screen, "orientation", orig);
    }
  });

  it("已有 orientation → 透传 angle 与 type", () => {
    const listeners: (() => void)[] = [];
    Object.defineProperty(window.screen, "orientation", {
      configurable: true,
      value: {
        angle: 90,
        type: "landscape-primary",
        addEventListener: (_t: string, cb: () => void) => listeners.push(cb),
        removeEventListener: (_t: string, cb: () => void) => {
          const i = listeners.indexOf(cb);
          if (i >= 0) listeners.splice(i, 1);
        },
      },
    });
    const { result } = renderHook(() => useOrientation());
    expect(result.current.angle).toBe(90);
    expect(result.current.type).toBe("landscape-primary");
  });
});

describe("useViewport", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setWindow(1024, 768);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("初始 viewport 反映 window 尺寸", () => {
    const { result } = renderHook(() => useViewport());
    expect(result.current).toEqual({ width: 1024, height: 768 });
  });

  it("resize 经 150ms 防抖后更新", () => {
    const { result } = renderHook(() => useViewport());
    setWindow(600, 900);
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    // 未到 150ms
    expect(result.current).toEqual({ width: 1024, height: 768 });
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current).toEqual({ width: 600, height: 900 });
  });
});
