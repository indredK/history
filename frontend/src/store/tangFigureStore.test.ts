/**
 * tangFigureStore 单元测试 (§2.8)
 *
 * 这是 createFigureStore 工厂实例化的烟雾测试(工厂本身的逻辑见 createFigureStore.test.ts)。
 * 目标只在验证唐朝实例的静态配置 + service 接线正确:
 * - roleOptions:['全部', emperor, chancellor, general, official, poet, other]
 * - periodOptions:['全部', ...TANG_PERIODS.map(p => p.name)]
 * - filters.sortBy 默认 'birthYear'
 * - getFilteredFigures 走 tangFigureService.filterAndSort
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import type { TangFigure } from "@/services/person/tang/types";

// 必须在 import store 之前 mock
vi.mock("@/services/person/tang", async () => {
  const actual = await vi.importActual<typeof import("@/services/person/tang")>(
    "@/services/person/tang",
  );
  return {
    ...actual,
    tangFigureService: {
      ...actual.tangFigureService,
      filterAndSort: vi.fn(() => [{ id: "mocked" } as unknown as TangFigure]),
    },
  };
});

import { tangFigureService } from "@/services/person/tang";
import { TANG_PERIODS } from "@/services/person/tang/types";
import { useTangFigureStore } from "./tangFigureStore";

describe("tangFigureStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTangFigureStore.setState({
      figures: [],
      selectedFigure: null,
      loading: false,
      error: null,
      filters: {
        role: "全部",
        period: "全部",
        searchQuery: "",
        sortBy: "birthYear",
      },
    });
  });

  it("初始 state:默认 sortBy=birthYear", () => {
    const s = useTangFigureStore.getState();
    expect(s.figures).toEqual([]);
    expect(s.filters).toEqual({
      role: "全部",
      period: "全部",
      searchQuery: "",
      sortBy: "birthYear",
    });
  });

  it("getRoleOptions:7 项,首项是 '全部'", () => {
    expect(useTangFigureStore.getState().getRoleOptions()).toEqual([
      "全部",
      "emperor",
      "chancellor",
      "general",
      "official",
      "poet",
      "other",
    ]);
  });

  it("getPeriodOptions:['全部', ...TANG_PERIODS.map(p => p.name)]", () => {
    const opts = useTangFigureStore.getState().getPeriodOptions();
    expect(opts[0]).toBe("全部");
    expect(opts.slice(1)).toEqual(TANG_PERIODS.map((p) => p.name));
    expect(opts).toHaveLength(TANG_PERIODS.length + 1);
  });

  it("getFilteredFigures:把 filters(searchQuery→query)传给 tangFigureService.filterAndSort", () => {
    useTangFigureStore.setState({
      figures: [],
      filters: {
        role: "poet",
        period: "盛唐（713-765）",
        searchQuery: "李",
        sortBy: "name",
      },
    });

    const r = useTangFigureStore.getState().getFilteredFigures();

    expect(tangFigureService.filterAndSort).toHaveBeenCalledTimes(1);
    expect(tangFigureService.filterAndSort).toHaveBeenCalledWith([], {
      role: "poet",
      period: "盛唐（713-765）",
      query: "李",
      sortBy: "name",
    });
    expect(r).toEqual([{ id: "mocked" }]);
  });
});
