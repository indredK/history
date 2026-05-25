/**
 * useScrollbarAreaDetect Hook 单元测试 (§2.8)
 *
 * 覆盖目标:
 * - mount:在 container 与 document 上绑定多个 event listener
 * - mousemove:
 *   - enabled=false → 不更新 ref
 *   - 不可滚动(maxScroll<=0)→ isInScrollbarAreaRef.current=false 直接返回
 *   - 在 scrollbar 区内 → ref=true + onPositionChange 被调
 *   - 在 scrollbar 区外 → ref=false
 * - mouseleave:ref 重置为 false
 * - wheel / mousedown / touchstart:ref=true 时 preventDefault+stopPropagation
 * - keydown:scroll 相关 key + ref=true 时 preventDefault
 * - unmount:listener 全部移除
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { useScrollbarAreaDetect } from "./useScrollbarAreaDetect";

const makeContainer = (opts: {
  rect: { left: number; top: number; right: number; bottom: number };
  scrollWidth?: number;
  clientWidth?: number;
}): HTMLElement => {
  const el = document.createElement("div");
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
  const r = opts.rect;
  el.getBoundingClientRect = vi.fn(
    () =>
      ({
        left: r.left,
        right: r.right,
        top: r.top,
        bottom: r.bottom,
        width: r.right - r.left,
        height: r.bottom - r.top,
        x: r.left,
        y: r.top,
        toJSON: () => ({}),
      }) as DOMRect,
  );
  return el;
};

describe("useScrollbarAreaDetect", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("mousemove 在 scrollbar 区内 + 可滚动 → 触发 onPositionChange + isInScrollbarAreaRef=true", () => {
    const c = makeContainer({
      rect: { left: 100, top: 0, right: 500, bottom: 300 },
      scrollWidth: 1000,
      clientWidth: 400,
    });
    const containerRef = { current: c } as React.RefObject<HTMLElement>;
    const enabledRef = { current: true } as React.RefObject<boolean>;
    const hasScrollableRef = { current: true } as React.RefObject<boolean>;
    const inAreaRef = { current: false } as React.RefObject<boolean>;
    const onPositionChange = vi.fn();

    renderHook(() =>
      useScrollbarAreaDetect(
        containerRef,
        enabledRef,
        hasScrollableRef,
        inAreaRef,
        { scrollbarAreaHeight: 16, onPositionChange },
      ),
    );
    act(() => {
      const ev = new MouseEvent("mousemove", { clientX: 300, clientY: 295 });
      c.dispatchEvent(ev);
    });
    expect(inAreaRef.current).toBe(true);
    expect(onPositionChange).toHaveBeenCalledTimes(1);
    const [target, ratio] = onPositionChange.mock.calls[0];
    expect(target).toBeGreaterThan(0);
    expect(ratio).toBeCloseTo(0.5, 5);
  });

  it("mousemove 在 scrollbar 区外 → ref=false,onPositionChange 不被调", () => {
    const c = makeContainer({
      rect: { left: 100, top: 0, right: 500, bottom: 300 },
    });
    const containerRef = { current: c } as React.RefObject<HTMLElement>;
    const enabledRef = { current: true } as React.RefObject<boolean>;
    const hasScrollableRef = { current: true } as React.RefObject<boolean>;
    const inAreaRef = { current: false } as React.RefObject<boolean>;
    const onPositionChange = vi.fn();
    renderHook(() =>
      useScrollbarAreaDetect(
        containerRef,
        enabledRef,
        hasScrollableRef,
        inAreaRef,
        { scrollbarAreaHeight: 16, onPositionChange },
      ),
    );
    act(() => {
      c.dispatchEvent(
        new MouseEvent("mousemove", { clientX: 300, clientY: 100 }),
      );
    });
    expect(inAreaRef.current).toBe(false);
    expect(onPositionChange).not.toHaveBeenCalled();
  });

  it("enabled=false 时 mousemove 完全跳过(ref 与回调都不变)", () => {
    const c = makeContainer({
      rect: { left: 100, top: 0, right: 500, bottom: 300 },
    });
    const containerRef = { current: c } as React.RefObject<HTMLElement>;
    const enabledRef = { current: false } as React.RefObject<boolean>;
    const hasScrollableRef = { current: true } as React.RefObject<boolean>;
    const inAreaRef = { current: false } as React.RefObject<boolean>;
    const onPositionChange = vi.fn();
    renderHook(() =>
      useScrollbarAreaDetect(
        containerRef,
        enabledRef,
        hasScrollableRef,
        inAreaRef,
        { onPositionChange },
      ),
    );
    act(() => {
      c.dispatchEvent(
        new MouseEvent("mousemove", { clientX: 300, clientY: 295 }),
      );
    });
    expect(inAreaRef.current).toBe(false);
    expect(onPositionChange).not.toHaveBeenCalled();
  });

  it("不可滚动(maxScroll<=0)→ ref 强制 false,即使位置落在区域", () => {
    const c = makeContainer({
      rect: { left: 100, top: 0, right: 500, bottom: 300 },
      scrollWidth: 400, // = clientWidth → maxScroll=0
      clientWidth: 400,
    });
    const containerRef = { current: c } as React.RefObject<HTMLElement>;
    const enabledRef = { current: true } as React.RefObject<boolean>;
    const hasScrollableRef = { current: true } as React.RefObject<boolean>;
    const inAreaRef = { current: false } as React.RefObject<boolean>;
    renderHook(() =>
      useScrollbarAreaDetect(
        containerRef,
        enabledRef,
        hasScrollableRef,
        inAreaRef,
      ),
    );
    act(() => {
      c.dispatchEvent(
        new MouseEvent("mousemove", { clientX: 300, clientY: 295 }),
      );
    });
    expect(inAreaRef.current).toBe(false);
  });

  it("mouseleave → ref 重置为 false", () => {
    const c = makeContainer({
      rect: { left: 100, top: 0, right: 500, bottom: 300 },
    });
    const containerRef = { current: c } as React.RefObject<HTMLElement>;
    const enabledRef = { current: true } as React.RefObject<boolean>;
    const hasScrollableRef = { current: true } as React.RefObject<boolean>;
    const inAreaRef = { current: true } as React.RefObject<boolean>;
    renderHook(() =>
      useScrollbarAreaDetect(
        containerRef,
        enabledRef,
        hasScrollableRef,
        inAreaRef,
      ),
    );
    act(() => {
      c.dispatchEvent(new MouseEvent("mouseleave"));
    });
    expect(inAreaRef.current).toBe(false);
  });

  it("wheel / mousedown / touchstart:ref=true 时调 preventDefault", () => {
    const c = makeContainer({
      rect: { left: 100, top: 0, right: 500, bottom: 300 },
    });
    const containerRef = { current: c } as React.RefObject<HTMLElement>;
    const enabledRef = { current: true } as React.RefObject<boolean>;
    const hasScrollableRef = { current: true } as React.RefObject<boolean>;
    const inAreaRef = { current: true } as React.RefObject<boolean>;
    renderHook(() =>
      useScrollbarAreaDetect(
        containerRef,
        enabledRef,
        hasScrollableRef,
        inAreaRef,
      ),
    );

    const wheel = new Event("wheel") as WheelEvent;
    const pdWheel = vi.spyOn(wheel, "preventDefault");
    act(() => {
      c.dispatchEvent(wheel);
    });
    expect(pdWheel).toHaveBeenCalled();

    const md = new MouseEvent("mousedown");
    const pdMd = vi.spyOn(md, "preventDefault");
    act(() => c.dispatchEvent(md));
    expect(pdMd).toHaveBeenCalled();

    const ts = new Event("touchstart") as TouchEvent;
    const pdTs = vi.spyOn(ts, "preventDefault");
    act(() => c.dispatchEvent(ts));
    expect(pdTs).toHaveBeenCalled();
  });

  it("wheel:ref=false 时不调 preventDefault", () => {
    const c = makeContainer({
      rect: { left: 100, top: 0, right: 500, bottom: 300 },
    });
    const containerRef = { current: c } as React.RefObject<HTMLElement>;
    const enabledRef = { current: true } as React.RefObject<boolean>;
    const hasScrollableRef = { current: true } as React.RefObject<boolean>;
    const inAreaRef = { current: false } as React.RefObject<boolean>;
    renderHook(() =>
      useScrollbarAreaDetect(
        containerRef,
        enabledRef,
        hasScrollableRef,
        inAreaRef,
      ),
    );
    const wheel = new Event("wheel") as WheelEvent;
    const pd = vi.spyOn(wheel, "preventDefault");
    act(() => c.dispatchEvent(wheel));
    expect(pd).not.toHaveBeenCalled();
  });

  it("keydown:ref=true 时 scroll key 被 preventDefault,普通 key 不动", () => {
    const c = makeContainer({
      rect: { left: 100, top: 0, right: 500, bottom: 300 },
    });
    const containerRef = { current: c } as React.RefObject<HTMLElement>;
    const enabledRef = { current: true } as React.RefObject<boolean>;
    const hasScrollableRef = { current: true } as React.RefObject<boolean>;
    const inAreaRef = { current: true } as React.RefObject<boolean>;
    renderHook(() =>
      useScrollbarAreaDetect(
        containerRef,
        enabledRef,
        hasScrollableRef,
        inAreaRef,
      ),
    );

    const arrow = new KeyboardEvent("keydown", {
      key: "ArrowLeft",
      code: "ArrowLeft",
    });
    const pdArrow = vi.spyOn(arrow, "preventDefault");
    act(() => document.dispatchEvent(arrow));
    expect(pdArrow).toHaveBeenCalled();

    const enter = new KeyboardEvent("keydown", { key: "Enter", code: "Enter" });
    const pdEnter = vi.spyOn(enter, "preventDefault");
    act(() => document.dispatchEvent(enter));
    expect(pdEnter).not.toHaveBeenCalled();
  });

  it("unmount 移除所有 listener(再触发不调 onPositionChange)", () => {
    const c = makeContainer({
      rect: { left: 100, top: 0, right: 500, bottom: 300 },
    });
    const containerRef = { current: c } as React.RefObject<HTMLElement>;
    const enabledRef = { current: true } as React.RefObject<boolean>;
    const hasScrollableRef = { current: true } as React.RefObject<boolean>;
    const inAreaRef = { current: false } as React.RefObject<boolean>;
    const onPositionChange = vi.fn();
    const { unmount } = renderHook(() =>
      useScrollbarAreaDetect(
        containerRef,
        enabledRef,
        hasScrollableRef,
        inAreaRef,
        { onPositionChange },
      ),
    );
    unmount();
    act(() => {
      c.dispatchEvent(
        new MouseEvent("mousemove", { clientX: 300, clientY: 295 }),
      );
    });
    expect(onPositionChange).not.toHaveBeenCalled();
  });
});
