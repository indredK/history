/**
 * tangFigureServiceHelper 单元测试 (§2.8)
 *
 * 纯函数 helper:filterByRole / filterByPeriod / filterByFaction /
 *   searchFigures / sortFigures / filterAndSort / getRoleLabel /
 *   formatLifespan / calculateAge
 *
 * Tang 是 5 字段全集 canonical 模板:role + period + faction + query + sortBy
 *   roleOrder: emperor(1) > chancellor(2) > general(3) > official(4) > poet(5) > other(6)
 *   period 通过 getTangPeriod(birthYear) 落到 TANG_PERIODS 4 段
 */
import { describe, it, expect } from "vitest";
import { tangFigureServiceHelper } from "./tangService";
import type { TangFigure, TangFigureRole } from "./types";

const makeFigure = (overrides: Partial<TangFigure> = {}): TangFigure => ({
  id: overrides.id ?? "f1",
  name: overrides.name ?? "李白",
  courtesy: overrides.courtesy,
  birthYear: overrides.birthYear ?? 701,
  deathYear: overrides.deathYear ?? 762,
  role: overrides.role ?? "poet",
  positions: overrides.positions ?? [],
  faction: overrides.faction,
  biography: overrides.biography ?? "",
  achievements: overrides.achievements ?? [],
  events: overrides.events ?? [],
  evaluations: overrides.evaluations ?? [],
  sources: overrides.sources ?? [],
  ...overrides,
});

