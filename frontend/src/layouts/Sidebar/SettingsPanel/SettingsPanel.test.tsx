/**
 * SettingsPanel 单元测试 (§2.8)
 *
 * 极薄聚合组件:三个 SettingsButton 子组件按 collapsed 决定 direction。
 * 验证:
 *   - 渲染三个子按钮(Theme/Style/Language)
 *   - collapsed=true 时 Stack 走 column,false 时走 row
 *   - 子按钮接收正确的 collapsed prop
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("./ThemeToggleButton", () => ({
  ThemeToggleButton: ({ collapsed }: { collapsed: boolean }) => (
    <div data-testid="theme-btn" data-collapsed={String(collapsed)}>
      theme
    </div>
  ),
}));
vi.mock("./StyleSwitcherButton", () => ({
  StyleSwitcherButton: ({ collapsed }: { collapsed: boolean }) => (
    <div data-testid="style-btn" data-collapsed={String(collapsed)}>
      style
    </div>
  ),
}));
vi.mock("./LanguageSwitcherButton", () => ({
  LanguageSwitcherButton: ({ collapsed }: { collapsed: boolean }) => (
    <div data-testid="lang-btn" data-collapsed={String(collapsed)}>
      lang
    </div>
  ),
}));

// useResponsive 桩(避免 matchMedia/window.resize 噪音)
vi.mock("@/hooks", () => ({
  useResponsive: () => ({ screenWidth: 1024 }),
}));

vi.mock("@/config/glassConfig", () => ({
  getGlassConfig: () => ({
    blur: { light: "8px" },
    border: { radius: { lg: 12 } },
    animation: { duration: { normal: "200ms" }, easing: "ease" },
  }),
}));

import { SettingsPanel } from "./SettingsPanel";

describe("SettingsPanel", () => {
  it("collapsed=false 时渲染三个按钮且 collapsed 透传 false", () => {
    render(<SettingsPanel collapsed={false} />);
    expect(screen.getByTestId("theme-btn")).toHaveAttribute(
      "data-collapsed",
      "false",
    );
    expect(screen.getByTestId("style-btn")).toHaveAttribute(
      "data-collapsed",
      "false",
    );
    expect(screen.getByTestId("lang-btn")).toHaveAttribute(
      "data-collapsed",
      "false",
    );
  });

  it("collapsed=true 时 collapsed 透传 true", () => {
    render(<SettingsPanel collapsed={true} />);
    expect(screen.getByTestId("theme-btn")).toHaveAttribute(
      "data-collapsed",
      "true",
    );
    expect(screen.getByTestId("style-btn")).toHaveAttribute(
      "data-collapsed",
      "true",
    );
    expect(screen.getByTestId("lang-btn")).toHaveAttribute(
      "data-collapsed",
      "true",
    );
  });

  it("三个按钮顺序固定:Theme → Style → Language", () => {
    render(<SettingsPanel collapsed={false} />);
    const allButtons = screen.getAllByText(/^(theme|style|lang)$/);
    expect(allButtons.map((el) => el.textContent)).toEqual([
      "theme",
      "style",
      "lang",
    ]);
  });
});
