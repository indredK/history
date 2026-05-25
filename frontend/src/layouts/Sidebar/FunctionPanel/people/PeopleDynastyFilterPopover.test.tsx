/**
 * PeopleDynastyFilterPopover 单元测试 (§2.8)
 *
 * 静态枚举 Popover:6 个朝代 chip
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PeopleDynastyFilterPopover } from "./PeopleDynastyFilterPopover";

describe("PeopleDynastyFilterPopover", () => {
  it("anchorEl=null 时关闭", () => {
    render(<PeopleDynastyFilterPopover anchorEl={null} onClose={() => {}} />);
    expect(screen.queryByText("朝代筛选")).not.toBeInTheDocument();
  });

  it("anchorEl 非空时打开,显示 6 个朝代 chip", () => {
    const anchor = document.createElement("button");
    document.body.appendChild(anchor);
    try {
      render(
        <PeopleDynastyFilterPopover anchorEl={anchor} onClose={() => {}} />,
      );
      expect(screen.getByText("朝代筛选")).toBeInTheDocument();
      ["春秋战国", "秦汉", "魏晋南北朝", "隋唐", "宋元", "明清"].forEach(
        (label) => {
          expect(screen.getByText(label)).toBeInTheDocument();
        },
      );
    } finally {
      anchor.remove();
    }
  });
});
