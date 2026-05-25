/**
 * qingRulerStore 单元测试 (§2.8)
 *
 * 覆盖目标:
 * - 初始 state:rulers=[] / selectedRuler=null / loading=false / error=null /
 *              filters={period:'全部', searchQuery:'', sortBy:'reignStart'}
 * - 全部 setters:setRulers / setSelectedRuler / setLoading / setError /
 *                setPeriodFilter / setSearchQuery / setSortBy
 * - getFilteredRulers:透传 rulers + filters 给 qingRulerServiceHelper.filterAndSort,
 *                     注意 store 把 searchQuery 改名为 query 传下去
 * - getPeriodOptions:['全部', ...QING_PERIODS.map(p => p.name)],静态计算
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import type { QingRuler } from "@/services/person/qing/types";

// 必须在 import store 之前 mock
vi.mock("@/services/person/qing", async () => {
  const actual = await vi.importActual<typeof import("@/services/person/qing")>(
    "@/services/person/qing",
  );
  return {
    ...actual,
    qingRulerServiceHelper: {
      ...actual.qingRulerServiceHelper,
      filterAndSort: vi.fn(() => [{ id: "mocked" } as unknown as QingRuler]),
    },
  };
});

import { qingRulerServiceHelper } from "@/services/person/qing";
import { QING_PERIODS } from "@/services/person/qing/types";
import { useQingRulerStore } from "./qingRulerStore";

function makeRuler(overrides: Partial<QingRuler> = {}): QingRuler {
  return {
    id: overrides.id ?? "q-1",
    name: overrides.name ?? "Kangxi",
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
  };
}

describe("qingRulerStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useQingRulerStore.setState({
      rulers: [],
      selectedRuler: null,
      loading: false,
      error: null,
      filters: { period: "全部", searchQuery: "", sortBy: "reignStart" },
    });
  });

  describe("初始 state", () => {
    it("默认值齐全", () => {
      const s = useQingRulerStore.getState();
      expect(s.rulers).toEqual([]);
      expect(s.selectedRuler).toBeNull();
      expect(s.loading).toBe(false);
      expect(s.error).toBeNull();
      expect(s.filters).toEqual({
        period: "全部",
        searchQuery: "",
        sortBy: "reignStart",
      });
    });
  });

  describe("setters", () => {
    it("数据 / 选中 / 状态 三组 setter", () => {
      const list = [makeRuler()];
      const one = list[0]!;
      useQingRulerStore.getState().setRulers(list);
      useQingRulerStore.getState().setSelectedRuler(one);
      useQingRulerStore.getState().setLoading(true);
      useQingRulerStore.getState().setError(new Error("x"));

      const s = useQingRulerStore.getState();
      expect(s.rulers).toBe(list);
      expect(s.selectedRuler).toBe(one);
      expect(s.loading).toBe(true);
      expect(s.error?.message).toBe("x");
    });

    it("filter setters 分别只动各自字段", () => {
      useQingRulerStore.getState().setPeriodFilter("盛清(1723-1795)");
      expect(useQingRulerStore.getState().filters).toEqual({
        period: "盛清(1723-1795)",
        searchQuery: "",
        sortBy: "reignStart",
      });

      useQingRulerStore.getState().setSearchQuery("乾隆");
      expect(useQingRulerStore.getState().filters).toEqual({
        period: "盛清(1723-1795)",
        searchQuery: "乾隆",
        sortBy: "reignStart",
      });

      useQingRulerStore.getState().setSortBy("name");
      expect(useQingRulerStore.getState().filters).toEqual({
        period: "盛清(1723-1795)",
        searchQuery: "乾隆",
        sortBy: "name",
      });
    });
  });

  describe("getFilteredRulers", () => {
    it("把 rulers + filters(searchQuery→query) 传给 qingRulerServiceHelper.filterAndSort,返回值原样透传", () => {
      const list = [makeRuler({ id: "1" }), makeRuler({ id: "2" })];
      useQingRulerStore.setState({
        rulers: list,
        filters: {
          period: "清初(1616-1722)",
          searchQuery: "圣祖",
          sortBy: "name",
        },
      });

      const r = useQingRulerStore.getState().getFilteredRulers();

      expect(qingRulerServiceHelper.filterAndSort).toHaveBeenCalledTimes(1);
      expect(qingRulerServiceHelper.filterAndSort).toHaveBeenCalledWith(list, {
        period: "清初(1616-1722)",
        query: "圣祖",
        sortBy: "name",
      });
      expect(r).toEqual([{ id: "mocked" }]);
    });
  });

  describe("getPeriodOptions", () => {
    it("['全部', ...QING_PERIODS.map(p => p.name)] — 与配置一致", () => {
      const opts = useQingRulerStore.getState().getPeriodOptions();
      expect(opts[0]).toBe("全部");
      expect(opts.slice(1)).toEqual(QING_PERIODS.map((p) => p.name));
      expect(opts).toHaveLength(QING_PERIODS.length + 1);
    });

    it("返回值与 rulers 无关(纯配置静态)", () => {
      useQingRulerStore.setState({ rulers: [] });
      const empty = useQingRulerStore.getState().getPeriodOptions();
      useQingRulerStore.setState({ rulers: [makeRuler()] });
      const nonEmpty = useQingRulerStore.getState().getPeriodOptions();
      expect(empty).toEqual(nonEmpty);
    });
  });
});
