/**
 * CategoryFilter 单元测试 (§2.8)
 *
 * 验证目标:
 *   - 渲染 "全部" + 6 个 VALID_CATEGORIES chip
 *   - 点击各 chip 触发 onCategoryChange(对应值或 null)
 *   - activeCategory 控制 aria-pressed
 *   - role="group" + aria-label="神话分类筛选"
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CategoryFilter } from "./CategoryFilter";
import { VALID_CATEGORIES } from "@/services/mythology";

describe("CategoryFilter", () => {
  it("渲染 '全部' + 6 个分类(VALID_CATEGORIES)", () => {
    render(
      <CategoryFilter activeCategory={null} onCategoryChange={() => {}} />,
    );
    const group = screen.getByRole("group", { name: "神话分类筛选" });
    expect(group).toBeInTheDocument();
    expect(screen.getByText("全部")).toBeInTheDocument();
    for (const cat of VALID_CATEGORIES) {
      expect(screen.getByText(cat)).toBeInTheDocument();
    }
  });

  it("activeCategory=null 时 '全部' aria-pressed=true,其它=false", () => {
    render(
      <CategoryFilter activeCategory={null} onCategoryChange={() => {}} />,
    );
    // chip 是 button role,可以按 name 找
    const all = screen.getByRole("button", { name: "全部" });
    expect(all).toHaveAttribute("aria-pressed", "true");
    for (const cat of VALID_CATEGORIES) {
      const chip = screen.getByRole("button", { name: cat });
      expect(chip).toHaveAttribute("aria-pressed", "false");
    }
  });

  it("activeCategory='英雄神话' 时,只有该分类 aria-pressed=true", () => {
    render(
      <CategoryFilter activeCategory="英雄神话" onCategoryChange={() => {}} />,
    );
    expect(screen.getByRole("button", { name: "全部" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: "英雄神话" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "创世神话" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("点击 '全部' 触发 onCategoryChange(null)", () => {
    const onChange = vi.fn();
    render(
      <CategoryFilter activeCategory="英雄神话" onCategoryChange={onChange} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "全部" }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("点击具体分类触发 onCategoryChange(category)", () => {
    const onChange = vi.fn();
    render(
      <CategoryFilter activeCategory={null} onCategoryChange={onChange} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "创世神话" }));
    expect(onChange).toHaveBeenCalledWith("创世神话");

    fireEvent.click(screen.getByRole("button", { name: "民间传说" }));
    expect(onChange).toHaveBeenLastCalledWith("民间传说");
  });
});
