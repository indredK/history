/**
 * sanguoFigureServiceHelper 单元测试 (§2.8)
 *
 * 三国与其它朝代的差异维度:
 *   - 没有 period/faction 字段,改为 kingdom(魏/蜀/吴/其他)
 *   - sortFigures 多一档 'kingdom':kingdomOrder 魏(1) > 蜀(2) > 吴(3) > 其他(4)
 */
import { describe, it, expect } from "vitest";
import { sanguoFigureServiceHelper } from "./sanguoService";
import type { SanguoFigure, SanguoFigureRole } from "./types";

const makeFigure = (overrides: Partial<SanguoFigure> = {}): SanguoFigure => ({
  id: overrides.id ?? "f1",
  name: overrides.name ?? "诸葛亮",
  courtesy: overrides.courtesy,
  birthYear: overrides.birthYear ?? 181,
  deathYear: overrides.deathYear ?? 234,
  role: overrides.role ?? "strategist",
  kingdom: overrides.kingdom ?? "蜀",
  positions: overrides.positions ?? [],
  faction: overrides.faction,
  biography: overrides.biography ?? "",
  achievements: overrides.achievements ?? [],
  events: overrides.events ?? [],
  evaluations: overrides.evaluations ?? [],
  sources: overrides.sources ?? [],
  ...overrides,
});

