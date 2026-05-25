/**
 * mingFigureStore 单元测试 (§2.8)
 *
 * 与 song/yuan 同构,差异点:
 * - service 用 mingService(即 mingFigureApi 的别名)
 * - roleOptions 用 'cabinet'/'eunuch' 替代 'chancellor'/'scholar'(明朝特色:阁老/宦官)
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import type { MingFigure } from "@/services/person/ming/types";

vi.mock("@/services/person/ming", async () => {
  const actual = await vi.importActual<typeof import("@/services/person/ming")>(
    "@/services/person/ming",
  );
  return {
    ...actual,
    mingService: {
      ...actual.mingService,
      filterAndSort: vi.fn(() => [{ id: "mocked" } as unknown as MingFigure]),
    },
  };
});

import { mingService } from "@/services/person/ming";
import { MING_PERIODS } from "@/services/person/ming/types";
import { useMingFigureStore } from "./mingFigureStore";

describe("mingFigureStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMingFigureStore.setState({
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
    expect(useMingFigureStore.getState().filters.sortBy).toBe("birthYear");
  });

  it("getRoleOptions:cabinet / eunuch 替代 chancellor / scholar(明朝阁老/宦官)", () => {
    expect(useMingFigureStore.getState().getRoleOptions()).toEqual([
      "全部",
      "emperor",
      "cabinet",
      "general",
      "official",
      "eunuch",
      "other",
    ]);
  });

  it("getPeriodOptions:['全部', ...MING_PERIODS.map(p => p.name)]", () => {
    const opts = useMingFigureStore.getState().getPeriodOptions();
    expect(opts[0]).toBe("全部");
    expect(opts.slice(1)).toEqual(MING_PERIODS.map((p) => p.name));
    expect(opts).toHaveLength(MING_PERIODS.length + 1);
  });

  it("getFilteredFigures:走 mingService.filterAndSort(searchQuery→query)", () => {
    useMingFigureStore.setState({
      figures: [],
      filters: {
        role: "cabinet",
        period: "明中（1488-1572）",
        searchQuery: "张",
        sortBy: "name",
      },
    });

    const r = useMingFigureStore.getState().getFilteredFigures();

    expect(mingService.filterAndSort).toHaveBeenCalledTimes(1);
    expect(mingService.filterAndSort).toHaveBeenCalledWith([], {
      role: "cabinet",
      period: "明中（1488-1572）",
      query: "张",
      sortBy: "name",
    });
    expect(r).toEqual([{ id: "mocked" }]);
  });
});
