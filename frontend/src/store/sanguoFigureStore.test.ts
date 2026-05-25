/**
 * sanguoFigureStore 单元测试 (§2.8)
 *
 * 覆盖目标:
 * - 初始 state:figures=[] / selectedFigure=null / loading=false / error=null /
 *              filters={role:'全部', kingdom:'全部', searchQuery:'', sortBy:'kingdom'}
 * - 全部 setters:setFigures / setSelectedFigure / setLoading / setError /
 *                setRoleFilter / setKingdomFilter / setSearchQuery / setSortBy
 * - getFilteredFigures:透传 figures + filters 给 sanguoFigureService.filterAndSort,
 *                      注意 store 把 searchQuery 改名为 query 传下去
 * - getRoleOptions:静态 ['全部', 'ruler', 'strategist', 'general', 'official', 'other']
 * - getKingdomOptions:静态 ['全部', '魏', '蜀', '吴', '其他']
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import type { SanguoFigure } from "@/services/person/sanguo/types";

// 必须在 import store 之前 mock
vi.mock("@/services/person/sanguo", async () => {
  const actual = await vi.importActual<
    typeof import("@/services/person/sanguo")
  >("@/services/person/sanguo");
  return {
    ...actual,
    sanguoFigureService: {
      ...actual.sanguoFigureService,
      filterAndSort: vi.fn(() => [{ id: "mocked" } as unknown as SanguoFigure]),
    },
  };
});

import { sanguoFigureService } from "@/services/person/sanguo";
import { useSanguoFigureStore } from "./sanguoFigureStore";

function makeFigure(overrides: Partial<SanguoFigure> = {}): SanguoFigure {
  return {
    id: overrides.id ?? "f-1",
    name: overrides.name ?? "诸葛亮",
    birthYear: overrides.birthYear ?? 181,
    deathYear: overrides.deathYear ?? 234,
    role: overrides.role ?? "strategist",
    kingdom: overrides.kingdom ?? "蜀",
    positions: overrides.positions ?? [],
    biography: overrides.biography ?? "卧龙",
    achievements: overrides.achievements ?? [],
    events: overrides.events ?? [],
    evaluations: overrides.evaluations ?? [],
    sources: overrides.sources ?? [],
    ...overrides,
  };
}

describe("sanguoFigureStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSanguoFigureStore.setState({
      figures: [],
      selectedFigure: null,
      loading: false,
      error: null,
      filters: {
        role: "全部",
        kingdom: "全部",
        searchQuery: "",
        sortBy: "kingdom",
      },
    });
  });

  describe("初始 state", () => {
    it("默认值齐全", () => {
      const s = useSanguoFigureStore.getState();
      expect(s.figures).toEqual([]);
      expect(s.selectedFigure).toBeNull();
      expect(s.loading).toBe(false);
      expect(s.error).toBeNull();
      expect(s.filters).toEqual({
        role: "全部",
        kingdom: "全部",
        searchQuery: "",
        sortBy: "kingdom",
      });
    });
  });

  describe("setters", () => {
    it("数据 / 选中 / 状态 三组 setter", () => {
      const list = [makeFigure()];
      const one = list[0]!;
      useSanguoFigureStore.getState().setFigures(list);
      useSanguoFigureStore.getState().setSelectedFigure(one);
      useSanguoFigureStore.getState().setLoading(true);
      useSanguoFigureStore.getState().setError(new Error("boom"));

      const s = useSanguoFigureStore.getState();
      expect(s.figures).toBe(list);
      expect(s.selectedFigure).toBe(one);
      expect(s.loading).toBe(true);
      expect(s.error?.message).toBe("boom");
    });

    it("setSelectedFigure(null) / setError(null) 清空", () => {
      useSanguoFigureStore.setState({
        selectedFigure: makeFigure(),
        error: new Error("x"),
      });
      useSanguoFigureStore.getState().setSelectedFigure(null);
      useSanguoFigureStore.getState().setError(null);
      expect(useSanguoFigureStore.getState().selectedFigure).toBeNull();
      expect(useSanguoFigureStore.getState().error).toBeNull();
    });

    it("filter setters 分别只动各自字段", () => {
      useSanguoFigureStore.getState().setRoleFilter("strategist");
      expect(useSanguoFigureStore.getState().filters).toEqual({
        role: "strategist",
        kingdom: "全部",
        searchQuery: "",
        sortBy: "kingdom",
      });

      useSanguoFigureStore.getState().setKingdomFilter("蜀");
      expect(useSanguoFigureStore.getState().filters).toEqual({
        role: "strategist",
        kingdom: "蜀",
        searchQuery: "",
        sortBy: "kingdom",
      });

      useSanguoFigureStore.getState().setSearchQuery("亮");
      expect(useSanguoFigureStore.getState().filters).toEqual({
        role: "strategist",
        kingdom: "蜀",
        searchQuery: "亮",
        sortBy: "kingdom",
      });

      useSanguoFigureStore.getState().setSortBy("name");
      expect(useSanguoFigureStore.getState().filters).toEqual({
        role: "strategist",
        kingdom: "蜀",
        searchQuery: "亮",
        sortBy: "name",
      });
    });
  });

  describe("getFilteredFigures", () => {
    it("把 figures + filters(searchQuery→query) 传给 sanguoFigureService.filterAndSort,返回值原样透传", () => {
      const list = [makeFigure({ id: "1" }), makeFigure({ id: "2" })];
      useSanguoFigureStore.setState({
        figures: list,
        filters: {
          role: "general",
          kingdom: "魏",
          searchQuery: "曹",
          sortBy: "name",
        },
      });

      const r = useSanguoFigureStore.getState().getFilteredFigures();

      expect(sanguoFigureService.filterAndSort).toHaveBeenCalledTimes(1);
      expect(sanguoFigureService.filterAndSort).toHaveBeenCalledWith(list, {
        role: "general",
        kingdom: "魏",
        query: "曹", // 注意:store 把 searchQuery → query
        sortBy: "name",
      });
      expect(r).toEqual([{ id: "mocked" }]);
    });
  });

  describe("getRoleOptions", () => {
    it("静态返回 6 个选项:['全部', 'ruler', 'strategist', 'general', 'official', 'other']", () => {
      expect(useSanguoFigureStore.getState().getRoleOptions()).toEqual([
        "全部",
        "ruler",
        "strategist",
        "general",
        "official",
        "other",
      ]);
    });

    it("返回值与 figures 无关(纯配置)", () => {
      useSanguoFigureStore.setState({ figures: [] });
      const empty = useSanguoFigureStore.getState().getRoleOptions();
      useSanguoFigureStore.setState({ figures: [makeFigure()] });
      const nonEmpty = useSanguoFigureStore.getState().getRoleOptions();
      expect(empty).toEqual(nonEmpty);
    });
  });

  describe("getKingdomOptions", () => {
    it("静态返回 5 个选项:['全部', '魏', '蜀', '吴', '其他']", () => {
      expect(useSanguoFigureStore.getState().getKingdomOptions()).toEqual([
        "全部",
        "魏",
        "蜀",
        "吴",
        "其他",
      ]);
    });

    it("返回值与 figures 无关(纯配置)", () => {
      useSanguoFigureStore.setState({ figures: [] });
      const empty = useSanguoFigureStore.getState().getKingdomOptions();
      useSanguoFigureStore.setState({ figures: [makeFigure()] });
      const nonEmpty = useSanguoFigureStore.getState().getKingdomOptions();
      expect(empty).toEqual(nonEmpty);
    });
  });
});
