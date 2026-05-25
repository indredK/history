/**
 * timelineStore 单元测试 (§2.8)
 *
 * 覆盖目标:
 * - 初始 state:startYear=-500 / endYear=2000(覆盖中国通史范围)
 * - setYears:一次性写入两端年份(无任何校验,允许任意正负 / 倒置区间)
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useTimelineStore } from "./timelineStore";

describe("timelineStore", () => {
  beforeEach(() => {
    useTimelineStore.setState({ startYear: -500, endYear: 2000 });
  });

  describe("初始 state", () => {
    it("默认 startYear=-500 / endYear=2000", () => {
      const s = useTimelineStore.getState();
      expect(s.startYear).toBe(-500);
      expect(s.endYear).toBe(2000);
    });
  });

  describe("setYears", () => {
    it("一次性更新两端年份", () => {
      useTimelineStore.getState().setYears(618, 907);
      const s = useTimelineStore.getState();
      expect(s.startYear).toBe(618);
      expect(s.endYear).toBe(907);
    });

    it("允许负数(BC)", () => {
      useTimelineStore.getState().setYears(-2000, -1000);
      const s = useTimelineStore.getState();
      expect(s.startYear).toBe(-2000);
      expect(s.endYear).toBe(-1000);
    });

    it("不校验先后顺序(倒置区间也接受)", () => {
      // 锁定行为:store 不做防呆,由调用方负责
      useTimelineStore.getState().setYears(2000, -500);
      const s = useTimelineStore.getState();
      expect(s.startYear).toBe(2000);
      expect(s.endYear).toBe(-500);
    });
  });
});
