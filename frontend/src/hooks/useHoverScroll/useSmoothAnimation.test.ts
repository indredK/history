/**
 * useSmoothAnimation Hook 单元测试 (§2.8)
 *
 * 覆盖目标:
 * - mount 时初始化 targetScrollRef = container.scrollLeft + 启动 rAF 循环
 * - setTarget:写入(max 0 clamp)
 * - syncWithCurrent:从 container.scrollLeft 重新同步
 * - rAF 循环:enabled=true + hasScrollable=true + 未到 target → 调整 scrollLeft + 触发 onFrame
 * - enabled=false 或 hasScrollable=false 时 → 不调 onFrame,但仍续帧
 * - 卸载:cancelAnimationFrame 调用
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import React from "react";
import { useSmoothAnimation } from "./useSmoothAnimation";

const makeContainer = (opts: {
  scrollLeft?: number;
  scrollWidth?: number;
  clientWidth?: number;
}): HTMLElement => {
  const el = document.createElement("div");
  Object.defineProperty(el, "scrollLeft", {
    configurable: true,
    set(v: number) {
      (this as unknown as { _scrollLeft: number })._scrollLeft = v;
    },
    get() {
      return (this as unknown as { _scrollLeft?: number })._scrollLeft ?? 0;
    },
  });
  (el as unknown as { _scrollLeft: number })._scrollLeft = opts.scrollLeft ?? 0;
  Object.defineProperty(el, "scrollWidth", {
    configurable: true,
    writable: true,
    value: opts.scrollWidth ?? 1000,
  });
  Object.defineProperty(el, "clientWidth", {
    configurable: true,
    writable: true,
    value: opts.clientWidth ?? 400,
  });
  return el;
};

describe("useSmoothAnimation", () => {
  let rafCallbacks: FrameRequestCallback[] = [];
  let cancelSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    rafCallbacks = [];
    cancelSpy = vi.fn();
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });
    vi.stubGlobal("cancelAnimationFrame", cancelSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const flushRafOnce = () => {
    const cb = rafCallbacks.shift();
    cb?.(0);
  };

  it("setTarget 写入并 clamp 负值至 0", () => {
    const c = makeContainer({});
    const containerRef = { current: c } as React.RefObject<HTMLElement>;
    const enabledRef = { current: true } as React.RefObject<boolean>;
    const hasScrollableRef = { current: true } as React.RefObject<boolean>;

    const { result } = renderHook(() =>
      useSmoothAnimation(containerRef, enabledRef, hasScrollableRef),
    );
    act(() => result.current.setTarget(100));
    expect(result.current.targetScrollRef.current).toBe(100);
    act(() => result.current.setTarget(-50));
    expect(result.current.targetScrollRef.current).toBe(0);
  });

  it("rAF 循环:enabled + hasScrollable + 未达 target → 调整 scrollLeft + onFrame 调用", () => {
    const c = makeContainer({ scrollLeft: 0 });
    const containerRef = { current: c } as React.RefObject<HTMLElement>;
    const enabledRef = { current: true } as React.RefObject<boolean>;
    const hasScrollableRef = { current: true } as React.RefObject<boolean>;
    const onFrame = vi.fn();

    const { result } = renderHook(() =>
      useSmoothAnimation(containerRef, enabledRef, hasScrollableRef, {
        easing: 0.5,
        threshold: 0.1,
        onFrame,
      }),
    );
    act(() => result.current.setTarget(100));
    // 第一次 rAF:scrollLeft 从 0 → 50(差 100 * 0.5)
    act(() => flushRafOnce());
    expect(c.scrollLeft).toBe(50);
    expect(onFrame).toHaveBeenCalledWith(50, 100);
    // 第二次 rAF:50 → 75
    act(() => flushRafOnce());
    expect(c.scrollLeft).toBe(75);
  });

  it("enabled=false → rAF 中不动 scrollLeft,但循环继续", () => {
    const c = makeContainer({ scrollLeft: 0 });
    const containerRef = { current: c } as React.RefObject<HTMLElement>;
    const enabledRef = { current: false } as React.RefObject<boolean>;
    const hasScrollableRef = { current: true } as React.RefObject<boolean>;
    const onFrame = vi.fn();

    const { result } = renderHook(() =>
      useSmoothAnimation(containerRef, enabledRef, hasScrollableRef, {
        easing: 0.5,
        onFrame,
      }),
    );
    act(() => result.current.setTarget(100));
    act(() => flushRafOnce());
    expect(c.scrollLeft).toBe(0); // 未变化
    expect(onFrame).not.toHaveBeenCalled();
    // 但下一帧依然被排
    expect(rafCallbacks.length).toBeGreaterThan(0);
  });

  it("hasScrollable=false → 同步当前 scrollLeft 到 target,不调 onFrame", () => {
    const c = makeContainer({ scrollLeft: 30 });
    const containerRef = { current: c } as React.RefObject<HTMLElement>;
    const enabledRef = { current: true } as React.RefObject<boolean>;
    const hasScrollableRef = { current: false } as React.RefObject<boolean>;
    const onFrame = vi.fn();

    const { result } = renderHook(() =>
      useSmoothAnimation(containerRef, enabledRef, hasScrollableRef, {
        onFrame,
      }),
    );
    act(() => result.current.setTarget(500));
    act(() => flushRafOnce());
    expect(result.current.targetScrollRef.current).toBe(30);
    expect(onFrame).not.toHaveBeenCalled();
  });

  it("已经到 target(差值 < threshold)→ 不动 scrollLeft 不调 onFrame", () => {
    const c = makeContainer({ scrollLeft: 100 });
    const containerRef = { current: c } as React.RefObject<HTMLElement>;
    const enabledRef = { current: true } as React.RefObject<boolean>;
    const hasScrollableRef = { current: true } as React.RefObject<boolean>;
    const onFrame = vi.fn();

    const { result } = renderHook(() =>
      useSmoothAnimation(containerRef, enabledRef, hasScrollableRef, {
        easing: 0.5,
        threshold: 5,
        onFrame,
      }),
    );
    act(() => result.current.setTarget(102));
    act(() => flushRafOnce());
    expect(c.scrollLeft).toBe(100);
    expect(onFrame).not.toHaveBeenCalled();
  });

  it("syncWithCurrent:从 container.scrollLeft 重新同步", () => {
    const c = makeContainer({ scrollLeft: 0 });
    const containerRef = { current: c } as React.RefObject<HTMLElement>;
    const enabledRef = { current: true } as React.RefObject<boolean>;
    const hasScrollableRef = { current: true } as React.RefObject<boolean>;

    const { result } = renderHook(() =>
      useSmoothAnimation(containerRef, enabledRef, hasScrollableRef),
    );
    act(() => result.current.setTarget(500));
    c.scrollLeft = 250;
    act(() => result.current.syncWithCurrent());
    expect(result.current.targetScrollRef.current).toBe(250);
    expect(result.current.lastScrollLeftRef.current).toBe(250);
  });

  it("卸载:cancelAnimationFrame 调到", () => {
    const c = makeContainer({});
    const containerRef = { current: c } as React.RefObject<HTMLElement>;
    const enabledRef = { current: true } as React.RefObject<boolean>;
    const hasScrollableRef = { current: true } as React.RefObject<boolean>;

    const { unmount } = renderHook(() =>
      useSmoothAnimation(containerRef, enabledRef, hasScrollableRef),
    );
    unmount();
    expect(cancelSpy).toHaveBeenCalled();
  });
});
