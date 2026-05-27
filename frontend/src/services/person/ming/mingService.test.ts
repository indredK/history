/**
 * mingFigureServiceHelper 单元测试 (§2.8)
 *
 * 与 Tang canonical 模板同构,差异维度:
 *   - roleOrder:emperor(1) > cabinet(2) > general(3) > official(4) > eunuch(5) > other(6)
 *     (Ming 第 2 档 cabinet 不是 chancellor,第 5 档 eunuch 不是 poet/scholar)
 *   - period 走 MING_PERIODS 3 段:明初(1368-1435)、明中期(1436-1572)、明末(1573-1644)
 *   - roleLabel:cabinet='内阁大臣',eunuch='宦官'
 */
import { describe, it, expect } from "vitest";
import { mingFigureServiceHelper } from "./mingService";
import type { MingFigure, MingFigureRole } from "./types";

const makeFigure = (overrides: Partial<MingFigure> = {}): MingFigure => ({
  id: overrides.id ?? "f1",
  name: overrides.name ?? "张居正",
  courtesy: overrides.courtesy ?? "字",
  birthYear: overrides.birthYear ?? 1525,
  deathYear: overrides.deathYear ?? 1582,
  role: overrides.role ?? "cabinet",
  positions: overrides.positions ?? [],
  faction: overrides.faction ?? "",
  biography: overrides.biography ?? "",
  achievements: overrides.achievements ?? [],
  events: overrides.events ?? [],
  evaluations: overrides.evaluations ?? [],
  sources: overrides.sources ?? [],
  ...overrides,
});

describe("mingFigureServiceHelper", () => {
  it("filterByRole '全部' / 命中 / 未命中", () => {
    const figs = [
      makeFigure({ id: "1", role: "emperor" }),
      makeFigure({ id: "2", role: "cabinet" }),
      makeFigure({ id: "3", role: "eunuch" }),
    ];
    expect(mingFigureServiceHelper.filterByRole(figs, "全部")).toBe(figs);
    expect(mingFigureServiceHelper.filterByRole(figs, "cabinet")).toHaveLength(
      1,
    );
    expect(mingFigureServiceHelper.filterByRole(figs, "eunuch")).toHaveLength(
      1,
    );
  });

  it("filterByPeriod 命中 '明初' '明中期' '明末'", () => {
    const figs = [
      makeFigure({ id: "1", birthYear: 1400 }), // 明初
      makeFigure({ id: "2", birthYear: 1500 }), // 明中期
      makeFigure({ id: "3", birthYear: 1600 }), // 明末
    ];
    expect(mingFigureServiceHelper.filterByPeriod(figs, "全部")).toBe(figs);
    expect(
      mingFigureServiceHelper.filterByPeriod(figs, "明初（1368-1435）"),
    ).toHaveLength(1);
    expect(
      mingFigureServiceHelper.filterByPeriod(figs, "明中期（1436-1572）"),
    ).toHaveLength(1);
    expect(
      mingFigureServiceHelper.filterByPeriod(figs, "明末（1573-1644）"),
    ).toHaveLength(1);
  });

  it("filterByFaction '全部' / 命中", () => {
    const figs = [
      makeFigure({ id: "1", faction: "东林党" }),
      makeFigure({ id: "2", faction: "阉党" }),
    ];
    expect(mingFigureServiceHelper.filterByFaction(figs, "全部")).toBe(figs);
    expect(
      mingFigureServiceHelper.filterByFaction(figs, "东林党"),
    ).toHaveLength(1);
  });

  it("searchFigures 命中 name / courtesy / positions / faction / 空 query 直通", () => {
    const figs = [
      makeFigure({
        id: "1",
        name: "张居正",
        courtesy: "叔大",
        positions: ["内阁首辅"],
        faction: "改革派",
      }),
      makeFigure({ id: "2", name: "海瑞" }),
    ];
    expect(mingFigureServiceHelper.searchFigures(figs, "")).toBe(figs);
    expect(mingFigureServiceHelper.searchFigures(figs, "   ")).toBe(figs);
    expect(mingFigureServiceHelper.searchFigures(figs, "张")).toHaveLength(1);
    expect(mingFigureServiceHelper.searchFigures(figs, "叔大")).toHaveLength(1);
    expect(mingFigureServiceHelper.searchFigures(figs, "内阁")).toHaveLength(1);
    expect(mingFigureServiceHelper.searchFigures(figs, "改革")).toHaveLength(1);
  });

  it("sortFigures role 走 emperor→cabinet→general→official→eunuch→other,role 同则 birthYear 升序", () => {
    const figs = [
      makeFigure({ id: "a", role: "other", birthYear: 1400 }),
      makeFigure({ id: "b", role: "eunuch", birthYear: 1600 }),
      makeFigure({ id: "c", role: "cabinet", birthYear: 1525 }),
      makeFigure({ id: "d", role: "cabinet", birthYear: 1400 }),
      makeFigure({ id: "e", role: "emperor", birthYear: 1500 }),
    ];
    const r = mingFigureServiceHelper.sortFigures(figs, "role");
    expect(r.map((f) => f.id)).toEqual(["e", "d", "c", "b", "a"]);
  });

  it("sortFigures 默认 case 走拷贝", () => {
    const figs = [makeFigure({ id: "x" })];
    const r = mingFigureServiceHelper.sortFigures(
      figs,
      "zzz" as unknown as "birthYear",
    );
    expect(r).toEqual(figs);
    expect(r).not.toBe(figs);
  });

  it("filterAndSort 串联,undefined 自动跳过对应 filter", () => {
    const figs = [
      makeFigure({ id: "1", role: "emperor", birthYear: 1400 }),
      makeFigure({ id: "2", role: "cabinet", birthYear: 1525 }),
    ];
    const r = mingFigureServiceHelper.filterAndSort(figs, {
      role: "cabinet",
      sortBy: "birthYear",
    });
    expect(r).toHaveLength(1);
    expect(r[0]!.id).toBe("2");
    // 全 undefined 直通(filterAndSort 返回 result,实际 result=figures)
    const r2 = mingFigureServiceHelper.filterAndSort(figs, {});
    expect(r2).toBe(figs);
  });

  it("getRoleLabel:cabinet='内阁大臣',eunuch='宦官',未知兜底'其他'", () => {
    expect(mingFigureServiceHelper.getRoleLabel("cabinet")).toBe("内阁大臣");
    expect(mingFigureServiceHelper.getRoleLabel("eunuch")).toBe("宦官");
    expect(
      mingFigureServiceHelper.getRoleLabel("xx" as unknown as MingFigureRole),
    ).toBe("其他");
  });

  it("formatLifespan / calculateAge", () => {
    const f = makeFigure({ birthYear: 1525, deathYear: 1582 });
    expect(mingFigureServiceHelper.formatLifespan(f)).toBe("1525年 - 1582年");
    expect(mingFigureServiceHelper.calculateAge(f)).toBe(57);
  });
});
