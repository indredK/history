/**
 * mythologyStore 单元测试 (§2.8)
 *
 * 覆盖目标:
 * - 初始 state:mythologies=[] / selectedMythology=null / activeCategory=null /
 *              loading=false / error=null
 * - 全部 setters:setMythologies / setSelectedMythology / setActiveCategory /
 *                setLoading / setError(error 是 string|null)
 * - getFilteredMythologies:activeCategory=null 时直接返回原数组(无筛选短路),
 *                          有 category 时调用 filterByCategory(mythologies, category)
 *
 * 用 vi.mock 把 filterByCategory 桩成可观测的实现,
 * 验证调用参数 + 返回值原样透传。
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Mythology, MythologyCategory } from "@/services/mythology";

// 必须在 import store 之前 mock,store 在模块顶层引用 filterByCategory
vi.mock("@/services/mythology", async () => {
  const actual = await vi.importActual<typeof import("@/services/mythology")>(
    "@/services/mythology",
  );
  return {
    ...actual,
    filterByCategory: vi.fn((mythologies: Mythology[], category: string) =>
      mythologies.filter((m) => m.category === category),
    ),
  };
});

import { filterByCategory } from "@/services/mythology";
import { useMythologyStore } from "./mythologyStore";

function makeMyth(overrides: Partial<Mythology> = {}): Mythology {
  return {
    id: overrides.id ?? "m-1",
    title: overrides.title ?? "盘古开天",
    category: overrides.category ?? "创世神话",
    description: overrides.description ?? "故事",
    characters: overrides.characters ?? ["盘古"],
    ...overrides,
  };
}

describe("mythologyStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMythologyStore.setState({
      mythologies: [],
      selectedMythology: null,
      activeCategory: null,
      loading: false,
      error: null,
    });
  });

  describe("初始 state", () => {
    it("默认值齐全", () => {
      const s = useMythologyStore.getState();
      expect(s.mythologies).toEqual([]);
      expect(s.selectedMythology).toBeNull();
      expect(s.activeCategory).toBeNull();
      expect(s.loading).toBe(false);
      expect(s.error).toBeNull();
    });
  });

  describe("setters", () => {
    it("setMythologies 写入数组", () => {
      const list = [makeMyth({ id: "1" }), makeMyth({ id: "2" })];
      useMythologyStore.getState().setMythologies(list);
      expect(useMythologyStore.getState().mythologies).toBe(list);
    });

    it("setSelectedMythology 写入 / null 清空", () => {
      const m = makeMyth();
      useMythologyStore.getState().setSelectedMythology(m);
      expect(useMythologyStore.getState().selectedMythology).toBe(m);

      useMythologyStore.getState().setSelectedMythology(null);
      expect(useMythologyStore.getState().selectedMythology).toBeNull();
    });

    it("setActiveCategory 写入分类 / null 清空", () => {
      useMythologyStore.getState().setActiveCategory("创世神话");
      expect(useMythologyStore.getState().activeCategory).toBe("创世神话");

      useMythologyStore.getState().setActiveCategory(null);
      expect(useMythologyStore.getState().activeCategory).toBeNull();
    });

    it("setLoading 写入 boolean", () => {
      useMythologyStore.getState().setLoading(true);
      expect(useMythologyStore.getState().loading).toBe(true);
      useMythologyStore.getState().setLoading(false);
      expect(useMythologyStore.getState().loading).toBe(false);
    });

    it("setError 写入 string / null", () => {
      useMythologyStore.getState().setError("加载失败");
      expect(useMythologyStore.getState().error).toBe("加载失败");

      useMythologyStore.getState().setError(null);
      expect(useMythologyStore.getState().error).toBeNull();
    });
  });

  describe("getFilteredMythologies", () => {
    it("activeCategory=null 时短路返回 mythologies 原数组,不调 filterByCategory", () => {
      const list = [makeMyth({ id: "1" }), makeMyth({ id: "2" })];
      useMythologyStore.setState({ mythologies: list, activeCategory: null });

      const r = useMythologyStore.getState().getFilteredMythologies();
      expect(r).toBe(list);
      expect(filterByCategory).not.toHaveBeenCalled();
    });

    it("有 activeCategory → 走 filterByCategory(mythologies, category)", () => {
      const list = [
        makeMyth({ id: "1", category: "创世神话" }),
        makeMyth({ id: "2", category: "英雄神话" }),
      ];
      useMythologyStore.setState({
        mythologies: list,
        activeCategory: "创世神话" as MythologyCategory,
      });

      const r = useMythologyStore.getState().getFilteredMythologies();

      expect(filterByCategory).toHaveBeenCalledTimes(1);
      expect(filterByCategory).toHaveBeenCalledWith(list, "创世神话");
      expect(r).toHaveLength(1);
      expect(r[0]!.id).toBe("1");
    });

    it("有 activeCategory 但无命中 → 返回空数组", () => {
      const list = [makeMyth({ id: "1", category: "创世神话" })];
      useMythologyStore.setState({
        mythologies: list,
        activeCategory: "民间传说" as MythologyCategory,
      });

      const r = useMythologyStore.getState().getFilteredMythologies();
      expect(r).toEqual([]);
      expect(filterByCategory).toHaveBeenCalledWith(list, "民间传说");
    });
  });
});
