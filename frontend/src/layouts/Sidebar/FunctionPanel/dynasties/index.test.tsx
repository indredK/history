/**
 * DynastiesFunctions 单元测试 (§2.8)
 *
 * "展开/收起全部" 按钮基于 useDynastiesExpanded store:
 *   - expandedCount === totalCount 时 "展开" 按钮 disabled
 *   - expandedCount === 0 时 "收起" 按钮 disabled
 *   - 中间状态两按钮都可点
 *   - 点击触发 expandAllDynasties / collapseAllDynasties
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const expandAllDynasties = vi.fn();
const collapseAllDynasties = vi.fn();
const getExpandedDynastiesCount = vi.fn();
const getTotalDynastiesCount = vi.fn();

vi.mock("@/store/dynastyExpandedStore", () => ({
  useDynastiesExpanded: () => ({
    expandAllDynasties,
    collapseAllDynasties,
    getExpandedDynastiesCount,
    getTotalDynastiesCount,
  }),
}));

import { DynastiesFunctions } from "./index";

describe("DynastiesFunctions", () => {
  beforeEach(() => {
    expandAllDynasties.mockReset();
    collapseAllDynasties.mockReset();
    getExpandedDynastiesCount.mockReset();
    getTotalDynastiesCount.mockReset();
  });

  it("显示 '已展开 X / Y' 文本", () => {
    getExpandedDynastiesCount.mockReturnValue(5);
    getTotalDynastiesCount.mockReturnValue(24);
    render(<DynastiesFunctions />);
    expect(screen.getByText("已展开 5 / 24 个朝代")).toBeInTheDocument();
  });

  it("expanded=0 时 '收起' disabled,'展开' 可用", () => {
    getExpandedDynastiesCount.mockReturnValue(0);
    getTotalDynastiesCount.mockReturnValue(24);
    render(<DynastiesFunctions />);
    const expandBtn = screen.getByRole("button", { name: /展开全部朝代/ });
    const collapseBtn = screen.getByRole("button", { name: /收起全部朝代/ });
    expect(expandBtn).not.toBeDisabled();
    expect(collapseBtn).toBeDisabled();
  });

  it("expanded=total 时 '展开' disabled,'收起' 可用", () => {
    getExpandedDynastiesCount.mockReturnValue(24);
    getTotalDynastiesCount.mockReturnValue(24);
    render(<DynastiesFunctions />);
    const expandBtn = screen.getByRole("button", { name: /展开全部朝代/ });
    const collapseBtn = screen.getByRole("button", { name: /收起全部朝代/ });
    expect(expandBtn).toBeDisabled();
    expect(collapseBtn).not.toBeDisabled();
  });

  it("中间状态(0 < expanded < total)两个按钮都可用", () => {
    getExpandedDynastiesCount.mockReturnValue(12);
    getTotalDynastiesCount.mockReturnValue(24);
    render(<DynastiesFunctions />);
    expect(
      screen.getByRole("button", { name: /展开全部朝代/ }),
    ).not.toBeDisabled();
    expect(
      screen.getByRole("button", { name: /收起全部朝代/ }),
    ).not.toBeDisabled();
  });

  it("点击 '展开全部朝代' 调 expandAllDynasties", () => {
    getExpandedDynastiesCount.mockReturnValue(5);
    getTotalDynastiesCount.mockReturnValue(24);
    render(<DynastiesFunctions />);
    fireEvent.click(screen.getByRole("button", { name: /展开全部朝代/ }));
    expect(expandAllDynasties).toHaveBeenCalledTimes(1);
  });

  it("点击 '收起全部朝代' 调 collapseAllDynasties", () => {
    getExpandedDynastiesCount.mockReturnValue(5);
    getTotalDynastiesCount.mockReturnValue(24);
    render(<DynastiesFunctions />);
    fireEvent.click(screen.getByRole("button", { name: /收起全部朝代/ }));
    expect(collapseAllDynasties).toHaveBeenCalledTimes(1);
  });
});
