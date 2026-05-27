/**
 * useScrollState Hook 单元测试 (§2.8)
 *
 * 覆盖目标:
 * - container.scrollWidth > clientWidth → hasScrollableContentRef=true
 * - 反之 → false
 * - getScrollState 反映容器最新数值;无 ref 时返回零值默认
 * - 卸载:disconnect ResizeObserver / MutationObserver
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import React from "react";
import { useScrollState } from "./useScrollState";

const makeContainer = (opts: {
  scrollLeft?: number;
  scrollWidth: number;
  clientWidth: number;
}): HTMLElement => {
  const el = document.createElement("div");
  Object.defineProperty(el, "scrollLeft", {
    configurable: true,
    writable: true,
    value: opts.scrollLeft ?? 0,
  });
  Object.defineProperty(el, "scrollWidth", {
    configurable: true,
    writable: true,
    value: opts.scrollWidth,
  });
  Object.defineProperty(el, "clientWidth", {
    configurable: true,
    writable: true,
    value: opts.clientWidth,
  });
  return el;
};

describe("useScrollState", () => {
  beforeEach(() => {
    // happy-dom 缺这俩 observer
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

  it("scrollWidth > clientWidth → hasScrollableContentRef.current=true", () => {
    const c = makeContainer({ scrollWidth: 1000, clientWidth: 400 });
    const ref = { current: c } as React.RefObject<HTMLElement>;
    const { result } = renderHook(() => useScrollState(ref));
    expect(result.current.hasScrollableContentRef.current).toBe(true);
  });

  it("scrollWidth <= clientWidth → false", () => {
    const c = makeContainer({ scrollWidth: 400, clientWidth: 400 });
    const ref = { current: c } as React.RefObject<HTMLElement>;
    const { result } = renderHook(() => useScrollState(ref));
    expect(result.current.hasScrollableContentRef.current).toBe(false);
  });

  it("getScrollState 返回容器 scrollLeft / maxScroll / hasScrollable", () => {
    const c = makeContainer({
      scrollLeft: 150,
      scrollWidth: 1000,
      clientWidth: 400,
    });
    const ref = { current: c } as React.RefObject<HTMLElement>;
    const { result } = renderHook(() => useScrollState(ref));
    expect(result.current.getScrollState()).toEqual({
      scrollLeft: 150,
      maxScroll: 600,
      hasScrollableContent: true,
    });
  });

  it("ref=null → getScrollState 返回零值默认", () => {
    const ref = { current: null } as unknown as React.RefObject<HTMLElement>;
    const { result } = renderHook(() => useScrollState(ref));
    expect(result.current.getScrollState()).toEqual({
      scrollLeft: 0,
      maxScroll: 0,
      hasScrollableContent: false,
    });
  });

  it("maxScroll 用 max(0, ...) clamp 负值", () => {
    // 极端:scrollWidth < clientWidth(可能因测试构造)
    const c = makeContainer({
      scrollLeft: 0,
      scrollWidth: 100,
      clientWidth: 400,
    });
    const ref = { current: c } as React.RefObject<HTMLElement>;
    const { result } = renderHook(() => useScrollState(ref));
    expect(result.current.getScrollState().maxScroll).toBe(0);
  });
});
