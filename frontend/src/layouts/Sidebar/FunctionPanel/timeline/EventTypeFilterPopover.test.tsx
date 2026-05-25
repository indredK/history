/**
 * EventTypeFilterPopover 单元测试 (§2.8)
 *
 * Popover 受控展示组件:anchorEl=null 关闭、anchorEl!=null 打开。
 * 4 个事件类型 checkbox 静态枚举。
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EventTypeFilterPopover } from "./EventTypeFilterPopover";

describe("EventTypeFilterPopover", () => {
  it("anchorEl=null 时 Popover 关闭(不渲染内容)", () => {
    render(<EventTypeFilterPopover anchorEl={null} onClose={() => {}} />);
    expect(screen.queryByText("事件类型")).not.toBeInTheDocument();
  });

  it("anchorEl 非空时 Popover 打开,显示标题与 4 个类型", () => {
    const anchor = document.createElement("button");
    document.body.appendChild(anchor);
    try {
      render(<EventTypeFilterPopover anchorEl={anchor} onClose={() => {}} />);
      expect(screen.getByText("事件类型")).toBeInTheDocument();
      expect(screen.getByText("政治事件")).toBeInTheDocument();
      expect(screen.getByText("军事战争")).toBeInTheDocument();
      expect(screen.getByText("文化艺术")).toBeInTheDocument();
      expect(screen.getByText("科技发明")).toBeInTheDocument();
      // 4 个 checkbox
      expect(screen.getAllByRole("checkbox")).toHaveLength(4);
    } finally {
      anchor.remove();
    }
  });
});
