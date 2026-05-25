/**
 * OccupationFilterPopover 单元测试 (§2.8)
 *
 * 静态枚举 Popover:6 个职业 checkbox(均不默认选中)
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OccupationFilterPopover } from "./OccupationFilterPopover";

describe("OccupationFilterPopover", () => {
  it("anchorEl=null 时关闭", () => {
    render(<OccupationFilterPopover anchorEl={null} onClose={() => {}} />);
    expect(screen.queryByText("职业分类")).not.toBeInTheDocument();
  });

  it("anchorEl 非空时打开,显示 6 个职业", () => {
    const anchor = document.createElement("button");
    document.body.appendChild(anchor);
    try {
      render(<OccupationFilterPopover anchorEl={anchor} onClose={() => {}} />);
      expect(screen.getByText("职业分类")).toBeInTheDocument();
      [
        "皇帝君主",
        "文人学者",
        "军事将领",
        "思想家",
        "艺术家",
        "科学家",
      ].forEach((label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
      expect(screen.getAllByRole("checkbox")).toHaveLength(6);
      // 均不默认选中
      screen.getAllByRole("checkbox").forEach((cb) => {
        expect(cb).not.toBeChecked();
      });
    } finally {
      anchor.remove();
    }
  });
});
