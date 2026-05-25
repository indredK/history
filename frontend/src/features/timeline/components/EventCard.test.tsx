/**
 * timeline/EventCard 单元测试 (§2.8)
 *
 * 验证目标:
 *   - title / startYear 显示
 *   - endYear !== startYear → '- endYear' 显示;相等时不显示 '-'
 *   - description.substring(0, 140) 截断 + 结尾 '...'(代码硬编码追加)
 *   - 收藏按钮 toggle:点击 '收藏' → '已收藏' → 再点回 '收藏'
 *   - 分享按钮:navigator.share 存在 → 调 share(data);否则 fallback 到 clipboard.writeText
 *   - 详情 details 默认折叠;打开后看到 startDate / categories / image
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EventCard } from "./EventCard";
import type { Event } from "@/services/timeline/types";

const makeEvent = (overrides: Partial<Event> = {}): Event => ({
  id: overrides.id ?? "e1",
  title: overrides.title ?? "贞观之治",
  startYear: overrides.startYear ?? 627,
  endYear: overrides.endYear ?? 627,
  description: overrides.description ?? "唐太宗时期的盛世",
  ...overrides,
});

describe("timeline/EventCard", () => {
  afterEach(() => {
    // 清掉 navigator.share / clipboard 桩
    delete (navigator as unknown as { share?: unknown }).share;
  });

  it("渲染 title + startYear", () => {
    render(<EventCard event={makeEvent()} index={0} />);
    expect(screen.getByText("贞观之治")).toBeInTheDocument();
    // 627 单独出现
    expect(screen.getByText("627")).toBeInTheDocument();
  });

  it("endYear !== startYear → 显示 '- endYear'(同一节点内)", () => {
    const { container } = render(
      <EventCard
        event={makeEvent({ startYear: 627, endYear: 649 })}
        index={0}
      />,
    );
    const yearBox = container.querySelector(".event-year");
    expect(yearBox?.textContent).toContain("627");
    expect(yearBox?.textContent).toContain("- 649");
  });

  it("endYear === startYear → 不显示 '- N'", () => {
    const { container } = render(
      <EventCard
        event={makeEvent({ startYear: 627, endYear: 627 })}
        index={0}
      />,
    );
    const yearBox = container.querySelector(".event-year");
    expect(yearBox?.textContent?.trim()).toBe("627");
  });

  it("description substring(0,140) 截断 + 末尾固定追加 '...'", () => {
    const long = "辉煌".repeat(100); // 200 chars
    render(<EventCard event={makeEvent({ description: long })} index={0} />);
    // 期望被截到 140 字符,后面跟 '...'
    const expected = long.substring(0, 140) + "...";
    const p = document.querySelector(".event-content p");
    expect(p?.textContent).toBe(expected);
  });

  it("收藏按钮 toggle:点击在 '收藏' / '已收藏' 之间切换", () => {
    render(<EventCard event={makeEvent()} index={0} />);
    const btn = screen.getByText("收藏");
    fireEvent.click(btn);
    expect(screen.getByText("已收藏")).toBeInTheDocument();
    fireEvent.click(screen.getByText("已收藏"));
    expect(screen.getByText("收藏")).toBeInTheDocument();
  });

  it("点击分享:navigator.share 存在时调 share(data)", () => {
    const shareSpy = vi.fn();
    (navigator as unknown as { share: typeof shareSpy }).share = shareSpy;
    render(<EventCard event={makeEvent({ title: "黄巾起义" })} index={0} />);
    fireEvent.click(screen.getByText("分享"));
    expect(shareSpy).toHaveBeenCalledTimes(1);
    const payload = shareSpy.mock.calls[0]![0];
    expect(payload.title).toBe("黄巾起义");
  });

  it("点击分享:navigator.share 不存在时 fallback 到 clipboard.writeText", () => {
    delete (navigator as unknown as { share?: unknown }).share;
    const writeSpy = vi.fn();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeSpy },
      configurable: true,
    });

    render(<EventCard event={makeEvent({ title: "贞观之治" })} index={0} />);
    fireEvent.click(screen.getByText("分享"));
    expect(writeSpy).toHaveBeenCalledTimes(1);
    expect(writeSpy.mock.calls[0]![0]).toContain("贞观之治");
  });

  it("默认 details 未展开,详细字段在 DOM 中(details 内)但 summary 是 '详情'", () => {
    render(
      <EventCard
        event={makeEvent({
          startDate: "627-01-01",
          imageUrls: ["http://x/y.png"],
          categories: [["政治", "盛世"]],
        })}
        index={0}
      />,
    );
    expect(screen.getByText("详情")).toBeInTheDocument();
    // 内容仍在 DOM 中(details 折叠仅控制可见性,DOM 节点都在)
    expect(screen.getByText(/627-01-01/)).toBeInTheDocument();
    expect(screen.getByAltText("贞观之治")).toBeInTheDocument();
    expect(screen.getByText(/政治\/盛世/)).toBeInTheDocument();
  });
});
