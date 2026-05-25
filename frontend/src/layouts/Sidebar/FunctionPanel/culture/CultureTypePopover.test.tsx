/**
 * CultureTypePopover 单元测试 (§2.8)
 *
 * 静态枚举 Popover:6 个文化类型 checkbox(2 个默认选中)
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CultureTypePopover } from "./CultureTypePopover";

describe("CultureTypePopover", () => {
  it("anchorEl=null 时关闭", () => {
    render(<CultureTypePopover anchorEl={null} onClose={() => {}} />);
    expect(screen.queryByText("文化类型")).not.toBeInTheDocument();
  });

  it("anchorEl 非空时打开,显示 6 个类型与 defaultChecked 状态", () => {
    const anchor = document.createElement("button");
    document.body.appendChild(anchor);
    try {
      render(<CultureTypePopover anchorEl={anchor} onClose={() => {}} />);
      expect(screen.getByText("文化类型")).toBeInTheDocument();
      expect(screen.getByText("文学作品")).toBeInTheDocument();
      expect(screen.getByText("艺术作品")).toBeInTheDocument();
      expect(screen.getByText("科技发明")).toBeInTheDocument();
      expect(screen.getByText("宗教思想")).toBeInTheDocument();
      expect(screen.getByText("建筑工程")).toBeInTheDocument();
      expect(screen.getByText("民俗文化")).toBeInTheDocument();
      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes).toHaveLength(6);
      // 前 2 个默认选中
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).toBeChecked();
      // 后 4 个不选中
      expect(checkboxes[2]).not.toBeChecked();
      expect(checkboxes[3]).not.toBeChecked();
    } finally {
      anchor.remove();
    }
  });
});
