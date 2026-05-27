/**
 * TimelineToolbar 单元测试 (§2.8)
 *
 * 工具栏:zoomLevel / 可视范围 / 事件计数 展示、5 个按钮(panLeft/panRight/zoomOut/reset/zoomIn)
 * 验证:
 *   - 标题 + zoomLevel.toFixed(1) + summary 展示
 *   - 5 个按钮通过 aria-label 区分,点击触发对应回调
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TimelineToolbar } from "./TimelineToolbar";

const baseProps = {
  focusLabel: "唐",
  visibleRangeLabel: "公元618年 - 公元907年",
  visibleEventCount: 12,
  totalEventCount: 128,
  zoomLevel: 1.5,
  onZoomIn: vi.fn(),
  onZoomOut: vi.fn(),
  onResetZoom: vi.fn(),
  onPanLeft: vi.fn(),
  onPanRight: vi.fn(),
};

describe("TimelineToolbar", () => {
  it("显示标题 + zoom level(toFixed(1)) + summary", () => {
    render(<TimelineToolbar {...baseProps} zoomLevel={2} />);
    expect(screen.getByText("历史时间轴")).toBeInTheDocument();
    expect(screen.getByText("2.0x")).toBeInTheDocument();
    expect(screen.getByText("公元618年 - 公元907年")).toBeInTheDocument();
    expect(screen.getByText("12/128")).toBeInTheDocument();
    expect(screen.getByText("唐")).toBeInTheDocument();
  });

  it("点击向左/向右调对应回调", () => {
    const onPanLeft = vi.fn();
    const onPanRight = vi.fn();
    render(
      <TimelineToolbar
        {...baseProps}
        onPanLeft={onPanLeft}
        onPanRight={onPanRight}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "向左滚动" }));
    fireEvent.click(screen.getByRole("button", { name: "向右滚动" }));
    expect(onPanLeft).toHaveBeenCalledTimes(1);
    expect(onPanRight).toHaveBeenCalledTimes(1);
  });

  it("点击 zoomOut / zoomIn / reset 调对应回调", () => {
    const onZoomIn = vi.fn();
    const onZoomOut = vi.fn();
    const onResetZoom = vi.fn();
    render(
      <TimelineToolbar
        {...baseProps}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onResetZoom={onResetZoom}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "时间范围放大" }));
    fireEvent.click(screen.getByRole("button", { name: "时间范围缩小" }));
    fireEvent.click(screen.getByRole("button", { name: "重置时间范围" }));
    expect(onZoomOut).toHaveBeenCalledTimes(1);
    expect(onZoomIn).toHaveBeenCalledTimes(1);
    expect(onResetZoom).toHaveBeenCalledTimes(1);
  });

  it("无 focusLabel 时不显示朝代摘要", () => {
    render(<TimelineToolbar {...baseProps} focusLabel={null} />);
    expect(screen.queryByText("唐")).not.toBeInTheDocument();
  });
});
