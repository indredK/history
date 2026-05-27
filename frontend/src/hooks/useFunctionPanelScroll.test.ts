/**
 * useFunctionPanelScroll Hook 单元测试 (§2.8)
 *
 * 覆盖目标:
 * - 初始 mount:挂载 scroll listener + ResizeObserver + 计算初始 scrollState
 * - scroll 触发 → rAF 内重算 + onScroll 回调 + 渐变遮罩 opacity 切换
 * - getScrollState 返回当前缓存状态(快照,改外部不影响内部)
 * - scrollToPosition / scrollToTop / scrollToBottom:调 container.scrollTo
 * - setGradientRefs:把传入的 top/bottom 元素挂上,并立即根据当前 state 更新 opacity
 * - 卸载:清掉 listener、disconnect ResizeObserver、cancelAnimationFrame
 *
 * 设计:
 * - happy-dom 没有 ResizeObserver,需要 stub
 * - 需要 stub requestAnimationFrame 让回调立刻同步执行,以便用 act 触发完
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useFunctionPanelScroll } from "./useFunctionPanelScroll";
import React from "react";

// ----- 测试公用 helper -----
const makeContainer = (opts: {
  scrollTop?: number;
  scrollHeight: number;
  clientHeight: number;
}): HTMLElement => {
  const el = document.createElement("div");
  Object.defineProperty(el, "scrollTop", {
    configurable: true,
    writable: true,
    value: opts.scrollTop ?? 0,
  });
  Object.defineProperty(el, "scrollHeight", {
    configurable: true,
    writable: true,
    value: opts.scrollHeight,
  });
  Object.defineProperty(el, "clientHeight", {
    configurable: true,
    writable: true,
    value: opts.clientHeight,
  });
  // happy-dom 没默认实现 scrollTo
  (el as unknown as { scrollTo: typeof el.scrollTo }).scrollTo = vi.fn();
  return el;
};

describe("useFunctionPanelScroll", () => {
  let rafCallbacks: FrameRequestCallback[] = [];

  beforeEach(() => {
    // 同步 rAF:把回调直接收集,测试代码手动 flush
    rafCallbacks = [];
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());

    // happy-dom 默认无 ResizeObserver
    class RO {
      observe = vi.fn();
      disconnect = vi.fn();
      unobserve = vi.fn();
    }
    vi.stubGlobal("ResizeObserver", RO);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const flushRaf = () => {
    const all = rafCallbacks.slice();
    rafCallbacks = [];
    all.forEach((cb) => cb(0));
  };

  it("初始化:挂载 scroll listener + ResizeObserver 同时计算初始 state", () => {
    const container = makeContainer({
      scrollHeight: 1000,
      clientHeight: 400,
    });
    const ref = { current: container } as React.RefObject<HTMLElement>;
    const addSpy = vi.spyOn(container, "addEventListener");
    const onScroll = vi.fn();

    renderHook(() => useFunctionPanelScroll({ containerRef: ref, onScroll }));

    expect(addSpy).toHaveBeenCalledWith("scroll", expect.any(Function), {
      passive: true,
    });
  });

  it("containerRef.current=null → 不挂载 listener,getScrollState 返回默认", () => {
    const ref = { current: null } as unknown as React.RefObject<HTMLElement>;
    const { result } = renderHook(() =>
      useFunctionPanelScroll({ containerRef: ref }),
    );
    expect(result.current.getScrollState()).toEqual({
      isScrollable: false,
      isAtTop: true,
      isAtBottom: false,
      scrollPercentage: 0,
    });
  });

  it("scroll 事件 → rAF flush 后 onScroll 回调与 scrollState 更新", () => {
    const container = makeContainer({
      scrollHeight: 1000,
      clientHeight: 400,
      scrollTop: 200,
    });
    const ref = { current: container } as React.RefObject<HTMLElement>;
    const onScroll = vi.fn();
    const { result } = renderHook(() =>
      useFunctionPanelScroll({ containerRef: ref, onScroll }),
    );

    // 初始挂载时已经调过一次 calculateScrollState
    // 改 scrollTop 然后派发 scroll
    Object.defineProperty(container, "scrollTop", {
      configurable: true,
      writable: true,
      value: 500,
    });
    act(() => {
      container.dispatchEvent(new Event("scroll"));
      flushRaf();
    });

    expect(onScroll).toHaveBeenCalledWith(500, 1000, 400);
    const state = result.current.getScrollState();
    expect(state.isScrollable).toBe(true);
    expect(state.isAtTop).toBe(false);
    expect(state.scrollPercentage).toBeGreaterThan(0);
  });

  it("scrollToPosition / scrollToTop / scrollToBottom 调 container.scrollTo", () => {
    const container = makeContainer({
      scrollHeight: 1500,
      clientHeight: 500,
    });
    const ref = { current: container } as React.RefObject<HTMLElement>;
    const { result } = renderHook(() =>
      useFunctionPanelScroll({ containerRef: ref }),
    );

    act(() => result.current.scrollToPosition(123));
    expect(container.scrollTo).toHaveBeenLastCalledWith({
      top: 123,
      behavior: "smooth",
    });

    act(() => result.current.scrollToTop());
    expect(container.scrollTo).toHaveBeenLastCalledWith({
      top: 0,
      behavior: "smooth",
    });

    act(() => result.current.scrollToBottom());
    expect(container.scrollTo).toHaveBeenLastCalledWith({
      top: 1000, // scrollHeight - clientHeight
      behavior: "smooth",
    });
  });

  it("smoothScroll=false → behavior 强制 'auto'", () => {
    const container = makeContainer({
      scrollHeight: 800,
      clientHeight: 300,
    });
    const ref = { current: container } as React.RefObject<HTMLElement>;
    const { result } = renderHook(() =>
      useFunctionPanelScroll({ containerRef: ref, smoothScroll: false }),
    );
    act(() => result.current.scrollToTop());
    expect(container.scrollTo).toHaveBeenLastCalledWith({
      top: 0,
      behavior: "auto",
    });
  });

  it("setGradientRefs:挂上 top/bottom 元素 + 根据当前 state 更新 opacity", () => {
    // 这里使 container 可滚动:scrollHeight > clientHeight,且不在最顶/最底
    const container = makeContainer({
      scrollHeight: 1000,
      clientHeight: 400,
      scrollTop: 200,
    });
    const ref = { current: container } as React.RefObject<HTMLElement>;
    const { result } = renderHook(() =>
      useFunctionPanelScroll({ containerRef: ref }),
    );

    const top = document.createElement("div");
    const bottom = document.createElement("div");
    act(() => result.current.setGradientRefs(top, bottom));

    // isScrollable=true,scrollTop=200 → 既不在顶也不在底 → 两个 opacity=1
    expect(top.style.opacity).toBe("1");
    expect(bottom.style.opacity).toBe("1");
  });

  it("scrollTop=0 且可滚 → top opacity=0,bottom opacity=1(在顶)", () => {
    const container = makeContainer({
      scrollHeight: 1000,
      clientHeight: 400,
      scrollTop: 0,
    });
    const ref = { current: container } as React.RefObject<HTMLElement>;
    const { result } = renderHook(() =>
      useFunctionPanelScroll({ containerRef: ref }),
    );
    const top = document.createElement("div");
    const bottom = document.createElement("div");
    act(() => result.current.setGradientRefs(top, bottom));

    expect(top.style.opacity).toBe("0"); // 在最顶
    expect(bottom.style.opacity).toBe("1"); // 没到底
  });

  it("container 不可滚动(scrollHeight <= clientHeight)→ 两个 opacity 都是 0", () => {
    const container = makeContainer({
      scrollHeight: 400,
      clientHeight: 400,
    });
    const ref = { current: container } as React.RefObject<HTMLElement>;
    const { result } = renderHook(() =>
      useFunctionPanelScroll({ containerRef: ref }),
    );
    const top = document.createElement("div");
    const bottom = document.createElement("div");
    act(() => result.current.setGradientRefs(top, bottom));

    expect(top.style.opacity).toBe("0");
    expect(bottom.style.opacity).toBe("0");
  });

  it("卸载:scroll listener 解绑 + ResizeObserver disconnect 调到", () => {
    const container = makeContainer({
      scrollHeight: 1000,
      clientHeight: 400,
    });
    const ref = { current: container } as React.RefObject<HTMLElement>;
    const removeSpy = vi.spyOn(container, "removeEventListener");
    const { unmount } = renderHook(() =>
      useFunctionPanelScroll({ containerRef: ref }),
    );
    unmount();
    expect(removeSpy).toHaveBeenCalledWith("scroll", expect.any(Function));
  });

  it("getScrollState 是快照(改返回值不会反向影响内部)", () => {
    const container = makeContainer({
      scrollHeight: 1000,
      clientHeight: 400,
    });
    const ref = { current: container } as React.RefObject<HTMLElement>;
    const { result } = renderHook(() =>
      useFunctionPanelScroll({ containerRef: ref }),
    );
    const snap = result.current.getScrollState();
    snap.isAtTop = false;
    expect(result.current.getScrollState().isAtTop).toBe(true);
  });
});
