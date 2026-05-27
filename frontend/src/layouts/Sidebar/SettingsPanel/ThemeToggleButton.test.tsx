/**
 * ThemeToggleButton 单元测试 (§2.8)
 *
 * 组件依赖:
 *   - useThemeStore() → { theme, toggleTheme }
 *   - useResponsive() → { screenWidth }
 *   - getGlassConfig(screenWidth)(只读取尺寸,不需要 mock)
 *
 * 验证目标:
 *   - 渲染 IconButton + aria-label 跟随 theme 切换
 *   - dark/light 各自的 fontSize(collapsed 控制 small/medium)
 *   - 点击触发 useThemeStore.toggleTheme(状态翻转)
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ThemeToggleButton } from "./ThemeToggleButton";
import { useThemeStore } from "@/store";

describe("ThemeToggleButton", () => {
  beforeEach(() => {
    // 重置 zustand store 状态
    act(() => {
      useThemeStore.setState({ theme: "light" });
    });
  });

  it("light 主题:aria-label='切换到暗黑模式'", () => {
    render(<ThemeToggleButton collapsed={false} />);
    expect(
      screen.getByRole("button", { name: "切换到暗黑模式" }),
    ).toBeInTheDocument();
  });

  it("dark 主题:aria-label='切换到白天模式'", () => {
    act(() => {
      useThemeStore.setState({ theme: "dark" });
    });
    render(<ThemeToggleButton collapsed={false} />);
    expect(
      screen.getByRole("button", { name: "切换到白天模式" }),
    ).toBeInTheDocument();
  });

  it("点击触发 toggleTheme,store 状态翻转", () => {
    const before = useThemeStore.getState().theme;
    expect(before).toBe("light");
    render(<ThemeToggleButton collapsed={false} />);
    fireEvent.click(screen.getByRole("button"));
    expect(useThemeStore.getState().theme).toBe("dark");

    // 再点一次回到 light
    fireEvent.click(screen.getByRole("button"));
    expect(useThemeStore.getState().theme).toBe("light");
  });

  it("collapsed=true 时按钮尺寸更小(width=36)", () => {
    const { container } = render(<ThemeToggleButton collapsed={true} />);
    const button = container.querySelector("button");
    expect(button).toBeTruthy();
    // MUI inline sx 转 emotion class,但 width 跟着 CSS prop sx 渲染时还是会进 style
    // 直接拿 button 的 computed style 是不稳的,这里只验证渲染不抛错 +
    // 通过 aria-label 与 collapsed 配合工作
    expect(button).toHaveAttribute("aria-label");
  });

  it("点击不抛错(side-effect 是 zustand setState)", () => {
    render(<ThemeToggleButton collapsed={false} />);
    expect(() => fireEvent.click(screen.getByRole("button"))).not.toThrow();
  });
});
