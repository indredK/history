/**
 * yuanFigureStore 单元测试 (§2.8)
 *
 * 与 song 同构,只差 service / 周期常量。
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import type { YuanFigure } from "@/services/person/yuan/types";

vi.mock("@/services/person/yuan", async () => {
  const actual = await vi.importActual<typeof import("@/services/person/yuan")>(
    "@/services/person/yuan",
  );
  return {
    ...actual,
    yuanFigureServiceHelper: {
      ...actual.yuanFigureServiceHelper,
      filterAndSort: vi.fn(() => [{ id: "mocked" } as unknown as YuanFigure]),
    },
  };
});

import { yuanFigureServiceHelper } from "@/services/person/yuan";
import { YUAN_PERIODS } from "@/services/person/yuan/types";
import { useYuanFigureStore } from "./yuanFigureStore";

describe("yuanFigureStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useYuanFigureStore.setState({
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
    expect(useYuanFigureStore.getState().filters.sortBy).toBe("birthYear");
  });

  it("getRoleOptions:与 song 同(scholar 标签)", () => {
    expect(useYuanFigureStore.getState().getRoleOptions()).toEqual([
      "全部",
      "emperor",
      "chancellor",
      "general",
      "official",
      "scholar",
      "other",
    ]);
  });

  it("getPeriodOptions:['全部', ...YUAN_PERIODS.map(p => p.name)]", () => {
    const opts = useYuanFigureStore.getState().getPeriodOptions();
    expect(opts[0]).toBe("全部");
    expect(opts.slice(1)).toEqual(YUAN_PERIODS.map((p) => p.name));
    expect(opts).toHaveLength(YUAN_PERIODS.length + 1);
  });

  it("getFilteredFigures:走 yuanFigureServiceHelper.filterAndSort(searchQuery→query)", () => {
    useYuanFigureStore.setState({
      figures: [],
      filters: {
        role: "official",
        period: "元末（1351-1368）",
        searchQuery: "刘",
        sortBy: "name",
      },
    });

    const r = useYuanFigureStore.getState().getFilteredFigures();

    expect(yuanFigureServiceHelper.filterAndSort).toHaveBeenCalledTimes(1);
    expect(yuanFigureServiceHelper.filterAndSort).toHaveBeenCalledWith([], {
      role: "official",
      period: "元末（1351-1368）",
      query: "刘",
      sortBy: "name",
    });
    expect(r).toEqual([{ id: "mocked" }]);
  });
});
