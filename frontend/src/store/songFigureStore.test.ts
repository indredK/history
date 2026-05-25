/**
 * songFigureStore 单元测试 (§2.8)
 *
 * 与 tangFigureStore 同构,差异点:
 * - service 用 songFigureServiceHelper
 * - roleOptions 用 'scholar' 替代 'poet'(宋朝的学者标签)
 * - periodOptions 走 SONG_PERIODS
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import type { SongFigure } from "@/services/person/song/types";

vi.mock("@/services/person/song", async () => {
  const actual = await vi.importActual<typeof import("@/services/person/song")>(
    "@/services/person/song",
  );
  return {
    ...actual,
    songFigureServiceHelper: {
      ...actual.songFigureServiceHelper,
      filterAndSort: vi.fn(() => [{ id: "mocked" } as unknown as SongFigure]),
    },
  };
});

import { songFigureServiceHelper } from "@/services/person/song";
import { SONG_PERIODS } from "@/services/person/song/types";
import { useSongFigureStore } from "./songFigureStore";

describe("songFigureStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSongFigureStore.setState({
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
    expect(useSongFigureStore.getState().filters.sortBy).toBe("birthYear");
  });

  it("getRoleOptions:scholar 替代 poet", () => {
    expect(useSongFigureStore.getState().getRoleOptions()).toEqual([
      "全部",
      "emperor",
      "chancellor",
      "general",
      "official",
      "scholar",
      "other",
    ]);
  });

  it("getPeriodOptions:['全部', ...SONG_PERIODS.map(p => p.name)]", () => {
    const opts = useSongFigureStore.getState().getPeriodOptions();
    expect(opts[0]).toBe("全部");
    expect(opts.slice(1)).toEqual(SONG_PERIODS.map((p) => p.name));
    expect(opts).toHaveLength(SONG_PERIODS.length + 1);
  });

  it("getFilteredFigures:走 songFigureServiceHelper.filterAndSort(searchQuery→query)", () => {
    useSongFigureStore.setState({
      figures: [],
      filters: {
        role: "scholar",
        period: "北宋（960-1127）",
        searchQuery: "苏",
        sortBy: "name",
      },
    });

    const r = useSongFigureStore.getState().getFilteredFigures();

    expect(songFigureServiceHelper.filterAndSort).toHaveBeenCalledTimes(1);
    expect(songFigureServiceHelper.filterAndSort).toHaveBeenCalledWith([], {
      role: "scholar",
      period: "北宋（960-1127）",
      query: "苏",
      sortBy: "name",
    });
    expect(r).toEqual([{ id: "mocked" }]);
  });
});
