/**
 * TimelineFunctions 单元测试 (§2.8)
 *
 * 顶层 Popover 触发按钮的开关状态机:
 *   - 点击 "事件类型" 按钮时,popover 通过 anchorEl 打开
 *   - 子 Popover 调用 onClose 时关闭
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

// 用一个简单受控 stub 替换 EventTypeFilterPopover,以便观察 anchorEl/onClose
let lastAnchorEl: HTMLElement | null = null;
let lastOnClose: (() => void) | null = null;
vi.mock("./EventTypeFilterPopover", () => ({
  EventTypeFilterPopover: ({
    anchorEl,
    onClose,
  }: {
    anchorEl: HTMLElement | null;
    onClose: () => void;
  }) => {
    lastAnchorEl = anchorEl;
    lastOnClose = onClose;
    return (
      <div
        data-testid="evt-popover-stub"
        data-open={anchorEl ? "true" : "false"}
      />
    );
  },
}));

import { TimelineFunctions } from "./index";

describe("TimelineFunctions", () => {
  it("初始 anchorEl=null", () => {
    lastAnchorEl = null;
    render(<TimelineFunctions />);
    expect(screen.getByTestId("evt-popover-stub")).toHaveAttribute(
      "data-open",
      "false",
    );
  });

  it("点击 '事件类型' 按钮设置 anchorEl 为该按钮", () => {
    render(<TimelineFunctions />);
    const btn = screen.getByRole("button", { name: /事件类型/ });
    fireEvent.click(btn);
    expect(screen.getByTestId("evt-popover-stub")).toHaveAttribute(
      "data-open",
      "true",
    );
    // anchorEl 应是这个按钮元素
    expect(lastAnchorEl).toBe(btn);
  });

  it("调用 stub 暴露的 onClose 后 anchorEl 重置为 null", () => {
    render(<TimelineFunctions />);
    const btn = screen.getByRole("button", { name: /事件类型/ });
    fireEvent.click(btn);
    expect(screen.getByTestId("evt-popover-stub")).toHaveAttribute(
      "data-open",
      "true",
    );
    // 通过模拟 popover 内的关闭事件来还原 anchorEl
    act(() => {
      lastOnClose?.();
    });
    expect(screen.getByTestId("evt-popover-stub")).toHaveAttribute(
      "data-open",
      "false",
    );
  });
});
