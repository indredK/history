/**
 * scholarStore 单元测试 (§2.8)
 *
 * 覆盖目标:
 * - 初始 state:scholars=[] / selectedScholar=null / loading=false / error=null /
 *              filters.dynasty='全部' / filters.schoolOfThought='全部'
 * - 全部 setters:setScholars / setSelectedScholar / setLoading / setError /
 *                setDynastyFilter / setSchoolFilter
 * - getFilteredScholars(AND 复合):
 *   - 两个 filter='全部' → 全量直通
 *   - dynasty 命中 scholar.dynasty
 *   - dynasty 命中 scholar.dynastyPeriod 兜底(没有 dynasty 字段)
 *   - schoolOfThought 命中
 *   - AND 复合:dynasty+school 同时生效,不命中其一就过滤掉
 */
import { describe, it, expect, beforeEach } from "vitest";
import type { Scholar } from "@/services/person/scholars/types";
import { useScholarStore } from "./scholarStore";

function makeScholar(overrides: Partial<Scholar> = {}): Scholar {
  return {
    id: overrides.id ?? "s-1",
    name: overrides.name ?? "Confucius",
    ...overrides,
  };
}

describe("scholarStore", () => {
  beforeEach(() => {
    useScholarStore.setState({
      scholars: [],
      selectedScholar: null,
      loading: false,
      error: null,
      filters: { dynasty: "全部", schoolOfThought: "全部" },
    });
  });

  describe("初始 state", () => {
    it("默认值齐全", () => {
      const s = useScholarStore.getState();
      expect(s.scholars).toEqual([]);
      expect(s.selectedScholar).toBeNull();
      expect(s.loading).toBe(false);
      expect(s.error).toBeNull();
      expect(s.filters.dynasty).toBe("全部");
      expect(s.filters.schoolOfThought).toBe("全部");
    });
  });

  describe("setters", () => {
    it("setScholars / setSelectedScholar / setLoading / setError", () => {
      const list = [makeScholar()];
      const one = list[0]!;
      useScholarStore.getState().setScholars(list);
      useScholarStore.getState().setSelectedScholar(one);
      useScholarStore.getState().setLoading(true);
      useScholarStore.getState().setError(new Error("oops"));

      const s = useScholarStore.getState();
      expect(s.scholars).toBe(list);
      expect(s.selectedScholar).toBe(one);
      expect(s.loading).toBe(true);
      expect(s.error?.message).toBe("oops");
    });

    it("setSelectedScholar(null) / setError(null) 清空", () => {
      useScholarStore.setState({
        selectedScholar: makeScholar(),
        error: new Error("x"),
      });
      useScholarStore.getState().setSelectedScholar(null);
      useScholarStore.getState().setError(null);
      expect(useScholarStore.getState().selectedScholar).toBeNull();
      expect(useScholarStore.getState().error).toBeNull();
    });

    it("setDynastyFilter / setSchoolFilter 单独更新 filters,其它保留", () => {
      useScholarStore.getState().setDynastyFilter("唐");
      expect(useScholarStore.getState().filters.dynasty).toBe("唐");
      expect(useScholarStore.getState().filters.schoolOfThought).toBe("全部");

      useScholarStore.getState().setSchoolFilter("儒家");
      expect(useScholarStore.getState().filters.dynasty).toBe("唐");
      expect(useScholarStore.getState().filters.schoolOfThought).toBe("儒家");
    });
  });

  describe("getFilteredScholars", () => {
    it("两个 filter 都=全部 → 返回所有 scholars", () => {
      const list = [
        makeScholar({ id: "1", dynasty: "唐", schoolOfThought: "儒家" }),
        makeScholar({ id: "2", dynasty: "宋", schoolOfThought: "道家" }),
      ];
      useScholarStore.setState({ scholars: list });

      expect(useScholarStore.getState().getFilteredScholars()).toEqual(list);
    });

    it("dynasty 命中 scholar.dynasty", () => {
      useScholarStore.setState({
        scholars: [
          makeScholar({ id: "1", dynasty: "唐" }),
          makeScholar({ id: "2", dynasty: "宋" }),
        ],
        filters: { dynasty: "唐", schoolOfThought: "全部" },
      });

      const r = useScholarStore.getState().getFilteredScholars();
      expect(r).toHaveLength(1);
      expect(r[0]!.id).toBe("1");
    });

    it("dynasty 没设 scholar.dynasty 时回退 scholar.dynastyPeriod", () => {
      useScholarStore.setState({
        scholars: [
          makeScholar({ id: "1", dynastyPeriod: "唐" }),
          makeScholar({ id: "2", dynastyPeriod: "宋" }),
        ],
        filters: { dynasty: "唐", schoolOfThought: "全部" },
      });

      const r = useScholarStore.getState().getFilteredScholars();
      expect(r).toHaveLength(1);
      expect(r[0]!.id).toBe("1");
    });

    it("dynasty 字段同时存在:以 scholar.dynasty 为准(短路 OR)", () => {
      // 源码 `scholar.dynasty || scholar.dynastyPeriod` —— dynasty 真值时不会读 dynastyPeriod
      useScholarStore.setState({
        scholars: [
          makeScholar({ id: "1", dynasty: "唐", dynastyPeriod: "宋" }),
        ],
        filters: { dynasty: "唐", schoolOfThought: "全部" },
      });
      expect(useScholarStore.getState().getFilteredScholars()).toHaveLength(1);

      useScholarStore.setState({
        filters: { dynasty: "宋", schoolOfThought: "全部" },
      });
      expect(useScholarStore.getState().getFilteredScholars()).toHaveLength(0);
    });

    it("schoolOfThought 命中", () => {
      useScholarStore.setState({
        scholars: [
          makeScholar({ id: "1", schoolOfThought: "儒家" }),
          makeScholar({ id: "2", schoolOfThought: "道家" }),
        ],
        filters: { dynasty: "全部", schoolOfThought: "儒家" },
      });

      const r = useScholarStore.getState().getFilteredScholars();
      expect(r).toHaveLength(1);
      expect(r[0]!.id).toBe("1");
    });

    it("AND 复合:两个 filter 同时生效", () => {
      useScholarStore.setState({
        scholars: [
          makeScholar({ id: "1", dynasty: "唐", schoolOfThought: "儒家" }),
          makeScholar({ id: "2", dynasty: "唐", schoolOfThought: "道家" }),
          makeScholar({ id: "3", dynasty: "宋", schoolOfThought: "儒家" }),
        ],
        filters: { dynasty: "唐", schoolOfThought: "儒家" },
      });

      const r = useScholarStore.getState().getFilteredScholars();
      expect(r).toHaveLength(1);
      expect(r[0]!.id).toBe("1");
    });

    it("AND 复合:一个不命中则整条过滤", () => {
      useScholarStore.setState({
        scholars: [
          makeScholar({ id: "1", dynasty: "唐", schoolOfThought: "儒家" }),
        ],
        filters: { dynasty: "宋", schoolOfThought: "儒家" }, // dynasty 不命中
      });
      expect(useScholarStore.getState().getFilteredScholars()).toEqual([]);
    });

    it("dynasty 与 dynastyPeriod 都缺失:dynasty='全部' 通过,具体值则不通过", () => {
      useScholarStore.setState({
        scholars: [makeScholar({ id: "1" /* 没有 dynasty/dynastyPeriod */ })],
        filters: { dynasty: "全部", schoolOfThought: "全部" },
      });
      expect(useScholarStore.getState().getFilteredScholars()).toHaveLength(1);

      useScholarStore.setState({
        filters: { dynasty: "唐", schoolOfThought: "全部" },
      });
      expect(useScholarStore.getState().getFilteredScholars()).toEqual([]);
    });
  });
});
