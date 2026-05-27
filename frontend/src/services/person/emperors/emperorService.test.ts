/**
 * emperorServiceHelper 单元测试 (§2.8)
 *
 * 帝王(Emperor)与其它人物 helper 的差异维度:
 *   - sortBy 只有两档:'reignStart' / 'dynasty'(用 DYNASTY_ORDER 升序,同朝代则 reignStart 升序)
 *   - search 覆盖 name + templeName + posthumousName + eraNames[].name + dynasty
 *   - formatReignPeriod 支持公元前(reignStart<0 → '公元前N年',否则 'N年')
 *   - formatEraNames 空数组 → '无年号',否则 '、' join
 *   - calculateReignYears = reignEnd - reignStart
 */
import { describe, it, expect } from "vitest";
import { emperorServiceHelper } from "./emperorService";
import type { Emperor } from "./types";

const makeEmperor = (overrides: Partial<Emperor> = {}): Emperor => ({
  id: overrides.id ?? "e1",
  name: overrides.name ?? "刘彻",
  templeName: overrides.templeName ?? "",
  posthumousName: overrides.posthumousName ?? "",
  dynasty: overrides.dynasty ?? "西汉",
  dynastyPeriod: overrides.dynastyPeriod ?? "",
  reignStart: overrides.reignStart ?? -141,
  reignEnd: overrides.reignEnd ?? -87,
  eraNames: overrides.eraNames ?? [],
  achievements: overrides.achievements ?? [],
  failures: overrides.failures ?? [],
  evaluations: overrides.evaluations ?? [],
  sources: overrides.sources ?? [],
  ...overrides,
});

