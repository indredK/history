/**
 * emperorStore 单元测试 (§2.8)
 *
 * 覆盖目标:
 * - 初始 state:emperors=[] / selectedEmperor=null / loading=false / error=null /
 *              filters={dynasty:'全部', searchQuery:'', sortBy:'dynasty'}
 * - 全部 setters:setEmperors / setSelectedEmperor / setLoading / setError /
 *                setDynastyFilter / setSearchQuery / setSortBy
 * - getFilteredEmperors:透传 emperors + filters 给 emperorService.filterAndSort,
 *                       并把结果返回
 * - getDynastyOptions:['全部', ...uniq(emperors.dynasty)],去重保序
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Emperor } from "@/services/person/emperors/types";

// 必须在 import store 之前 mock
vi.mock("@/services/person/emperors", async () => {
  const actual = await vi.importActual<
    typeof import("@/services/person/emperors")
  >("@/services/person/emperors");
  return {
    ...actual,
    emperorService: {
      ...actual.emperorService,
      filterAndSort: vi.fn(() => [{ id: "mocked" } as unknown as Emperor]),
    },
  };
});

import { emperorService } from "@/services/person/emperors";
import { useEmperorStore } from "./emperorStore";

function makeEmperor(overrides: Partial<Emperor> = {}): Emperor {
  return {
    id: overrides.id ?? "e-1",
    name: overrides.name ?? "Taizong",
    dynasty: overrides.dynasty ?? "唐",
    reignStart: overrides.reignStart ?? 626,
    reignEnd: overrides.reignEnd ?? 649,
    eraNames: overrides.eraNames ?? [],
    achievements: overrides.achievements ?? [],
    failures: overrides.failures ?? [],
    evaluations: overrides.evaluations ?? [],
    sources: overrides.sources ?? [],
    ...overrides,
  };
}

describe("emperorStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useEmperorStore.setState({
      emperors: [],
      selectedEmperor: null,
      loading: false,
      error: null,
      filters: { dynasty: "全部", searchQuery: "", sortBy: "dynasty" },
    });
  });

  describe("初始 state", () => {
    it("默认值齐全", () => {
      const s = useEmperorStore.getState();
      expect(s.emperors).toEqual([]);
      expect(s.selectedEmperor).toBeNull();
      expect(s.loading).toBe(false);
      expect(s.error).toBeNull();
      expect(s.filters).toEqual({
        dynasty: "全部",
        searchQuery: "",
        sortBy: "dynasty",
      });
    });
  });

  describe("setters", () => {
    it("数据 / 选中 / 状态 三组 setter", () => {
      const list = [makeEmperor()];
      const one = list[0]!;
      useEmperorStore.getState().setEmperors(list);
      useEmperorStore.getState().setSelectedEmperor(one);
      useEmperorStore.getState().setLoading(true);
      useEmperorStore.getState().setError(new Error("x"));

      const s = useEmperorStore.getState();
      expect(s.emperors).toBe(list);
      expect(s.selectedEmperor).toBe(one);
      expect(s.loading).toBe(true);
      expect(s.error?.message).toBe("x");
    });

    it("filter setters 分别只动各自字段", () => {
      useEmperorStore.getState().setDynastyFilter("汉");
      expect(useEmperorStore.getState().filters).toEqual({
        dynasty: "汉",
        searchQuery: "",
        sortBy: "dynasty",
      });

      useEmperorStore.getState().setSearchQuery("武");
      expect(useEmperorStore.getState().filters).toEqual({
        dynasty: "汉",
        searchQuery: "武",
        sortBy: "dynasty",
      });

      useEmperorStore.getState().setSortBy("reignStart");
      expect(useEmperorStore.getState().filters).toEqual({
        dynasty: "汉",
        searchQuery: "武",
        sortBy: "reignStart",
      });
    });
  });

  describe("getFilteredEmperors", () => {
    it("把 emperors + filters 转换后传给 emperorService.filterAndSort,返回值原样透传", () => {
      const list = [makeEmperor({ id: "1" }), makeEmperor({ id: "2" })];
      useEmperorStore.setState({
        emperors: list,
        filters: {
          dynasty: "唐",
          searchQuery: "宗",
          sortBy: "reignStart",
        },
      });

      const r = useEmperorStore.getState().getFilteredEmperors();

      expect(emperorService.filterAndSort).toHaveBeenCalledTimes(1);
      expect(emperorService.filterAndSort).toHaveBeenCalledWith(list, {
        dynasty: "唐",
        query: "宗", // 注意:store 把 searchQuery → query
        sortBy: "reignStart",
      });
      expect(r).toEqual([{ id: "mocked" }]);
    });
  });

  describe("getDynastyOptions", () => {
    it("['全部', ...uniq(emperors.dynasty)] — 保序去重", () => {
      useEmperorStore.setState({
        emperors: [
          makeEmperor({ id: "1", dynasty: "唐" }),
          makeEmperor({ id: "2", dynasty: "宋" }),
          makeEmperor({ id: "3", dynasty: "唐" }), // 重复
          makeEmperor({ id: "4", dynasty: "明" }),
        ],
      });

      const opts = useEmperorStore.getState().getDynastyOptions();
      expect(opts).toEqual(["全部", "唐", "宋", "明"]);
    });

    it("emperors 为空 → ['全部']", () => {
      expect(useEmperorStore.getState().getDynastyOptions()).toEqual(["全部"]);
    });
  });
});
