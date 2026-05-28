import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTimelineStore } from '@/store';

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

vi.mock('ahooks', () => ({
  useRequest: () => ({
    data: [],
  }),
}));

import { TimelineFunctions } from "./index";

describe("TimelineFunctions", () => {
  beforeEach(() => {
    useTimelineStore.getState().resetViewState();
  });

  it("初始 anchorEl=null", () => {
    lastAnchorEl = null;
    render(<TimelineFunctions />);
    expect(screen.getAllByTestId("evt-popover-stub")).toHaveLength(2);
    expect(screen.getAllByTestId("evt-popover-stub").every((node) => node.getAttribute('data-open') === 'false')).toBe(true);
  });

  it("点击 '事件类型' 按钮设置 anchorEl 为该按钮", () => {
    render(<TimelineFunctions />);
    const btn = screen.getByRole("button", { name: /事件类型/ });
    fireEvent.click(btn);
    const popovers = screen.getAllByTestId("evt-popover-stub");
    expect(popovers[1]).toHaveAttribute("data-open", "true");
    // anchorEl 应是这个按钮元素
    expect(lastAnchorEl).toBe(btn);
  });

  it("调用 stub 暴露的 onClose 后 anchorEl 重置为 null", () => {
    render(<TimelineFunctions />);
    const btn = screen.getByRole("button", { name: /事件类型/ });
    fireEvent.click(btn);
    expect(screen.getAllByTestId("evt-popover-stub")[1]).toHaveAttribute(
      "data-open",
      "true",
    );
    // 通过模拟 popover 内的关闭事件来还原 anchorEl
    act(() => {
      lastOnClose?.();
    });
    expect(screen.getAllByTestId("evt-popover-stub")[1]).toHaveAttribute("data-open", "false");
  });

  it('输入搜索词会更新时间轴 store', () => {
    render(<TimelineFunctions />);
    fireEvent.change(screen.getByPlaceholderText('搜索事件'), {
      target: { value: '赤壁' },
    });
    expect(useTimelineStore.getState().keyword).toBe('赤壁');
  });
});
