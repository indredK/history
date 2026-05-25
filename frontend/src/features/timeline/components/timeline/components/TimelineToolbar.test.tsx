/**
 * TimelineToolbar 单元测试 (§2.8)
 *
 * 工具栏:zoomLevel 展示、5 个按钮(panLeft/panRight/zoomOut/reset/zoomIn)
 * 验证:
 *   - 标题 + zoomLevel.toFixed(1) 展示
 *   - 5 个按钮通过 title 区分,点击触发对应回调
 *   - 内嵌 ToolbarButton 的 hover enter/leave 写入 inline style 不报错
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TimelineToolbar } from "./TimelineToolbar";

const baseProps = {
  zoomLevel: 1.5,
  onZoomIn: vi.fn(),
  onZoomOut: vi.fn(),
  onResetZoom: vi.fn(),
  onPanLeft: vi.fn(),
  onPanRight: vi.fn(),
};

describe("TimelineToolbar", () => {
  it("显示标题 + zoom level(toFixed(1))", () => {
    render(<TimelineToolbar {...baseProps} zoomLevel={2} />);
    expect(screen.getByText("历史时间轴")).toBeInTheDocument();
    expect(screen.getByText("时间缩放: 2.0x")).toBeInTheDocument();
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
    fireEvent.click(screen.getByTitle("向左滚动"));
    fireEvent.click(screen.getByTitle("向右滚动"));
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
    fireEvent.click(screen.getByTitle("时间范围放大"));
    fireEvent.click(screen.getByTitle("时间范围缩小"));
    fireEvent.click(screen.getByTitle("重置时间范围"));
    expect(onZoomOut).toHaveBeenCalledTimes(1);
    expect(onZoomIn).toHaveBeenCalledTimes(1);
    expect(onResetZoom).toHaveBeenCalledTimes(1);
  });

  it("mouseEnter / mouseLeave 在按钮上不抛错(Object.assign style)", () => {
    render(<TimelineToolbar {...baseProps} />);
    const btn = screen.getByTitle("向左滚动");
    expect(() => {
      fireEvent.mouseEnter(btn);
      fireEvent.mouseLeave(btn);
    }).not.toThrow();
  });
});
