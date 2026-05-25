/**
 * MythologyCard 单元测试 (§2.8)
 *
 * 极薄包装,内部委托到 ContentCard。需验证:
 *   - title / category(primaryTag)/ description 显示
 *   - footerTags 来自 characters,数量超过 footerTagsMax=3 时显示 "+N"
 *   - characters undefined 不报错(走 `?.map`)
 *   - 未知 category 不在 colorMap 时仍能渲染(fallback defaultColor)
 *   - 点击 / Enter / Space 都触发 onClick(mythology)
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MythologyCard } from "./MythologyCard";
import type { Mythology } from "@/services/mythology";

const makeMyth = (overrides: Partial<Mythology> = {}): Mythology => ({
  id: overrides.id ?? "m1",
  title: overrides.title ?? "盘古开天",
  category: overrides.category ?? "创世神话",
  description: overrides.description ?? "盘古劈开混沌创造天地",
  characters: overrides.characters ?? ["盘古"],
  ...overrides,
});

describe("MythologyCard", () => {
  it("渲染 title / category 主标签 / description", () => {
    const m = makeMyth();
    render(<MythologyCard mythology={m} onClick={() => {}} />);
    // ContentCard 用 role="article" + aria-label=title
    expect(
      screen.getByRole("article", { name: "盘古开天" }),
    ).toBeInTheDocument();
    expect(screen.getByText("盘古开天")).toBeInTheDocument();
    expect(screen.getByText("创世神话")).toBeInTheDocument();
    expect(screen.getByText("盘古劈开混沌创造天地")).toBeInTheDocument();
  });

  it("characters 渲染 footer tags(≤3)", () => {
    const m = makeMyth({ characters: ["盘古", "女娲", "伏羲"] });
    render(<MythologyCard mythology={m} onClick={() => {}} />);
    expect(screen.getByText("盘古")).toBeInTheDocument();
    expect(screen.getByText("女娲")).toBeInTheDocument();
    expect(screen.getByText("伏羲")).toBeInTheDocument();
    // 未超过阈值 → 没有 +N 溢出 chip
    expect(screen.queryByText(/^\+\d/)).not.toBeInTheDocument();
  });

  it("characters > 3 时只显示前 3 个 + '+N' 溢出 chip", () => {
    const m = makeMyth({
      characters: ["盘古", "女娲", "伏羲", "黄帝", "炎帝"],
    });
    render(<MythologyCard mythology={m} onClick={() => {}} />);
    expect(screen.getByText("盘古")).toBeInTheDocument();
    expect(screen.getByText("女娲")).toBeInTheDocument();
    expect(screen.getByText("伏羲")).toBeInTheDocument();
    expect(screen.queryByText("黄帝")).not.toBeInTheDocument();
    expect(screen.queryByText("炎帝")).not.toBeInTheDocument();
    expect(screen.getByText("+2")).toBeInTheDocument();
  });

  it("characters undefined 时不抛错", () => {
    const m = makeMyth({
      characters: undefined as unknown as string[],
    });
    expect(() =>
      render(<MythologyCard mythology={m} onClick={() => {}} />),
    ).not.toThrow();
    expect(screen.getByText("盘古开天")).toBeInTheDocument();
  });

  it("未知 category 仍能渲染(fallback defaultColor)", () => {
    const m = makeMyth({ category: "未知分类" as Mythology["category"] });
    render(<MythologyCard mythology={m} onClick={() => {}} />);
    // category chip 内容仍然显示
    expect(screen.getByText("未知分类")).toBeInTheDocument();
  });

  it("点击卡片触发 onClick(mythology)", () => {
    const m = makeMyth();
    const onClick = vi.fn();
    render(<MythologyCard mythology={m} onClick={onClick} />);
    fireEvent.click(screen.getByRole("article", { name: "盘古开天" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(m);
  });

  it("Enter / Space 也触发 onClick(继承自 ContentCard 键盘可达)", () => {
    const m = makeMyth();
    const onClick = vi.fn();
    render(<MythologyCard mythology={m} onClick={onClick} />);
    const card = screen.getByRole("article", { name: "盘古开天" });

    fireEvent.keyDown(card, { key: "Enter" });
    expect(onClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(card, { key: " " });
    expect(onClick).toHaveBeenCalledTimes(2);

    // 其它键不触发
    fireEvent.keyDown(card, { key: "a" });
    expect(onClick).toHaveBeenCalledTimes(2);
  });
});