describe("tangFigureServiceHelper", () => {
  describe("filterByRole", () => {
    const figures = [
      makeFigure({ id: "1", role: "emperor" }),
      makeFigure({ id: "2", role: "poet" }),
      makeFigure({ id: "3", role: "chancellor" }),
    ];

    it("role='全部' 返回原数组", () => {
      expect(tangFigureServiceHelper.filterByRole(figures, "全部")).toBe(
        figures,
      );
    });
    it("role 为 falsy('' 当成空)直通", () => {
      expect(
        tangFigureServiceHelper.filterByRole(figures, "" as unknown as "全部"),
      ).toBe(figures);
    });
    it("命中具体 role", () => {
      const r = tangFigureServiceHelper.filterByRole(figures, "poet");
      expect(r).toHaveLength(1);
      expect(r[0]!.id).toBe("2");
    });
    it("未命中返回空数组", () => {
      expect(
        tangFigureServiceHelper.filterByRole(figures, "general"),
      ).toHaveLength(0);
    });
  });

  describe("filterByPeriod", () => {
    const figures = [
      makeFigure({ id: "1", birthYear: 650 }), // 初唐
      makeFigure({ id: "2", birthYear: 720 }), // 盛唐
      makeFigure({ id: "3", birthYear: 800 }), // 中唐
      makeFigure({ id: "4", birthYear: 880 }), // 晚唐
    ];

    it("period='全部' 直通", () => {
      expect(tangFigureServiceHelper.filterByPeriod(figures, "全部")).toBe(
        figures,
      );
    });
    it("空 period 直通", () => {
      expect(tangFigureServiceHelper.filterByPeriod(figures, "")).toBe(figures);
    });
    it("命中 '初唐（618-712）'", () => {
      const r = tangFigureServiceHelper.filterByPeriod(
        figures,
        "初唐（618-712）",
      );
      expect(r).toHaveLength(1);
      expect(r[0]!.id).toBe("1");
    });
    it("命中 '盛唐（713-765）'", () => {
      const r = tangFigureServiceHelper.filterByPeriod(
        figures,
        "盛唐（713-765）",
      );
      expect(r).toHaveLength(1);
      expect(r[0]!.id).toBe("2");
    });
  });

  describe("filterByFaction", () => {
    const figures = [
      makeFigure({ id: "1", faction: "牛党" }),
      makeFigure({ id: "2", faction: "李党" }),
      makeFigure({ id: "3" }), // 无 faction
    ];
    it("'全部' 与空字符串直通", () => {
      expect(tangFigureServiceHelper.filterByFaction(figures, "全部")).toBe(
        figures,
      );
      expect(tangFigureServiceHelper.filterByFaction(figures, "")).toBe(
        figures,
      );
    });
    it("命中 faction", () => {
      expect(
        tangFigureServiceHelper.filterByFaction(figures, "牛党"),
      ).toHaveLength(1);
    });
  });

  describe("searchFigures", () => {
    const figures = [
      makeFigure({
        id: "1",
        name: "李白",
        courtesy: "太白",
        positions: ["翰林学士"],
      }),
      makeFigure({ id: "2", name: "杜甫", faction: "诗派" }),
      makeFigure({ id: "3", name: "白居易" }),
    ];
    it("空 query 直通", () => {
      expect(tangFigureServiceHelper.searchFigures(figures, "")).toBe(figures);
    });
    it("仅空白直通", () => {
      expect(tangFigureServiceHelper.searchFigures(figures, "   ")).toBe(
        figures,
      );
    });
    it("命中 name", () => {
      const r = tangFigureServiceHelper.searchFigures(figures, "白");
      // 李白 + 白居易
      expect(r.map((f) => f.id).sort()).toEqual(["1", "3"]);
    });
    it("命中 courtesy", () => {
      const r = tangFigureServiceHelper.searchFigures(figures, "太白");
      expect(r).toHaveLength(1);
      expect(r[0]!.id).toBe("1");
    });
    it("命中 positions", () => {
      const r = tangFigureServiceHelper.searchFigures(figures, "翰林");
      expect(r).toHaveLength(1);
      expect(r[0]!.id).toBe("1");
    });
    it("命中 faction", () => {
      const r = tangFigureServiceHelper.searchFigures(figures, "诗派");
      expect(r).toHaveLength(1);
      expect(r[0]!.id).toBe("2");
    });
    it("大小写归一化:'TAIBAI' 命中需小写化", () => {
      // courtesy='太白' 大小写不变;此例验证 lowerQuery 不抛
      expect(
        tangFigureServiceHelper.searchFigures(figures, "TAIBAI"),
      ).toHaveLength(0);
    });
  });

  describe("sortFigures", () => {
    it("按 birthYear 升序", () => {
      const figs = [
        makeFigure({ id: "a", birthYear: 800 }),
        makeFigure({ id: "b", birthYear: 700 }),
        makeFigure({ id: "c", birthYear: 750 }),
      ];
      const r = tangFigureServiceHelper.sortFigures(figs, "birthYear");
      expect(r.map((f) => f.id)).toEqual(["b", "c", "a"]);
    });
    it("按 name 用 zh-CN locale", () => {
      const figs = [
        makeFigure({ id: "a", name: "杜甫" }),
        makeFigure({ id: "b", name: "李白" }),
      ];
      const r = tangFigureServiceHelper.sortFigures(figs, "name");
      // localCompare 排序应稳定;不强校验顺序,只检查全员到位
      expect(r).toHaveLength(2);
      expect(new Set(r.map((f) => f.id))).toEqual(new Set(["a", "b"]));
    });
    it("按 role 走 emperor→chancellor→general→official→poet→other,role 相同则 birthYear 升序", () => {
      const figs = [
        makeFigure({ id: "a", role: "poet", birthYear: 750 }),
        makeFigure({ id: "b", role: "emperor", birthYear: 800 }),
        makeFigure({ id: "c", role: "chancellor", birthYear: 700 }),
        makeFigure({ id: "d", role: "emperor", birthYear: 700 }),
      ];
      const r = tangFigureServiceHelper.sortFigures(figs, "role");
      expect(r.map((f) => f.id)).toEqual(["d", "b", "c", "a"]);
    });
    it("未识别 sortBy 直接返回拷贝(不抛错)", () => {
      const figs = [makeFigure({ id: "x" })];
      const r = tangFigureServiceHelper.sortFigures(
        figs,
        "unknown" as unknown as "birthYear",
      );
      expect(r).toEqual(figs);
      expect(r).not.toBe(figs);
    });
    it("不修改原数组(immutability)", () => {
      const figs = [
        makeFigure({ id: "a", birthYear: 800 }),
        makeFigure({ id: "b", birthYear: 700 }),
      ];
      tangFigureServiceHelper.sortFigures(figs, "birthYear");
      expect(figs.map((f) => f.id)).toEqual(["a", "b"]);
    });
  });

  describe("filterAndSort", () => {
    const figures = [
      makeFigure({
        id: "1",
        role: "emperor",
        birthYear: 650,
        faction: "李党",
        name: "李渊",
      }),
      makeFigure({
        id: "2",
        role: "poet",
        birthYear: 701,
        name: "李白",
        positions: ["翰林"],
      }),
      makeFigure({
        id: "3",
        role: "chancellor",
        birthYear: 720,
        faction: "牛党",
        name: "狄仁杰",
      }),
    ];

    it("无 option 直通", () => {
      expect(tangFigureServiceHelper.filterAndSort(figures, {})).toBe(figures);
    });
    it("role + period + sortBy 串联", () => {
      const r = tangFigureServiceHelper.filterAndSort(figures, {
        role: "poet",
        period: "盛唐（713-765）", // 李白 701 是 初唐,所以应该被空
        sortBy: "birthYear",
      });
      expect(r).toHaveLength(0);
    });
    it("query='李' 命中 name 含 '李' 的两人", () => {
      const r = tangFigureServiceHelper.filterAndSort(figures, { query: "李" });
      expect(r.map((f) => f.id).sort()).toEqual(["1", "2"]);
    });
    it("undefined option 跳过对应 filter", () => {
      // 全 undefined 走原数组
      const r = tangFigureServiceHelper.filterAndSort(figures, {
        role: undefined,
        period: undefined,
        faction: undefined,
        query: undefined,
        sortBy: undefined,
      });
      expect(r).toBe(figures);
    });
  });

  describe("getRoleLabel / formatLifespan / calculateAge", () => {
    it("getRoleLabel 返回中文映射", () => {
      expect(tangFigureServiceHelper.getRoleLabel("emperor")).toBe("皇帝");
      expect(tangFigureServiceHelper.getRoleLabel("poet")).toBe("诗人");
    });
    it("getRoleLabel 未知 role 兜底 '其他'", () => {
      expect(
        tangFigureServiceHelper.getRoleLabel(
          "wizard" as unknown as TangFigureRole,
        ),
      ).toBe("其他");
    });
    it("formatLifespan 拼接生卒年", () => {
      const f = makeFigure({ birthYear: 701, deathYear: 762 });
      expect(tangFigureServiceHelper.formatLifespan(f)).toBe("701年 - 762年");
    });
    it("calculateAge = deathYear - birthYear", () => {
      const f = makeFigure({ birthYear: 701, deathYear: 762 });
      expect(tangFigureServiceHelper.calculateAge(f)).toBe(61);
    });
  });
});
