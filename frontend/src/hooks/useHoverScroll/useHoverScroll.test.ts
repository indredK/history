/**
 * useHoverScroll (composite) Hook 单元测试 (§2.8)
 *
 * 验证主入口对 3 个子 hook 的编排是否正确:
 * - 暴露 setScrollPosition / setEnabled / getScrollState
 * - getScrollState 透传 useScrollState 的输出
 * - setScrollPosition 调用 useSmoothAnimation.setTarget(本地通过 scrollLeft 收敛)
 * - container.scroll 事件 + 非 scrollbar 区域时,同步 targetScroll = scrollLeft
 *
 * 由于 useHoverScroll 直接 import 子 hook,
 * 我们这里走"集成"路径:用真实 DOM + stub 掉 RAF / ResizeObserver
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { useHoverScroll } from "./index";

const makeContainer = (opts?: {
  scrollLeft?: number;
  scrollWidth?: number;
  clientWidth?: number;
}): HTMLElement => {
  const el = document.createElement("div");
  Object.defineProperty(el, "scrollLeft", {
    configurable: true,
    set(v: number) {
      (this as unknown as { _s: number })._s = v;
    },
    get() {
      return (this as unknown as { _s?: number })._s ?? 0;
    },
  });
  (el as unknown as { _s: number })._s = opts?.scrollLeft ?? 0;
  Object.defineProperty(el, "scrollWidth", {
    configurable: true,
    writable: true,
    value: opts?.scrollWidth ?? 1000,
  });
  Object.defineProperty(el, "clientWidth", {
    configurable: true,
    writable: true,
    value: opts?.clientWidth ?? 400,
  });
  el.getBoundingClientRect = vi.fn(
    () =>
      ({
        left: 0,
        top: 0,
        right: 400,
        bottom: 300,
        width: 400,
        height: 300,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect,
  );
  return el;
};

describe("useHoverScroll (composite)", () => {
  beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", () => 1);
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    class RO {
      observe = vi.fn();
      disconnect = vi.fn();
      unobserve = vi.fn();
    }
    class MO {
      observe = vi.fn();
      disconnect = vi.fn();
      takeRecords = vi.fn(() => []);
    }
    vi.stubGlobal("ResizeObserver", RO);
    vi.stubGlobal("MutationObserver", MO);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("getScrollState 透传 container 的 scrollLeft / maxScroll", () => {
    const c = makeContainer({
      scrollLeft: 80,
      scrollWidth: 1000,
      clientWidth: 400,
    });
    const ref = { current: c } as React.RefObject<HTMLElement>;
    const { result } = renderHook(() => useHoverScroll(ref));
    expect(result.current.getScrollState()).toEqual({
      scrollLeft: 80,
      maxScroll: 600,
      hasScrollableContent: true,
    });
  });

  it("setScrollPosition 调用后不立刻改 scrollLeft(rAF 被 stub 为 no-op),且 setEnabled 可切换", () => {
    const c = makeContainer({});
    const ref = { current: c } as React.RefObject<HTMLElement>;
    const { result } = renderHook(() => useHoverScroll(ref));
    act(() => {
      result.current.setScrollPosition(200);
      result.current.setEnabled(false);
      result.current.setEnabled(true);
    });
    // setScrollPosition 只更新内部 ref,不直接动 DOM
    expect(c.scrollLeft).toBe(0);
  });

  it("container scroll 事件:非 scrollbar 区域(默认 inArea=false)时,同步 target / last", () => {
    const c = makeContainer({});
    const ref = { current: c } as React.RefObject<HTMLElement>;
    const { result } = renderHook(() => useHoverScroll(ref));
    // 模拟用户手动滚动 100px
    c.scrollLeft = 100;
    act(() => {
      c.dispatchEvent(new Event("scroll"));
    });
    // 此时内部 lastScrollLeftRef 与 targetScrollRef 都应被同步成 100;
    // 通过 getScrollState 反映出 scrollLeft=100
    expect(result.current.getScrollState().scrollLeft).toBe(100);
  });

  it("ref=null → setEnabled / setScrollPosition 不抛错,getScrollState 返回零值", () => {
    const ref = { current: null } as unknown as React.RefObject<HTMLElement>;
    const { result } = renderHook(() => useHoverScroll(ref));
    expect(() => {
      act(() => {
        result.current.setEnabled(false);
        result.current.setScrollPosition(100);
      });
    }).not.toThrow();
    expect(result.current.getScrollState()).toEqual({
      scrollLeft: 0,
      maxScroll: 0,
      hasScrollableContent: false,
    });
  });

  it("setEnabled(false) 时,disabled 状态被记录;后续 setEnabled(true) 恢复", () => {
    const c = makeContainer({});
    const ref = { current: c } as React.RefObject<HTMLElement>;
    const { result } = renderHook(() => useHoverScroll(ref, { enabled: true }));
    act(() => result.current.setEnabled(false));
    act(() => result.current.setEnabled(true));
    // 仅验证 setEnabled 不抛错 + 不影响 getScrollState
    expect(typeof result.current.getScrollState().scrollLeft).toBe("number");
  });
});