describe("sanguoFigureServiceHelper", () => {
  describe("filterByRole", () => {
    const figs = [
      makeFigure({ id: "1", role: "ruler" }),
      makeFigure({ id: "2", role: "strategist" }),
      makeFigure({ id: "3", role: "general" }),
    ];
    it("'全部' 直通", () => {
      expect(sanguoFigureServiceHelper.filterByRole(figs, "全部")).toBe(figs);
    });
    it("命中 role", () => {
      expect(
        sanguoFigureServiceHelper.filterByRole(figs, "strategist"),
      ).toHaveLength(1);
    });
  });

  describe("filterByKingdom", () => {
    const figs = [
      makeFigure({ id: "1", kingdom: "魏" }),
      makeFigure({ id: "2", kingdom: "蜀" }),
      makeFigure({ id: "3", kingdom: "吴" }),
    ];
    it("'全部' 直通", () => {
      expect(sanguoFigureServiceHelper.filterByKingdom(figs, "全部")).toBe(
        figs,
      );
    });
    it("命中 kingdom='魏'", () => {
      const r = sanguoFigureServiceHelper.filterByKingdom(figs, "魏");
      expect(r).toHaveLength(1);
      expect(r[0]!.id).toBe("1");
    });
  });

  describe("searchFigures", () => {
    const figs = [
      makeFigure({
        id: "1",
        name: "诸葛亮",
        courtesy: "孔明",
        positions: ["军师"],
        kingdom: "蜀",
      }),
      makeFigure({ id: "2", name: "曹操", kingdom: "魏" }),
    ];
    it("空 query 直通", () => {
      expect(sanguoFigureServiceHelper.searchFigures(figs, "")).toBe(figs);
    });
    it("命中 name 中文", () => {
      const r = sanguoFigureServiceHelper.searchFigures(figs, "曹");
      expect(r).toHaveLength(1);
      expect(r[0]!.id).toBe("2");
    });
    it("命中 courtesy", () => {
      const r = sanguoFigureServiceHelper.searchFigures(figs, "孔明");
      expect(r).toHaveLength(1);
      expect(r[0]!.id).toBe("1");
    });
    it("命中 positions", () => {
      const r = sanguoFigureServiceHelper.searchFigures(figs, "军师");
      expect(r).toHaveLength(1);
      expect(r[0]!.id).toBe("1");
    });
    it("命中 kingdom", () => {
      // search 走 kingdom.includes,中文不区分大小写问题
      const r = sanguoFigureServiceHelper.searchFigures(figs, "魏");
      expect(r).toHaveLength(1);
      expect(r[0]!.id).toBe("2");
    });
  });

  describe("sortFigures", () => {
    it("按 birthYear 升序", () => {
      const figs = [
        makeFigure({ id: "a", birthYear: 200 }),
        makeFigure({ id: "b", birthYear: 150 }),
      ];
      const r = sanguoFigureServiceHelper.sortFigures(figs, "birthYear");
      expect(r.map((f) => f.id)).toEqual(["b", "a"]);
    });
    it("按 role 走 ruler→strategist→general→official→other,role 同则 birthYear 升序", () => {
      const figs = [
        makeFigure({ id: "a", role: "other", birthYear: 200 }),
        makeFigure({ id: "b", role: "ruler", birthYear: 220 }),
        makeFigure({ id: "c", role: "ruler", birthYear: 150 }),
      ];
      const r = sanguoFigureServiceHelper.sortFigures(figs, "role");
      expect(r.map((f) => f.id)).toEqual(["c", "b", "a"]);
    });
    it("按 kingdom 走 魏→蜀→吴→其他,同 kingdom 则 birthYear 升序", () => {
      const figs = [
        makeFigure({ id: "a", kingdom: "其他", birthYear: 200 }),
        makeFigure({ id: "b", kingdom: "魏", birthYear: 220 }),
        makeFigure({ id: "c", kingdom: "吴", birthYear: 150 }),
        makeFigure({ id: "d", kingdom: "魏", birthYear: 180 }),
      ];
      const r = sanguoFigureServiceHelper.sortFigures(figs, "kingdom");
      expect(r.map((f) => f.id)).toEqual(["d", "b", "c", "a"]);
    });
    it("未识别 sortBy 直接返回拷贝", () => {
      const figs = [makeFigure({ id: "x" })];
      const r = sanguoFigureServiceHelper.sortFigures(
        figs,
        "unknown" as unknown as "birthYear",
      );
      expect(r).toEqual(figs);
      expect(r).not.toBe(figs);
    });
  });

  describe("filterAndSort", () => {
    const figs = [
      makeFigure({ id: "1", role: "ruler", kingdom: "魏", birthYear: 155 }),
      makeFigure({
        id: "2",
        role: "strategist",
        kingdom: "蜀",
        birthYear: 181,
      }),
      makeFigure({ id: "3", role: "general", kingdom: "吴", birthYear: 178 }),
    ];
    it("空 option 直通", () => {
      expect(sanguoFigureServiceHelper.filterAndSort(figs, {})).toBe(figs);
    });
    it("role + kingdom 串联", () => {
      const r = sanguoFigureServiceHelper.filterAndSort(figs, {
        role: "ruler",
        kingdom: "魏",
      });
      expect(r.map((f) => f.id)).toEqual(["1"]);
    });
    it("sortBy='kingdom' 排序", () => {
      const r = sanguoFigureServiceHelper.filterAndSort(figs, {
        sortBy: "kingdom",
      });
      // 魏 > 蜀 > 吴
      expect(r.map((f) => f.id)).toEqual(["1", "2", "3"]);
    });
  });

  describe("getRoleLabel / formatLifespan / calculateAge", () => {
    it("getRoleLabel 已知 role", () => {
      expect(sanguoFigureServiceHelper.getRoleLabel("ruler")).toBe("君主");
      expect(sanguoFigureServiceHelper.getRoleLabel("strategist")).toBe("谋士");
    });
    it("getRoleLabel 未知 role 兜底 '其他'", () => {
      expect(
        sanguoFigureServiceHelper.getRoleLabel(
          "xyz" as unknown as SanguoFigureRole,
        ),
      ).toBe("其他");
    });
    it("formatLifespan / calculateAge", () => {
      const f = makeFigure({ birthYear: 181, deathYear: 234 });
      expect(sanguoFigureServiceHelper.formatLifespan(f)).toBe("181年 - 234年");
      expect(sanguoFigureServiceHelper.calculateAge(f)).toBe(53);
    });
  });
});
