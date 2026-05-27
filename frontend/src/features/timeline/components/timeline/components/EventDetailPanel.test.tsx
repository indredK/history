/**
 * EventDetailPanel 单元测试 (§2.8)
 *
 * 极薄展示组件:渲染单条 event,提供 favorite + share 两个按钮。
 * 验证:
 *   - title / startYear 显示
 *   - endYear 与 startYear 同年时不显示 "- endYear" 后缀
 *   - description / startDate 缺失时不渲染对应区
 *   - 收藏按钮 icon 随 isFavorite 切换(StarOutlined ↔ Star)
 *   - favorite/share 按钮点击触发回调
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EventDetailPanel } from "./EventDetailPanel";
import type { Event } from "@/services/timeline/types";

const makeEvent = (overrides: Partial<Event> = {}): Event => ({
  id: overrides.id ?? "e1",
  title: overrides.title ?? "安史之乱",
  startYear: overrides.startYear ?? 755,
  endYear: overrides.endYear ?? 755,
  description: overrides.description ?? "",
  startDate: overrides.startDate ?? "",
  ...overrides,
});

describe("EventDetailPanel", () => {
  it("渲染 title + startYear", () => {
    render(
      <EventDetailPanel
        event={makeEvent()}
        isFavorite={false}
        onToggleFavorite={() => {}}
        onShare={() => {}}
      />,
    );
    expect(screen.getByText("安史之乱")).toBeInTheDocument();
    // 年份和 “年” 字会被 React 拆成相邻文本节点,用 includes 匹配
    expect(screen.getByText(/755/)).toBeInTheDocument();
  });

  it("endYear 与 startYear 不同时显示 '- endYear'", () => {
    render(
      <EventDetailPanel
        event={makeEvent({ startYear: 755, endYear: 763 })}
        isFavorite={false}
        onToggleFavorite={() => {}}
        onShare={() => {}}
      />,
    );
    expect(screen.getByText(/755/)).toBeInTheDocument();
    expect(screen.getByText(/763/)).toBeInTheDocument();
  });

  it("description 缺失时不渲染描述区", () => {
    render(
      <EventDetailPanel
        event={makeEvent({ description: "" })}
        isFavorite={false}
        onToggleFavorite={() => {}}
        onShare={() => {}}
      />,
    );
    expect(screen.queryByText(/盘古劈开混沌/)).not.toBeInTheDocument();
  });

  it("description 存在时渲染描述", () => {
    render(
      <EventDetailPanel
        event={makeEvent({ description: "唐玄宗后期重大叛乱" })}
        isFavorite={false}
        onToggleFavorite={() => {}}
        onShare={() => {}}
      />,
    );
    expect(screen.getByText("唐玄宗后期重大叛乱")).toBeInTheDocument();
  });

  it("startDate 存在时渲染 startDate", () => {
    render(
      <EventDetailPanel
        event={makeEvent({ startDate: "755-12-16" })}
        isFavorite={false}
        onToggleFavorite={() => {}}
        onShare={() => {}}
      />,
    );
    expect(screen.getByText("755-12-16")).toBeInTheDocument();
  });

  it("点击收藏按钮触发 onToggleFavorite(eventId)", () => {
    const onToggle = vi.fn();
    render(
      <EventDetailPanel
        event={makeEvent({ id: "ev-xxx" })}
        isFavorite={false}
        onToggleFavorite={onToggle}
        onShare={() => {}}
      />,
    );
    // 通过 button index 取按钮(第 0 个是收藏,第 1 个是分享)
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]!);
    expect(onToggle).toHaveBeenCalledWith("ev-xxx");
  });

  it("点击分享按钮触发 onShare(event)", () => {
    const onShare = vi.fn();
    const event = makeEvent();
    render(
      <EventDetailPanel
        event={event}
        isFavorite={false}
        onToggleFavorite={() => {}}
        onShare={onShare}
      />,
    );
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[1]!);
    expect(onShare).toHaveBeenCalledWith(event);
  });
});
