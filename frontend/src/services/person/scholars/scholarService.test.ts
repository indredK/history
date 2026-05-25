/**
 * scholarServiceHelper 单元测试 (§2.8)
 *
 * 与其它 helper 的差异:
 *   - filterByDynasty 支持 dynasty OR dynastyPeriod 任一命中(短路 OR)
 *   - sortScholars:'dynasty' 走 (dynasty || dynastyPeriod) localCompare,
 *     'birthYear' null 兜底成 0(`a.birthYear || 0`),'name' localCompare 默认 locale
 *   - search 覆盖 name + name_en + schoolOfThought + dynasty + dynastyPeriod
 *   - 没有 formatLifespan / calculateAge,只有 filterAndSort + 4 个筛选函数 + sort
 */
import { describe, it, expect } from "vitest";
import { scholarServiceHelper } from "./scholarService";
import type { Scholar } from "./types";

const makeScholar = (overrides: Partial<Scholar> = {}): Scholar => ({
  id: overrides.id ?? "s1",
  name: overrides.name ?? "孔丘",
  ...overrides,
});

describe("scholarServiceHelper", () => {
  describe("filterByDynasty", () => {
    const ss = [
      makeScholar({ id: "1", dynasty: "宋", dynastyPeriod: "南宋" }),
      makeScholar({ id: "2", dynasty: "唐" }),
      makeScholar({ id: "3", dynastyPeriod: "南宋" }),
    ];
    it("'全部' / 空串直通", () => {
      expect(scholarServiceHelper.filterByDynasty(ss, "全部")).toBe(ss);
      expect(scholarServiceHelper.filterByDynasty(ss, "")).toBe(ss);
    });
    it("命中 dynasty='宋'", () => {
      const r = scholarServiceHelper.filterByDynasty(ss, "宋");
      expect(r.map((x) => x.id)).toEqual(["1"]);
    });
    it("命中 dynastyPeriod='南宋'(覆盖 dynasty 字段缺失情况)", () => {
      const r = scholarServiceHelper.filterByDynasty(ss, "南宋");
      expect(r.map((x) => x.id).sort()).toEqual(["1", "3"]);
    });
  });

  describe("filterBySchool", () => {
    const ss = [
      makeScholar({ id: "1", schoolOfThought: "儒家" }),
      makeScholar({ id: "2", schoolOfThought: "道家" }),
    ];
    it("'全部' / 空串直通", () => {
      expect(scholarServiceHelper.filterBySchool(ss, "全部")).toBe(ss);
      expect(scholarServiceHelper.filterBySchool(ss, "")).toBe(ss);
    });
    it("命中 schoolOfThought", () => {
      expect(scholarServiceHelper.filterBySchool(ss, "儒家")).toHaveLength(1);
    });
  });

  describe("searchScholars", () => {
    const ss = [
      makeScholar({
        id: "1",
        name: "朱熹",
        name_en: "Zhu Xi",
        dynasty: "宋",
        dynastyPeriod: "南宋",
        schoolOfThought: "理学",
      }),
      makeScholar({ id: "2", name: "王阳明", dynasty: "明" }),
    ];
    it("空 query 直通", () => {
      expect(scholarServiceHelper.searchScholars(ss, "")).toBe(ss);
      expect(scholarServiceHelper.searchScholars(ss, "   ")).toBe(ss);
    });
    it("命中 name", () => {
      expect(scholarServiceHelper.searchScholars(ss, "朱熹")).toHaveLength(1);
    });
    it("命中 name_en(大小写归一化)", () => {
      expect(scholarServiceHelper.searchScholars(ss, "zhu xi")).toHaveLength(1);
      expect(scholarServiceHelper.searchScholars(ss, "ZHU XI")).toHaveLength(1);
    });
    it("命中 schoolOfThought", () => {
      expect(scholarServiceHelper.searchScholars(ss, "理学")).toHaveLength(1);
    });
    it("命中 dynasty", () => {
      expect(scholarServiceHelper.searchScholars(ss, "明")).toHaveLength(1);
    });
    it("命中 dynastyPeriod", () => {
      expect(scholarServiceHelper.searchScholars(ss, "南宋")).toHaveLength(1);
    });
  });

  describe("sortScholars", () => {
    it("name 用 localCompare 默认 locale(只验证全员到位)", () => {
      const ss = [
        makeScholar({ id: "a", name: "朱熹" }),
        makeScholar({ id: "b", name: "王阳明" }),
      ];
      const r = scholarServiceHelper.sortScholars(ss, "name");
      expect(r).toHaveLength(2);
      expect(new Set(r.map((x) => x.id))).toEqual(new Set(["a", "b"]));
    });
    it("dynasty 走 dynasty || dynastyPeriod localCompare(双字段兜底)", () => {
      const ss = [
        makeScholar({ id: "a", dynastyPeriod: "南宋" }),
        makeScholar({ id: "b", dynasty: "明" }),
      ];
      const r = scholarServiceHelper.sortScholars(ss, "dynasty");
      expect(r).toHaveLength(2);
    });
    it("birthYear 升序 + null 兜底 0", () => {
      const ss = [
        makeScholar({ id: "a", birthYear: 1130 }),
        makeScholar({ id: "b", birthYear: null }),
        makeScholar({ id: "c", birthYear: 1000 }),
      ];
      const r = scholarServiceHelper.sortScholars(ss, "birthYear");
      // null → 0,排在最前
      expect(r.map((x) => x.id)).toEqual(["b", "c", "a"]);
    });
    it("未识别 sortBy 走拷贝", () => {
      const ss = [makeScholar({ id: "x" })];
      const r = scholarServiceHelper.sortScholars(
        ss,
        "zz" as unknown as "name",
      );
      expect(r).toEqual(ss);
      expect(r).not.toBe(ss);
    });
  });

  describe("filterAndSort", () => {
    const ss = [
      makeScholar({
        id: "1",
        dynasty: "宋",
        schoolOfThought: "理学",
        birthYear: 1130,
      }),
      makeScholar({
        id: "2",
        dynasty: "明",
        schoolOfThought: "心学",
        birthYear: 1472,
      }),
    ];
    it("全 undefined 直通", () => {
      expect(scholarServiceHelper.filterAndSort(ss, {})).toBe(ss);
    });
    it("dynasty + school + sortBy 串联", () => {
      const r = scholarServiceHelper.filterAndSort(ss, {
        dynasty: "宋",
        school: "理学",
        sortBy: "birthYear",
      });
      expect(r).toHaveLength(1);
      expect(r[0]!.id).toBe("1");
    });
  });

  it("getAll / getById 默认 stub", async () => {
    await expect(scholarServiceHelper.getAll()).resolves.toEqual({ data: [] });
    await expect(scholarServiceHelper.getById("x")).resolves.toEqual({
      data: null,
    });
  });
});
