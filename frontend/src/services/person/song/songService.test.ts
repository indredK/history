/**
 * songFigureServiceHelper 单元测试 (§2.8)
 *
 * 与 Tang 同构 canonical 模板,差异维度:
 *   - roleOrder:emperor(1) > chancellor(2) > general(3) > official(4) > scholar(5) > other(6)
 *     (Tang 第 5 档是 poet,Song 是 scholar)
 *   - period 走 SONG_PERIODS 4 段(北宋前/后期、南宋前/后期)
 */
import { describe, it, expect } from "vitest";
import { songFigureServiceHelper } from "./songService";
import type { SongFigure, SongFigureRole } from "./types";

const makeFigure = (overrides: Partial<SongFigure> = {}): SongFigure => ({
  id: overrides.id ?? "f1",
  name: overrides.name ?? "苏轼",
  courtesy: overrides.courtesy,
  birthYear: overrides.birthYear ?? 1037,
  deathYear: overrides.deathYear ?? 1101,
  role: overrides.role ?? "scholar",
  positions: overrides.positions ?? [],
  faction: overrides.faction,
  biography: overrides.biography ?? "",
  achievements: overrides.achievements ?? [],
  events: overrides.events ?? [],
  evaluations: overrides.evaluations ?? [],
  sources: overrides.sources ?? [],
  ...overrides,
});

describe("songFigureServiceHelper", () => {
  it("filterByRole: '全部' 直通 / 命中 / 未命中", () => {
    const figs = [
      makeFigure({ id: "1", role: "emperor" }),
      makeFigure({ id: "2", role: "scholar" }),
    ];
    expect(songFigureServiceHelper.filterByRole(figs, "全部")).toBe(figs);
    expect(songFigureServiceHelper.filterByRole(figs, "scholar")).toHaveLength(
      1,
    );
    expect(songFigureServiceHelper.filterByRole(figs, "general")).toHaveLength(
      0,
    );
  });

  it("filterByPeriod 命中 '北宋前期(960-1067)'", () => {
    const figs = [
      makeFigure({ id: "1", birthYear: 1000 }), // 北宋前期
      makeFigure({ id: "2", birthYear: 1100 }), // 北宋后期
      makeFigure({ id: "3", birthYear: 1150 }), // 南宋前期
    ];
    expect(songFigureServiceHelper.filterByPeriod(figs, "全部")).toBe(figs);
    const r = songFigureServiceHelper.filterByPeriod(
      figs,
      "北宋前期（960-1067）",
    );
    expect(r).toHaveLength(1);
    expect(r[0]!.id).toBe("1");
  });

  it("filterByFaction 命中 / '全部' 直通", () => {
    const figs = [
      makeFigure({ id: "1", faction: "新党" }),
      makeFigure({ id: "2", faction: "旧党" }),
    ];
    expect(songFigureServiceHelper.filterByFaction(figs, "全部")).toBe(figs);
    expect(songFigureServiceHelper.filterByFaction(figs, "新党")).toHaveLength(
      1,
    );
  });

  it("searchFigures 命中 name / courtesy / positions / faction", () => {
    const figs = [
      makeFigure({
        id: "1",
        name: "苏轼",
        courtesy: "子瞻",
        positions: ["翰林学士"],
        faction: "旧党",
      }),
      makeFigure({ id: "2", name: "王安石" }),
    ];
    expect(songFigureServiceHelper.searchFigures(figs, "")).toBe(figs);
    expect(songFigureServiceHelper.searchFigures(figs, "苏")).toHaveLength(1);
    expect(songFigureServiceHelper.searchFigures(figs, "子瞻")).toHaveLength(1);
    expect(songFigureServiceHelper.searchFigures(figs, "翰林")).toHaveLength(1);
    expect(songFigureServiceHelper.searchFigures(figs, "旧党")).toHaveLength(1);
  });

  it("sortFigures 按 role 走 emperor→chancellor→general→official→scholar→other", () => {
    const figs = [
      makeFigure({ id: "a", role: "other", birthYear: 1000 }),
      makeFigure({ id: "b", role: "scholar", birthYear: 1037 }),
      makeFigure({ id: "c", role: "emperor", birthYear: 1100 }),
      makeFigure({ id: "d", role: "emperor", birthYear: 1000 }),
    ];
    const r = songFigureServiceHelper.sortFigures(figs, "role");
    expect(r.map((f) => f.id)).toEqual(["d", "c", "b", "a"]);
  });

  it("sortFigures birthYear / name", () => {
    const figs = [
      makeFigure({ id: "a", birthFear: 1100 } as unknown as SongFigure),
      makeFigure({ id: "b", birthYear: 1000 }),
    ];
    const r1 = songFigureServiceHelper.sortFigures(figs, "birthYear");
    expect(r1).toHaveLength(2);
    const r2 = songFigureServiceHelper.sortFigures(figs, "name");
    expect(r2).toHaveLength(2);
  });

  it("filterAndSort 串联", () => {
    const figs = [
      makeFigure({ id: "1", role: "emperor", birthYear: 1000 }),
      makeFigure({ id: "2", role: "scholar", birthYear: 1037 }),
    ];
    const r = songFigureServiceHelper.filterAndSort(figs, {
      role: "scholar",
      sortBy: "birthYear",
    });
    expect(r).toHaveLength(1);
    expect(r[0]!.id).toBe("2");
  });

  it("getRoleLabel / formatLifespan / calculateAge", () => {
    expect(songFigureServiceHelper.getRoleLabel("scholar")).toBe("学者");
    expect(
      songFigureServiceHelper.getRoleLabel("zzz" as unknown as SongFigureRole),
    ).toBe("其他");
    const f = makeFigure({ birthYear: 1037, deathYear: 1101 });
    expect(songFigureServiceHelper.formatLifespan(f)).toBe("1037年 - 1101年");
    expect(songFigureServiceHelper.calculateAge(f)).toBe(64);
  });

  it("getAll / getById 默认 stub 返回空 data", async () => {
    await expect(songFigureServiceHelper.getAll()).resolves.toEqual({
      data: [],
    });
    await expect(songFigureServiceHelper.getById("xx")).resolves.toEqual({
      data: null,
    });
  });
});
