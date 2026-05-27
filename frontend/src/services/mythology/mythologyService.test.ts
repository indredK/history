/**
 * mythologyService 单元测试 (§2.8)
 *
 * mythologyService 与人物 helper 不同,是少量纯函数:
 *   - validateMythology(mythology)→ {valid, errors}:5 个必填字段
 *   - filterByCategory(mythologies, category)→ category eq 命中
 *   - getMythologies()→ dynamic import './mythologyApi' 然后透传 .getMythologies()
 */
import { describe, it, expect, vi } from "vitest";
import { validateMythology, filterByCategory } from "./mythologyService";
import type { Mythology } from "./types";

const makeMythology = (overrides: Partial<Mythology> = {}): Mythology => ({
  id: overrides.id ?? "m1",
  title: overrides.title ?? "盘古开天",
  category: overrides.category ?? ("creation" as Mythology["category"]),
  description: overrides.description ?? "盘古劈开混沌创造天地",
  characters: overrides.characters ?? ["盘古"],
  ...overrides,
});

describe("mythologyService", () => {
  describe("validateMythology", () => {
    it("全字段齐全 → {valid:true, errors:[]}", () => {
      const r = validateMythology(makeMythology());
      expect(r.valid).toBe(true);
      expect(r.errors).toEqual([]);
    });
    it("缺 id → 报错", () => {
      const r = validateMythology({ ...makeMythology(), id: "" });
      expect(r.valid).toBe(false);
      expect(r.errors).toContain("缺少ID");
    });
    it("缺 title", () => {
      const r = validateMythology({ ...makeMythology(), title: "" });
      expect(r.errors).toContain("缺少标题");
    });
    it("缺 category", () => {
      const r = validateMythology({
        ...makeMythology(),
        category: "" as Mythology["category"],
      });
      expect(r.errors).toContain("缺少分类");
    });
    it("缺 description", () => {
      const r = validateMythology({ ...makeMythology(), description: "" });
      expect(r.errors).toContain("缺少描述");
    });
    it("characters 空数组 → '缺少人物'", () => {
      const r = validateMythology({ ...makeMythology(), characters: [] });
      expect(r.errors).toContain("缺少人物");
    });
    it("characters 未传(undefined)→ '缺少人物'", () => {
      const r = validateMythology({
        ...makeMythology(),
        characters: undefined as unknown as string[],
      });
      expect(r.errors).toContain("缺少人物");
    });
    it("多个错误一起累计", () => {
      const r = validateMythology({
        id: "",
        title: "",
        category: "" as Mythology["category"],
        description: "",
        characters: [],
      } as Mythology);
      expect(r.valid).toBe(false);
      expect(r.errors).toEqual([
        "缺少ID",
        "缺少标题",
        "缺少分类",
        "缺少描述",
        "缺少人物",
      ]);
    });
  });

  describe("filterByCategory", () => {
    const ms = [
      makeMythology({ id: "1", category: "creation" as Mythology["category"] }),
      makeMythology({ id: "2", category: "deities" as Mythology["category"] }),
      makeMythology({ id: "3", category: "creation" as Mythology["category"] }),
    ];
    it("命中 category", () => {
      const r = filterByCategory(ms, "creation");
      expect(r.map((m) => m.id)).toEqual(["1", "3"]);
    });
    it("未命中返回空数组", () => {
      expect(filterByCategory(ms, "unknown")).toEqual([]);
    });
    it("空 mythologies", () => {
      expect(filterByCategory([], "creation")).toEqual([]);
    });
  });

  describe("getMythologies", () => {
    it("调用 mythologyApi.getMythologies 并透传返回值", async () => {
      // vi.mock 动态 import 路径需在 await import 之前完成 hoist
      vi.doMock("./mythologyApi", () => ({
        mythologyApi: {
          getMythologies: vi
            .fn()
            .mockResolvedValue({ data: [makeMythology({ id: "x" })] }),
        },
      }));
      // 重新 import 已经被 doMock 拦截
      vi.resetModules();
      const mod = await import("./mythologyService");
      const r = await mod.getMythologies();
      expect(r).toEqual({ data: [expect.objectContaining({ id: "x" })] });
      vi.doUnmock("./mythologyApi");
    });
  });
});
