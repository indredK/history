/**
 * qingRulerServiceHelper 单元测试 (§2.8)
 *
 * 清朝统治者(QingRuler)与其它朝代不同维度:
 *   - 无 role/faction,只有 period(走 getQingPeriod(reignStart) 落到 QING_PERIODS 4 段)
 *   - sortBy 只有两档:'reignStart' / 'name'
 *   - 字段对齐:reignStart/reignEnd 代替 birthYear/deathYear
 *   - search 覆盖 name / templeName / eraName
 *   - getTitle:templeName='（无庙号）' → 返回 '${eraName}帝',否则 '清${templeName}（${eraName}）'
 */
import { describe, it, expect } from "vitest";
import { qingRulerServiceHelper } from "./qingRulerService";
import type { QingRuler } from "./types";

const makeRuler = (overrides: Partial<QingRuler> = {}): QingRuler => ({
  id: overrides.id ?? "r1",
  name: overrides.name ?? "玄烨",
  templeName: overrides.templeName ?? "圣祖",
  eraName: overrides.eraName ?? "康熙",
  reignStart: overrides.reignStart ?? 1661,
  reignEnd: overrides.reignEnd ?? 1722,
  policies: overrides.policies ?? [],
  majorEvents: overrides.majorEvents ?? [],
  contribution: overrides.contribution ?? "",
  responsibility: overrides.responsibility ?? "",
  evaluations: overrides.evaluations ?? [],
  sources: overrides.sources ?? [],
  ...overrides,
});

describe("qingRulerServiceHelper", () => {
  it("filterByPeriod: '全部' 直通 / 空字符串直通", () => {
    const rs = [makeRuler({ id: "1" }), makeRuler({ id: "2" })];
    expect(qingRulerServiceHelper.filterByPeriod(rs, "全部")).toBe(rs);
    expect(qingRulerServiceHelper.filterByPeriod(rs, "")).toBe(rs);
  });

  it("filterByPeriod 命中 '清初(1616-1722)'", () => {
    const rs = [
      makeRuler({ id: "1", reignStart: 1700 }), // 清初
      makeRuler({ id: "2", reignStart: 1735 }), // 盛清
      makeRuler({ id: "3", reignStart: 1800 }), // 清中期
      makeRuler({ id: "4", reignStart: 1900 }), // 晚清
    ];
    const r = qingRulerServiceHelper.filterByPeriod(rs, "清初（1616-1722）");
    expect(r).toHaveLength(1);
    expect(r[0]!.id).toBe("1");
  });

  it("filterByPeriod 命中 '盛清/清中期/晚清'", () => {
    const rs = [
      makeRuler({ id: "2", reignStart: 1735 }),
      makeRuler({ id: "3", reignStart: 1800 }),
      makeRuler({ id: "4", reignStart: 1900 }),
    ];
    expect(
      qingRulerServiceHelper.filterByPeriod(rs, "盛清（1723-1795）"),
    ).toHaveLength(1);
    expect(
      qingRulerServiceHelper.filterByPeriod(rs, "清中期（1796-1861）"),
    ).toHaveLength(1);
    expect(
      qingRulerServiceHelper.filterByPeriod(rs, "晚清（1862-1912）"),
    ).toHaveLength(1);
  });

  it("searchRulers 命中 name / templeName / eraName / 空 query 直通", () => {
    const rs = [
      makeRuler({
        id: "1",
        name: "玄烨",
        templeName: "圣祖",
        eraName: "康熙",
      }),
      makeRuler({
        id: "2",
        name: "弘历",
        templeName: "高宗",
        eraName: "乾隆",
      }),
    ];
    expect(qingRulerServiceHelper.searchRulers(rs, "")).toBe(rs);
    expect(qingRulerServiceHelper.searchRulers(rs, "   ")).toBe(rs);
    // 命中 name
    expect(qingRulerServiceHelper.searchRulers(rs, "玄烨")).toHaveLength(1);
    // 命中 templeName
    expect(qingRulerServiceHelper.searchRulers(rs, "圣祖")).toHaveLength(1);
    // 命中 eraName
    expect(qingRulerServiceHelper.searchRulers(rs, "乾隆")).toHaveLength(1);
  });

  it("sortRulers: reignStart 升序", () => {
    const rs = [
      makeRuler({ id: "a", reignStart: 1735 }),
      makeRuler({ id: "b", reignStart: 1661 }),
      makeRuler({ id: "c", reignStart: 1820 }),
    ];
    const r = qingRulerServiceHelper.sortRulers(rs, "reignStart");
    expect(r.map((x) => x.id)).toEqual(["b", "a", "c"]);
  });

  it("sortRulers: name 用 zh-CN locale", () => {
    const rs = [
      makeRuler({ id: "a", name: "玄烨" }),
      makeRuler({ id: "b", name: "弘历" }),
    ];
    const r = qingRulerServiceHelper.sortRulers(rs, "name");
    expect(r).toHaveLength(2);
    expect(new Set(r.map((x) => x.id))).toEqual(new Set(["a", "b"]));
  });

  it("sortRulers 未识别 sortBy 走拷贝", () => {
    const rs = [makeRuler({ id: "x" })];
    const r = qingRulerServiceHelper.sortRulers(
      rs,
      "yyy" as unknown as "reignStart",
    );
    expect(r).toEqual(rs);
    expect(r).not.toBe(rs);
  });

  it("filterAndSort 串联", () => {
    const rs = [
      makeRuler({
        id: "1",
        reignStart: 1700,
        name: "玄烨",
        eraName: "康熙",
      }),
      makeRuler({ id: "2", reignStart: 1735, name: "弘历", eraName: "乾隆" }),
    ];
    const r = qingRulerServiceHelper.filterAndSort(rs, {
      query: "玄烨",
      sortBy: "reignStart",
    });
    expect(r).toHaveLength(1);
    expect(r[0]!.id).toBe("1");
    // 全 undefined 直通
    expect(qingRulerServiceHelper.filterAndSort(rs, {})).toBe(rs);
  });

  it("formatReignPeriod 拼接 reignStart/reignEnd", () => {
    const r = makeRuler({ reignStart: 1661, reignEnd: 1722 });
    expect(qingRulerServiceHelper.formatReignPeriod(r)).toBe("1661年 - 1722年");
  });

  it("calculateReignYears = reignEnd - reignStart", () => {
    const r = makeRuler({ reignStart: 1661, reignEnd: 1722 });
    expect(qingRulerServiceHelper.calculateReignYears(r)).toBe(61);
  });

  it("getTitle: 普通 → 清${templeName}(${eraName})", () => {
    const r = makeRuler({ templeName: "圣祖", eraName: "康熙" });
    expect(qingRulerServiceHelper.getTitle(r)).toBe("清圣祖（康熙）");
  });

  it("getTitle: templeName='（无庙号）' → '${eraName}帝'", () => {
    const r = makeRuler({ templeName: "（无庙号）", eraName: "宣统" });
    expect(qingRulerServiceHelper.getTitle(r)).toBe("宣统帝");
  });

  it("getAll / getById 默认 stub", async () => {
    await expect(qingRulerServiceHelper.getAll()).resolves.toEqual({
      data: [],
    });
    await expect(qingRulerServiceHelper.getById("x")).resolves.toEqual({
      data: null,
    });
  });
});
