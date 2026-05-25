/**
 * PeriodFilterPopover 单元测试 (§2.8)
 *
 * 静态枚举 Popover:6 个时期 Chip(先秦/秦汉/魏晋/隋唐/宋元/明清)
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PeriodFilterPopover } from "./PeriodFilterPopover";

describe("PeriodFilterPopover", () => {
  it("anchorEl=null 时关闭", () => {
    render(<PeriodFilterPopover anchorEl={null} onClose={() => {}} />);
    expect(screen.queryByText("时期筛选")).not.toBeInTheDocument();
  });

  it("anchorEl 非空时打开,显示 6 个时期 chip", () => {
    const anchor = document.createElement("button");
    document.body.appendChild(anchor);
    try {
      render(<PeriodFilterPopover anchorEl={anchor} onClose={() => {}} />);
      expect(screen.getByText("时期筛选")).toBeInTheDocument();
      ["先秦", "秦汉", "魏晋", "隋唐", "宋元", "明清"].forEach((label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    } finally {
      anchor.remove();
    }
  });
});