describe("emperorServiceHelper", () => {
  describe("filterByDynasty", () => {
    const es = [
      makeEmperor({ id: "1", dynasty: "唐" }),
      makeEmperor({ id: "2", dynasty: "宋" }),
    ];
    it("'全部' / 空串直通", () => {
      expect(emperorServiceHelper.filterByDynasty(es, "全部")).toBe(es);
      expect(emperorServiceHelper.filterByDynasty(es, "")).toBe(es);
    });
    it("命中 dynasty", () => {
      const r = emperorServiceHelper.filterByDynasty(es, "唐");
      expect(r).toHaveLength(1);
      expect(r[0]!.id).toBe("1");
    });
  });

  describe("searchEmperors", () => {
    const es = [
      makeEmperor({
        id: "1",
        name: "李世民",
        templeName: "太宗",
        posthumousName: "文皇帝",
        eraNames: [
          {
            name: "贞观",
            startYear: 627,
            endYear: 649,
          } as Emperor["eraNames"][number],
        ],
        dynasty: "唐",
      }),
      makeEmperor({ id: "2", name: "赵匡胤", dynasty: "北宋" }),
    ];
    it("空 query 直通", () => {
      expect(emperorServiceHelper.searchEmperors(es, "")).toBe(es);
      expect(emperorServiceHelper.searchEmperors(es, "   ")).toBe(es);
    });
    it("命中 name", () => {
      expect(emperorServiceHelper.searchEmperors(es, "世民")).toHaveLength(1);
    });
    it("命中 templeName", () => {
      expect(emperorServiceHelper.searchEmperors(es, "太宗")).toHaveLength(1);
    });
    it("命中 posthumousName", () => {
      expect(emperorServiceHelper.searchEmperors(es, "文皇帝")).toHaveLength(1);
    });
    it("命中 eraNames[].name", () => {
      expect(emperorServiceHelper.searchEmperors(es, "贞观")).toHaveLength(1);
    });
    it("命中 dynasty", () => {
      expect(emperorServiceHelper.searchEmperors(es, "北宋")).toHaveLength(1);
    });
  });

  describe("sortEmperors", () => {
    it("reignStart 升序(支持负数)", () => {
      const es = [
        makeEmperor({ id: "a", reignStart: 100 }),
        makeEmperor({ id: "b", reignStart: -200 }),
        makeEmperor({ id: "c", reignStart: 50 }),
      ];
      const r = emperorServiceHelper.sortEmperors(es, "reignStart");
      expect(r.map((x) => x.id)).toEqual(["b", "c", "a"]);
    });
    it("dynasty:DYNASTY_ORDER 升序(西汉=7 < 唐=15 < 北宋=17),同朝代则 reignStart 升序", () => {
      const es = [
        makeEmperor({ id: "a", dynasty: "唐", reignStart: 627 }),
        makeEmperor({ id: "b", dynasty: "北宋", reignStart: 960 }),
        makeEmperor({ id: "c", dynasty: "西汉", reignStart: -141 }),
        makeEmperor({ id: "d", dynasty: "唐", reignStart: 712 }),
      ];
      const r = emperorServiceHelper.sortEmperors(es, "dynasty");
      expect(r.map((x) => x.id)).toEqual(["c", "a", "d", "b"]);
    });
    it("dynasty 未知 → getDynastyOrder 兜底 999,排到最后", () => {
      const es = [
        makeEmperor({ id: "a", dynasty: "未知国" }),
        makeEmperor({ id: "b", dynasty: "唐" }),
      ];
      const r = emperorServiceHelper.sortEmperors(es, "dynasty");
      expect(r.map((x) => x.id)).toEqual(["b", "a"]);
    });
    it("未识别 sortBy 走拷贝", () => {
      const es = [makeEmperor({ id: "x" })];
      const r = emperorServiceHelper.sortEmperors(
        es,
        "zz" as unknown as "reignStart",
      );
      expect(r).toEqual(es);
      expect(r).not.toBe(es);
    });
  });

  describe("filterAndSort", () => {
    const es = [
      makeEmperor({ id: "1", dynasty: "唐", reignStart: 627 }),
      makeEmperor({ id: "2", dynasty: "唐", reignStart: 712 }),
    ];
    it("全 undefined 直通", () => {
      expect(emperorServiceHelper.filterAndSort(es, {})).toBe(es);
    });
    it("dynasty + sortBy 串联", () => {
      const r = emperorServiceHelper.filterAndSort(es, {
        dynasty: "唐",
        sortBy: "reignStart",
      });
      expect(r.map((x) => x.id)).toEqual(["1", "2"]);
    });
  });

  describe("formatReignPeriod", () => {
    it("公元前(reignStart<0)→ '公元前N年'", () => {
      const e = makeEmperor({ reignStart: -141, reignEnd: -87 });
      expect(emperorServiceHelper.formatReignPeriod(e)).toBe(
        "公元前141年 - 公元前87年",
      );
    });
    it("公元后(reignStart>=0)→ 'N年'", () => {
      const e = makeEmperor({ reignStart: 627, reignEnd: 649 });
      expect(emperorServiceHelper.formatReignPeriod(e)).toBe("627年 - 649年");
    });
    it("跨公元(reignStart<0, reignEnd>0)混合", () => {
      const e = makeEmperor({ reignStart: -10, reignEnd: 10 });
      expect(emperorServiceHelper.formatReignPeriod(e)).toBe(
        "公元前10年 - 10年",
      );
    });
  });

  describe("formatEraNames", () => {
    it("空数组 → '无年号'", () => {
      const e = makeEmperor({ eraNames: [] });
      expect(emperorServiceHelper.formatEraNames(e)).toBe("无年号");
    });
    it("多个年号 → '、' join", () => {
      const e = makeEmperor({
        eraNames: [
          { name: "贞观", startYear: 627, endYear: 649 } as never,
          { name: "永徽", startYear: 650, endYear: 655 } as never,
        ],
      });
      expect(emperorServiceHelper.formatEraNames(e)).toBe("贞观、永徽");
    });
  });

  it("calculateReignYears = reignEnd - reignStart(含负数跨公元)", () => {
    const e = makeEmperor({ reignStart: -141, reignEnd: -87 });
    expect(emperorServiceHelper.calculateReignYears(e)).toBe(54);
    const e2 = makeEmperor({ reignStart: -10, reignEnd: 10 });
    expect(emperorServiceHelper.calculateReignYears(e2)).toBe(20);
  });
});
