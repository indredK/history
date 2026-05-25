/**
 * PeopleFunctions 单元测试 (§2.8)
 *
 * 包含搜索框 + 2 个独立 popover 开关(朝代筛选/职业分类)
 * 验证:每个 popover 由各自的按钮打开,且 onClose 独立关闭
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

// 两个 popover 都用 stub 替换以便观察 anchorEl
let dynastyAnchor: HTMLElement | null = null;
let dynastyClose: (() => void) | null = null;
let occupationAnchor: HTMLElement | null = null;
let occupationClose: (() => void) | null = null;

vi.mock("./PeopleDynastyFilterPopover", () => ({
  PeopleDynastyFilterPopover: ({
    anchorEl,
    onClose,
  }: {
    anchorEl: HTMLElement | null;
    onClose: () => void;
  }) => {
    dynastyAnchor = anchorEl;
    dynastyClose = onClose;
    return (
      <div data-testid="dynasty-pop" data-open={anchorEl ? "true" : "false"} />
    );
  },
}));

vi.mock("./OccupationFilterPopover", () => ({
  OccupationFilterPopover: ({
    anchorEl,
    onClose,
  }: {
    anchorEl: HTMLElement | null;
    onClose: () => void;
  }) => {
    occupationAnchor = anchorEl;
    occupationClose = onClose;
    return (
      <div
        data-testid="occupation-pop"
        data-open={anchorEl ? "true" : "false"}
      />
    );
  },
}));

import { PeopleFunctions } from "./index";

describe("PeopleFunctions", () => {
  it("渲染搜索框 + 朝代筛选按钮 + 职业分类按钮", () => {
    render(<PeopleFunctions />);
    expect(screen.getByPlaceholderText("搜索历史人物...")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /朝代筛选/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /职业分类/ }),
    ).toBeInTheDocument();
  });

  it("两个 popover 初始都关闭", () => {
    render(<PeopleFunctions />);
    expect(screen.getByTestId("dynasty-pop")).toHaveAttribute(
      "data-open",
      "false",
    );
    expect(screen.getByTestId("occupation-pop")).toHaveAttribute(
      "data-open",
      "false",
    );
  });

  it("点击 '朝代筛选' 只打开 dynasty popover", () => {
    render(<PeopleFunctions />);
    fireEvent.click(screen.getByRole("button", { name: /朝代筛选/ }));
    expect(screen.getByTestId("dynasty-pop")).toHaveAttribute(
      "data-open",
      "true",
    );
    expect(screen.getByTestId("occupation-pop")).toHaveAttribute(
      "data-open",
      "false",
    );
  });

  it("点击 '职业分类' 只打开 occupation popover", () => {
    render(<PeopleFunctions />);
    fireEvent.click(screen.getByRole("button", { name: /职业分类/ }));
    expect(screen.getByTestId("dynasty-pop")).toHaveAttribute(
      "data-open",
      "false",
    );
    expect(screen.getByTestId("occupation-pop")).toHaveAttribute(
      "data-open",
      "true",
    );
  });

  it("调 onClose 关闭对应 popover,另一个不受影响", () => {
    render(<PeopleFunctions />);
    fireEvent.click(screen.getByRole("button", { name: /朝代筛选/ }));
    fireEvent.click(screen.getByRole("button", { name: /职业分类/ }));
    expect(screen.getByTestId("dynasty-pop")).toHaveAttribute(
      "data-open",
      "true",
    );
    expect(screen.getByTestId("occupation-pop")).toHaveAttribute(
      "data-open",
      "true",
    );
    act(() => {
      dynastyClose?.();
    });
    expect(screen.getByTestId("dynasty-pop")).toHaveAttribute(
      "data-open",
      "false",
    );
    expect(screen.getByTestId("occupation-pop")).toHaveAttribute(
      "data-open",
      "true",
    );
    // 避免未使用变量警告
    expect(dynastyAnchor).toBeNull();
    expect(occupationAnchor).not.toBeNull();
    expect(typeof occupationClose).toBe("function");
  });
});
