/**
 * timeline/SearchBar 单元测试 (§2.8)
 *
 * 极简组件:本地 useState 持有 searchQuery,onChange 写状态,
 * onFocus/onBlur 改 inline style。
 * 验证目标:
 *   - 渲染 input + placeholder="搜索事件..."
 *   - onChange 改 input value(受控)
 *   - onFocus/onBlur 改 borderColor / boxShadow
 */
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchBar } from "./SearchBar";

describe("timeline/SearchBar", () => {
  it("初始 placeholder + value 为空", () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(
      "搜索事件...",
    ) as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe("");
  });

  it("onChange 把输入写入 value(受控 state)", () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(
      "搜索事件...",
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "贞观之治" } });
    expect(input.value).toBe("贞观之治");
  });

  it("onFocus 把 borderColor / boxShadow 改成 focus 颜色", () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(
      "搜索事件...",
    ) as HTMLInputElement;
    fireEvent.focus(input);
    expect(input.style.borderColor).toBe("var(--color-primary)");
    expect(input.style.boxShadow).toBe("0 0 20px rgba(var(--glass-tint-rgb), 0.26)");
  });

  it("onBlur 把 borderColor / boxShadow 还原到默认", () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(
      "搜索事件...",
    ) as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.blur(input);
    expect(input.style.borderColor).toBe("var(--color-border-medium)");
    expect(input.style.boxShadow).toBe("0 0 0 rgba(var(--glass-tint-rgb), 0)");
  });
});
