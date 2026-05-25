/**
 * Footer 单元测试 (§2.8)
 *
 * 几乎全静态:渲染 footer 区域 + 一行版权字样。
 * 验证目标:DOM 结构、language=app-footer className、版权文本可见。
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "./Footer";

describe("Footer", () => {
  it("渲染 <footer> 标签并带 app-footer className", () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector("footer");
    expect(footer).not.toBeNull();
    expect(footer?.className).toContain("app-footer");
  });

  it("渲染版权信息", () => {
    render(<Footer />);
    // 一次匹配整段(MUI Typography 不会插入额外节点)
    expect(screen.getByText(/© 2025 中国历史全景/)).toBeInTheDocument();
    expect(screen.getByText(/Chinese Historical Panorama/)).toBeInTheDocument();
    expect(screen.getByText(/MIT License/)).toBeInTheDocument();
  });
});
