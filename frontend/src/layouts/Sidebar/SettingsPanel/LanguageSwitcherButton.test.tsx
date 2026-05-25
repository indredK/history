/**
 * LanguageSwitcherButton 单元测试 (§2.8)
 *
 * 预留组件,真正的多语言能力未实现,点击只弹一个 Snackbar 提示。
 *
 * 验证目标:
 *   - 渲染 IconButton + aria-label='切换语言'
 *   - 默认 Snackbar 不可见
 *   - 点击 → Snackbar 出现 + 显示 '语言切换功能即将推出'
 */
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageSwitcherButton } from "./LanguageSwitcherButton";

describe("LanguageSwitcherButton", () => {
  it("渲染 IconButton + aria-label='切换语言'", () => {
    render(<LanguageSwitcherButton collapsed={false} />);
    expect(
      screen.getByRole("button", { name: "切换语言" }),
    ).toBeInTheDocument();
  });

  it("默认 Snackbar 不挂载内容", () => {
    render(<LanguageSwitcherButton collapsed={false} />);
    expect(screen.queryByText("语言切换功能即将推出")).not.toBeInTheDocument();
  });

  it("点击后 Snackbar 显示 '语言切换功能即将推出'", () => {
    render(<LanguageSwitcherButton collapsed={false} />);
    fireEvent.click(screen.getByRole("button", { name: "切换语言" }));
    expect(screen.getByText("语言切换功能即将推出")).toBeInTheDocument();
  });

  it("collapsed 切换不影响 aria-label", () => {
    const { rerender } = render(<LanguageSwitcherButton collapsed={false} />);
    expect(
      screen.getByRole("button", { name: "切换语言" }),
    ).toBeInTheDocument();

    rerender(<LanguageSwitcherButton collapsed={true} />);
    expect(
      screen.getByRole("button", { name: "切换语言" }),
    ).toBeInTheDocument();
  });
});
