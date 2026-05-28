/**
 * dynastyStore 单元测试 (§2.8)
 *
 * 覆盖目标:
 * - 初始 state:dynasties=[] / selectedDynasty=null
 * - setters:setDynasties(同引用)/ setSelectedDynasty(含 null 清空)
 */
import { describe, it, expect, beforeEach } from "vitest";
import type { Dynasty } from "@/services/culture/types";
import { useDynastyStore } from "./dynastyStore";

function makeDynasty(overrides: Partial<Dynasty> = {}): Dynasty {
  return {
    id: overrides.id ?? "d-1",
    name: overrides.name ?? "唐",
    startYear: overrides.startYear ?? 618,
    ...overrides,
  };
}

describe("dynastyStore", () => {
  beforeEach(() => {
    useDynastyStore.setState({
      dynasties: [],
      selectedDynasty: null,
    });
  });

  describe("初始 state", () => {
    it("默认值齐全", () => {
      const s = useDynastyStore.getState();
      expect(s.dynasties).toEqual([]);
      expect(s.selectedDynasty).toBeNull();
    });
  });

  describe("setters", () => {
    it("setDynasties 写入数组(同一引用)", () => {
      const list = [makeDynasty({ id: "1" }), makeDynasty({ id: "2" })];
      useDynastyStore.getState().setDynasties(list);
      expect(useDynastyStore.getState().dynasties).toBe(list);
    });

    it("setSelectedDynasty 写入 Dynasty / null 清空", () => {
      const d = makeDynasty();
      useDynastyStore.getState().setSelectedDynasty(d);
      expect(useDynastyStore.getState().selectedDynasty).toBe(d);

      useDynastyStore.getState().setSelectedDynasty(null);
      expect(useDynastyStore.getState().selectedDynasty).toBeNull();
    });

    it("可根据最早开始时间补齐默认选中朝代", () => {
      const list = [
        makeDynasty({ id: "qing", name: "清", startYear: 1644 }),
        makeDynasty({ id: "han", name: "汉", startYear: -206 }),
        makeDynasty({ id: "tang", name: "唐", startYear: 618 }),
      ];
      useDynastyStore.getState().setDynasties(list);

      const firstDynasty = [...useDynastyStore.getState().dynasties].sort(
        (left, right) => left.startYear - right.startYear
      )[0];
      if (!firstDynasty) {
        throw new Error("expected a dynasty");
      }
      useDynastyStore.getState().setSelectedDynasty(firstDynasty);

      expect(useDynastyStore.getState().selectedDynasty?.id).toBe("han");
    });
  });
});
