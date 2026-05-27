/**
 * yuanFigureServiceHelper 单元测试 (§2.8)
 *
 * 与 Song 完全同构 canonical 模板,差异维度:
 *   - period 走 YUAN_PERIODS 3 段(元初/元中期/元末)
 *   - roleOrder 与 Song 一致:emperor(1) > chancellor(2) > general(3) > official(4) > scholar(5) > other(6)
 *   - roleLabel:emperor='皇帝/大汗',chancellor='丞相'(其它朝代是宰相)
 */
import { describe, it, expect } from "vitest";
import { yuanFigureServiceHelper } from "./yuanService";
import type { YuanFigure, YuanFigureRole } from "./types";

const makeFigure = (overrides: Partial<YuanFigure> = {}): YuanFigure => ({
  id: overrides.id ?? "f1",
  name: overrides.name ?? "忽必烈",
  courtesy: overrides.courtesy ?? "字",
  birthYear: overrides.birthYear ?? 1215,
  deathYear: overrides.deathYear ?? 1294,
  role: overrides.role ?? "emperor",
  positions: overrides.positions ?? [],
  faction: overrides.faction ?? "",
  biography: overrides.biography ?? "",
  achievements: overrides.achievements ?? [],
  events: overrides.events ?? [],
  evaluations: overrides.evaluations ?? [],
  sources: overrides.sources ?? [],
  ...overrides,
});

describe("yuanFigureServiceHelper", () => {
  it("filterByRole: '全部' 直通 / 命中 / 未命中", () => {
    const figs = [
      makeFigure({ id: "1", role: "emperor" }),
      makeFigure({ id: "2", role: "scholar" }),
    ];
    expect(yuanFigureServiceHelper.filterByRole(figs, "全部")).toBe(figs);
    expect(yuanFigureServiceHelper.filterByRole(figs, "scholar")).toHaveLength(
      1,
    );
  });

  it("filterByPeriod 命中 '元初(1271-1294)' '元中期(1295-1332)' '元末(1333-1368)'", () => {
    const figs = [
      makeFigure({ id: "1", birthYear: 1280 }),
      makeFigure({ id: "2", birthYear: 1320 }),
      makeFigure({ id: "3", birthYear: 1350 }),
    ];
    expect(yuanFigureServiceHelper.filterByPeriod(figs, "全部")).toBe(figs);
    expect(
      yuanFigureServiceHelper.filterByPeriod(figs, "元初（1271-1294）"),
    ).toHaveLength(1);
    expect(
      yuanFigureServiceHelper.filterByPeriod(figs, "元中期（1295-1332）"),
    ).toHaveLength(1);
    expect(
      yuanFigureServiceHelper.filterByPeriod(figs, "元末（1333-1368）"),
    ).toHaveLength(1);
  });

  it("filterByFaction '全部' 直通 / 命中", () => {
    const figs = [
      makeFigure({ id: "1", faction: "蒙古" }),
      makeFigure({ id: "2", faction: "汉人" }),
    ];
    expect(yuanFigureServiceHelper.filterByFaction(figs, "全部")).toBe(figs);
    expect(yuanFigureServiceHelper.filterByFaction(figs, "蒙古")).toHaveLength(
      1,
    );
  });

  it("searchFigures 命中 name / courtesy / positions / faction", () => {
    const figs = [
      makeFigure({
        id: "1",
        name: "耶律楚材",
        courtesy: "晋卿",
        positions: ["中书令"],
        faction: "汉法派",
      }),
      makeFigure({ id: "2", name: "忽必烈" }),
    ];
    expect(yuanFigureServiceHelper.searchFigures(figs, "")).toBe(figs);
    expect(yuanFigureServiceHelper.searchFigures(figs, "耶律")).toHaveLength(1);
    expect(yuanFigureServiceHelper.searchFigures(figs, "晋卿")).toHaveLength(1);
    expect(yuanFigureServiceHelper.searchFigures(figs, "中书")).toHaveLength(1);
    expect(yuanFigureServiceHelper.searchFigures(figs, "汉法")).toHaveLength(1);
  });

  it("sortFigures: birthYear / role(emperor→chancellor→general→official→scholar→other)", () => {
    const figs = [
      makeFigure({ id: "a", role: "other", birthYear: 1250 }),
      makeFigure({ id: "b", role: "emperor", birthYear: 1300 }),
      makeFigure({ id: "c", role: "emperor", birthYear: 1215 }),
      makeFigure({ id: "d", role: "scholar", birthYear: 1280 }),
    ];
    const r = yuanFigureServiceHelper.sortFigures(figs, "role");
    expect(r.map((f) => f.id)).toEqual(["c", "b", "d", "a"]);
  });

  it("filterAndSort 串联", () => {
    const figs = [
      makeFigure({ id: "1", role: "emperor", birthYear: 1300 }),
      makeFigure({ id: "2", role: "emperor", birthYear: 1215 }),
    ];
    const r = yuanFigureServiceHelper.filterAndSort(figs, {
      role: "emperor",
      sortBy: "birthYear",
    });
    expect(r.map((f) => f.id)).toEqual(["2", "1"]);
  });

  it("getRoleLabel:emperor='皇帝/大汗',chancellor='丞相',未知兜底'其他'", () => {
    expect(yuanFigureServiceHelper.getRoleLabel("emperor")).toBe("皇帝/大汗");
    expect(yuanFigureServiceHelper.getRoleLabel("chancellor")).toBe("丞相");
    expect(
      yuanFigureServiceHelper.getRoleLabel("zz" as unknown as YuanFigureRole),
    ).toBe("其他");
  });

  it("formatLifespan / calculateAge", () => {
    const f = makeFigure({ birthYear: 1215, deathYear: 1294 });
    expect(yuanFigureServiceHelper.formatLifespan(f)).toBe("1215年 - 1294年");
    expect(yuanFigureServiceHelper.calculateAge(f)).toBe(79);
  });

  it("getAll / getById 默认 stub", async () => {
    await expect(yuanFigureServiceHelper.getAll()).resolves.toEqual({
      data: [],
    });
    await expect(yuanFigureServiceHelper.getById!("xx")).resolves.toEqual({
      data: null,
    });
  });
});
