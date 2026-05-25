/**
 * useDynastiesExpanded Hook 单元测试 (§2.8)
 *
 * 覆盖目标:
 * - 初始化:用 dynastiesStorage.getExpanded() 作为 useState 初值
 * - isDynastyExpanded:默认展开(undefined / true 都返回 true,只有显式 false 才返回 false)
 * - setDynastyExpanded:更新单条 + useEffect 持久化到 localStorage
 * - toggleDynasty:翻转当前状态
 * - expandAll(ids) / collapseAll(ids):只动传入 ids
 * - toggleAll(ids):全展开则收起,否则展开
 * - areAllExpanded / areAllCollapsed:对 ids 做全员检查(undefined 视为展开)
 * - expandAllDynasties / collapseAllDynasties:无参版,基于已有 ids 或 default 24 朝代
 * - getExpandedDynastiesCount:基于固定 24 朝代列表 + undefined/true 计入 / 显式 false 不计入
 * - getTotalDynastiesCount:固定返回 24
 * - 跨标签页:StorageListener 收到 DYNASTIES_EXPANDED 事件 → 回填整个 expandedStates
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { STORAGE_KEYS } from "@/utils/storage";
import { useDynastiesExpanded } from "./useDynastiesExpanded";

describe("useDynastiesExpanded", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.spyOn(console, "debug").mockImplementation(() => {});
  });

  describe("初始化", () => {
    it("localStorage 无值 → 初值 {}", () => {
      const { result } = renderHook(() => useDynastiesExpanded());
      expect(result.current.expandedStates).toEqual({});
    });

    it("localStorage 已存对象 → 初值原样恢复", () => {
      localStorage.setItem(
        STORAGE_KEYS.DYNASTIES_EXPANDED,
        JSON.stringify({ tang: true, song: false }),
      );
      const { result } = renderHook(() => useDynastiesExpanded());
      expect(result.current.expandedStates).toEqual({
        tang: true,
        song: false,
      });
    });
  });

  describe("isDynastyExpanded", () => {
    it("undefined 视为展开(默认展开规则)", () => {
      const { result } = renderHook(() => useDynastiesExpanded());
      expect(result.current.isDynastyExpanded("tang")).toBe(true);
    });

    it("显式 true → 展开 / 显式 false → 收起", () => {
      localStorage.setItem(
        STORAGE_KEYS.DYNASTIES_EXPANDED,
        JSON.stringify({ tang: true, song: false }),
      );
      const { result } = renderHook(() => useDynastiesExpanded());
      expect(result.current.isDynastyExpanded("tang")).toBe(true);
      expect(result.current.isDynastyExpanded("song")).toBe(false);
    });
  });

  describe("setDynastyExpanded", () => {
    it("写入单条 + 触发 useEffect 持久化到 localStorage", () => {
      const { result } = renderHook(() => useDynastiesExpanded());
      act(() => result.current.setDynastyExpanded("tang", false));
      expect(result.current.expandedStates).toEqual({ tang: false });
      expect(localStorage.getItem(STORAGE_KEYS.DYNASTIES_EXPANDED)).toBe(
        JSON.stringify({ tang: false }),
      );
    });

    it("追加新 id 不影响已有", () => {
      const { result } = renderHook(() => useDynastiesExpanded());
      act(() => result.current.setDynastyExpanded("tang", false));
      act(() => result.current.setDynastyExpanded("song", true));
      expect(result.current.expandedStates).toEqual({
        tang: false,
        song: true,
      });
    });
  });

  describe("toggleDynasty", () => {
    it("默认展开 → toggle 一次变 false", () => {
      const { result } = renderHook(() => useDynastiesExpanded());
      // 一开始没记录 → isDynastyExpanded 返回 true(默认展开)
      expect(result.current.isDynastyExpanded("tang")).toBe(true);
      act(() => result.current.toggleDynasty("tang"));
      expect(result.current.isDynastyExpanded("tang")).toBe(false);
    });

    it("再 toggle 一次 → 回到 true", () => {
      const { result } = renderHook(() => useDynastiesExpanded());
      act(() => result.current.toggleDynasty("tang"));
      act(() => result.current.toggleDynasty("tang"));
      expect(result.current.isDynastyExpanded("tang")).toBe(true);
    });
  });

  describe("expandAll / collapseAll(传入 ids)", () => {
    it("expandAll 把 ids 都置 true,不动其它", () => {
      const { result } = renderHook(() => useDynastiesExpanded());
      act(() => result.current.setDynastyExpanded("other", false));
      act(() => result.current.expandAll(["tang", "song"]));
      expect(result.current.expandedStates).toEqual({
        other: false,
        tang: true,
        song: true,
      });
    });

    it("collapseAll 把 ids 都置 false,不动其它", () => {
      const { result } = renderHook(() => useDynastiesExpanded());
      act(() => result.current.setDynastyExpanded("other", true));
      act(() => result.current.collapseAll(["tang", "song"]));
      expect(result.current.expandedStates).toEqual({
        other: true,
        tang: false,
        song: false,
      });
    });
  });

  describe("toggleAll(传入 ids)", () => {
    it("全部展开时 → 全收起", () => {
      const { result } = renderHook(() => useDynastiesExpanded());
      // 初始全 undefined → areAllExpanded(ids) 返回 true → 走 collapseAll 分支
      act(() => result.current.toggleAll(["tang", "song"]));
      expect(result.current.expandedStates).toEqual({
        tang: false,
        song: false,
      });
    });

    it("不是全部展开(任一为 false)→ 全部展开", () => {
      const { result } = renderHook(() => useDynastiesExpanded());
      act(() => result.current.setDynastyExpanded("tang", false));
      act(() => result.current.toggleAll(["tang", "song"]));
      expect(result.current.expandedStates).toEqual({
        tang: true,
        song: true,
      });
    });
  });

  describe("areAllExpanded / areAllCollapsed", () => {
    it("undefined 视为展开,areAllExpanded 全 true", () => {
      const { result } = renderHook(() => useDynastiesExpanded());
      expect(result.current.areAllExpanded(["a", "b", "c"])).toBe(true);
      expect(result.current.areAllCollapsed(["a", "b", "c"])).toBe(false);
    });

    it("任一显式 false → 不是全展开", () => {
      const { result } = renderHook(() => useDynastiesExpanded());
      act(() => result.current.setDynastyExpanded("a", false));
      expect(result.current.areAllExpanded(["a", "b"])).toBe(false);
    });

    it("全部显式 false → areAllCollapsed=true", () => {
      const { result } = renderHook(() => useDynastiesExpanded());
      act(() => result.current.collapseAll(["a", "b"]));
      expect(result.current.areAllCollapsed(["a", "b"])).toBe(true);
    });
  });

  describe("expandAllDynasties / collapseAllDynasties(无参版)", () => {
    it("已有 ids 时优先用已有 ids", () => {
      const { result } = renderHook(() => useDynastiesExpanded());
      act(() => result.current.setDynastyExpanded("custom1", false));
      act(() => result.current.setDynastyExpanded("custom2", false));
      act(() => result.current.expandAllDynasties());
      expect(result.current.expandedStates).toEqual({
        custom1: true,
        custom2: true,
      });
    });

    it("从空 state 开始 → 走 default 24 朝代列表", () => {
      const { result } = renderHook(() => useDynastiesExpanded());
      act(() => result.current.expandAllDynasties());
      // 24 个 default id 都应该被置 true
      expect(Object.keys(result.current.expandedStates)).toHaveLength(24);
      expect(result.current.expandedStates["tang"]).toBe(true);
      expect(result.current.expandedStates["qing"]).toBe(true);
    });

    it("collapseAllDynasties(无参)同样走 default 24 朝代", () => {
      const { result } = renderHook(() => useDynastiesExpanded());
      act(() => result.current.collapseAllDynasties());
      expect(Object.keys(result.current.expandedStates)).toHaveLength(24);
      expect(result.current.expandedStates["tang"]).toBe(false);
      expect(result.current.expandedStates["qing"]).toBe(false);
    });
  });

  describe("getExpandedDynastiesCount / getTotalDynastiesCount", () => {
    it("无 state → 24 个都默认展开,count=24", () => {
      const { result } = renderHook(() => useDynastiesExpanded());
      expect(result.current.getExpandedDynastiesCount()).toBe(24);
    });

    it("getTotalDynastiesCount 固定 24", () => {
      const { result } = renderHook(() => useDynastiesExpanded());
      expect(result.current.getTotalDynastiesCount()).toBe(24);
    });

    it("显式 false 的不计入 expandedCount(仅算 default 24 中的)", () => {
      const { result } = renderHook(() => useDynastiesExpanded());
      // 注:getExpandedDynastiesCount 只看固定 24 个 default id;
      // 'tang' 与 'qing' 都在 default 列表里 → 各扣 1
      act(() => result.current.setDynastyExpanded("tang", false));
      act(() => result.current.setDynastyExpanded("qing", false));
      expect(result.current.getExpandedDynastiesCount()).toBe(22);
    });

    it("不在 default 24 列表的 id 显式 false 不影响 expandedCount", () => {
      const { result } = renderHook(() => useDynastiesExpanded());
      // 'song' 不在 default 列表里(default 用的是 beisong/nansong)
      act(() => result.current.setDynastyExpanded("song", false));
      act(() => result.current.setDynastyExpanded("custom", false));
      expect(result.current.getExpandedDynastiesCount()).toBe(24);
    });

    it("undefined 与 true 都计入 expandedCount(默认展开规则)", () => {
      const { result } = renderHook(() => useDynastiesExpanded());
      act(() => result.current.setDynastyExpanded("tang", true));
      // 只显式标记一个 true,其它 23 个都是 undefined,合计仍 24
      expect(result.current.getExpandedDynastiesCount()).toBe(24);
    });
  });

  describe("跨标签页同步", () => {
    it("收到 DYNASTIES_EXPANDED storage 事件 → 回填整个 expandedStates", () => {
      const { result } = renderHook(() => useDynastiesExpanded());
      expect(result.current.expandedStates).toEqual({});

      const incoming = { tang: false, song: true };
      act(() => {
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: STORAGE_KEYS.DYNASTIES_EXPANDED,
            oldValue: JSON.stringify({}),
            newValue: JSON.stringify(incoming),
          }),
        );
      });

      expect(result.current.expandedStates).toEqual(incoming);
    });

    it("其它 key 的 storage 事件被忽略", () => {
      const { result } = renderHook(() => useDynastiesExpanded());
      act(() => {
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "some-other-key",
            oldValue: JSON.stringify({}),
            newValue: JSON.stringify({ tang: false }),
          }),
        );
      });
      expect(result.current.expandedStates).toEqual({});
    });

    it("卸载后再触发 storage 事件不抛", () => {
      const { unmount } = renderHook(() => useDynastiesExpanded());
      unmount();
      expect(() => {
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: STORAGE_KEYS.DYNASTIES_EXPANDED,
            oldValue: JSON.stringify({}),
            newValue: JSON.stringify({ tang: false }),
          }),
        );
      }).not.toThrow();
    });
  });
});
