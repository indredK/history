/**
 * StyleSwitcherButton 单元测试 (§2.8)
 *
 * 组件依赖:
 *   - useStyleStore() → { style, toggleStyle }
 *   - useResponsive() → { screenWidth }
 *   - getGlassConfig(screenWidth)
 *
 * 验证目标:
 *   - aria-label 跟随 style 切换:'切换到经典样式' / '切换到毛玻璃样式'
 *   - 点击调 toggleStyle(store 翻转 glass/classic)+ document.documentElement 上
 *     200ms 内挂 'style-transitioning' class,200ms 后由 setTimeout 移除
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { StyleSwitcherButton } from "./StyleSwitcherButton";
import { useStyleStore } from "@/store";

describe("StyleSwitcherButton", () => {
  beforeEach(() => {
    act(() => {
      useStyleStore.setState({ style: "glass" });
    });
    document.documentElement.classList.remove("style-transitioning");
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("glass 样式:aria-label='切换到经典样式'", () => {
    render(<StyleSwitcherButton collapsed={false} />);
    expect(
      screen.getByRole("button", { name: "切换到经典样式" }),
    ).toBeInTheDocument();
  });

  it("classic 样式:aria-label='切换到毛玻璃样式'", () => {
    act(() => {
      useStyleStore.setState({ style: "classic" });
    });
    render(<StyleSwitcherButton collapsed={false} />);
    expect(
      screen.getByRole("button", { name: "切换到毛玻璃样式" }),
    ).toBeInTheDocument();
  });

  it("点击 toggleStyle:store 翻转 + 立刻挂 'style-transitioning' class", () => {
    render(<StyleSwitcherButton collapsed={false} />);
    expect(
      document.documentElement.classList.contains("style-transitioning"),
    ).toBe(false);

    fireEvent.click(screen.getByRole("button"));

    expect(useStyleStore.getState().style).toBe("classic");
    expect(
      document.documentElement.classList.contains("style-transitioning"),
    ).toBe(true);
  });

  it("200ms 后 setTimeout 移除 'style-transitioning' class", () => {
    render(<StyleSwitcherButton collapsed={false} />);
    fireEvent.click(screen.getByRole("button"));
    expect(
      document.documentElement.classList.contains("style-transitioning"),
    ).toBe(true);

    act(() => {
      vi.advanceTimersByTime(199);
    });
    // 199ms 还没到 200ms,还在过渡中
    expect(
      document.documentElement.classList.contains("style-transitioning"),
    ).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(
      document.documentElement.classList.contains("style-transitioning"),
    ).toBe(false);
  });
});
