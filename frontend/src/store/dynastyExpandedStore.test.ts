/**
 * dynastyExpandedStore 单元测试 (§2.8)
 *
 * 覆盖目标:
 * - 初始 state:expandedStates 从 dynastiesStorage 读取(默认 {})、dynastyIds 默认 []
 * - isDynastyExpanded:默认 true(undefined ≠ false),只有显式 false 才返回 false
 * - setDynastyExpanded:写 state + 持久化到 localStorage(走 dynastiesStorage)
 * - toggleDynasty:翻转当前值,默认 true → 显式 false → 再 toggle → true
 * - expandAllDynasties / collapseAllDynasties:只动 dynastyIds 内的 id,其它保留
 * - getExpandedDynastiesCount / getTotalDynastiesCount
 * - setDynastyIds:写入 ids 数组
 * - 跨标签页 StorageListener:storage 事件触发回调时把新值灌进 store
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useDynastiesStore } from "./dynastyExpandedStore";
import { STORAGE_KEYS } from "@/utils/storage";

describe("dynastyExpandedStore", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    // 把 store 重置到一个干净起点
    useDynastiesStore.setState({
      expandedStates: {},
      dynastyIds: [],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe("isDynastyExpanded", () => {
    it("从未设置过的 id → 默认 true(展开)", () => {
      expect(useDynastiesStore.getState().isDynastyExpanded("tang")).toBe(true);
    });

    it("显式置 true → true", () => {
      useDynastiesStore.setState({ expandedStates: { tang: true } });
      expect(useDynastiesStore.getState().isDynastyExpanded("tang")).toBe(true);
    });

    it("显式置 false → false", () => {
      useDynastiesStore.setState({ expandedStates: { tang: false } });
      expect(useDynastiesStore.getState().isDynastyExpanded("tang")).toBe(
        false,
      );
    });
  });

  describe("setDynastyExpanded", () => {
    it("写 state + 持久化到 localStorage", () => {
      useDynastiesStore.getState().setDynastyExpanded("tang", false);

      expect(useDynastiesStore.getState().expandedStates.tang).toBe(false);
      const stored = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.DYNASTIES_EXPANDED) ?? "{}",
      );
      expect(stored.tang).toBe(false);
    });

    it("再写另一个 id 不覆盖已有 id", () => {
      useDynastiesStore.getState().setDynastyExpanded("tang", false);
      useDynastiesStore.getState().setDynastyExpanded("song", true);

      const s = useDynastiesStore.getState().expandedStates;
      expect(s.tang).toBe(false);
      expect(s.song).toBe(true);
    });
  });

  describe("toggleDynasty", () => {
    it("默认(true) → toggle 一次 → false", () => {
      useDynastiesStore.getState().toggleDynasty("tang");
      expect(useDynastiesStore.getState().expandedStates.tang).toBe(false);
    });

    it("两次 toggle 回到原状(true)", () => {
      useDynastiesStore.getState().toggleDynasty("tang"); // → false
      useDynastiesStore.getState().toggleDynasty("tang"); // → true
      expect(useDynastiesStore.getState().expandedStates.tang).toBe(true);
    });

    it("toggle 也走持久化路径", () => {
      useDynastiesStore.getState().toggleDynasty("song");
      const stored = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.DYNASTIES_EXPANDED) ?? "{}",
      );
      expect(stored.song).toBe(false);
    });
  });

  describe("expandAllDynasties / collapseAllDynasties", () => {
    it("expandAll 把 dynastyIds 内全部置 true", () => {
      useDynastiesStore.setState({
        dynastyIds: ["tang", "song", "yuan"],
        expandedStates: { tang: false, song: false, yuan: false },
      });

      useDynastiesStore.getState().expandAllDynasties();

      const s = useDynastiesStore.getState().expandedStates;
      expect(s.tang).toBe(true);
      expect(s.song).toBe(true);
      expect(s.yuan).toBe(true);
    });

    it("collapseAll 把 dynastyIds 内全部置 false", () => {
      useDynastiesStore.setState({
        dynastyIds: ["tang", "song"],
        expandedStates: { tang: true, song: true },
      });

      useDynastiesStore.getState().collapseAllDynasties();

      const s = useDynastiesStore.getState().expandedStates;
      expect(s.tang).toBe(false);
      expect(s.song).toBe(false);
    });

    it("expandAll/collapseAll 不动 dynastyIds 之外的字段", () => {
      useDynastiesStore.setState({
        dynastyIds: ["tang"],
        expandedStates: { tang: false, alien: false },
      });

      useDynastiesStore.getState().expandAllDynasties();

      const s = useDynastiesStore.getState().expandedStates;
      expect(s.tang).toBe(true);
      expect(s.alien).toBe(false); // 不在 ids 里,保持原状
    });

    it("expandAll 也写 localStorage", () => {
      useDynastiesStore.setState({ dynastyIds: ["tang"] });
      useDynastiesStore.getState().expandAllDynasties();

      const stored = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.DYNASTIES_EXPANDED) ?? "{}",
      );
      expect(stored.tang).toBe(true);
    });
  });

  describe("getExpandedDynastiesCount / getTotalDynastiesCount", () => {
    it("getTotal = dynastyIds.length", () => {
      useDynastiesStore.setState({ dynastyIds: ["a", "b", "c"] });
      expect(useDynastiesStore.getState().getTotalDynastiesCount()).toBe(3);
    });

    it("getExpanded 数:undefined / true 计入,只有显式 false 不计入", () => {
      useDynastiesStore.setState({
        dynastyIds: ["a", "b", "c", "d"],
        expandedStates: { a: true, b: false, c: true /* d undefined */ },
      });
      // a(true) + c(true) + d(undefined,默认展开) = 3
      expect(useDynastiesStore.getState().getExpandedDynastiesCount()).toBe(3);
    });

    it("dynastyIds 为空时:total=0, expanded=0", () => {
      expect(useDynastiesStore.getState().getTotalDynastiesCount()).toBe(0);
      expect(useDynastiesStore.getState().getExpandedDynastiesCount()).toBe(0);
    });
  });

  describe("setDynastyIds", () => {
    it("写入 ids 数组", () => {
      useDynastiesStore.getState().setDynastyIds(["tang", "song"]);
      expect(useDynastiesStore.getState().dynastyIds).toEqual(["tang", "song"]);
    });

    it("传空数组 → 清空", () => {
      useDynastiesStore.setState({ dynastyIds: ["a", "b"] });
      useDynastiesStore.getState().setDynastyIds([]);
      expect(useDynastiesStore.getState().dynastyIds).toEqual([]);
    });
  });

  describe("跨标签页 StorageListener 同步", () => {
    it("storage 事件命中 DYNASTIES_EXPANDED key → 把新值写入 store", () => {
      // 模块加载时已 addListener,直接派发 storage 事件即可触发
      const event = new StorageEvent("storage", {
        key: STORAGE_KEYS.DYNASTIES_EXPANDED,
        oldValue: JSON.stringify({ tang: true }),
        newValue: JSON.stringify({ tang: false, song: true }),
      });
      window.dispatchEvent(event);

      const s = useDynastiesStore.getState().expandedStates;
      expect(s.tang).toBe(false);
      expect(s.song).toBe(true);
    });

    it("无关 key 的 storage 事件 → 不影响 store", () => {
      useDynastiesStore.setState({ expandedStates: { tang: true } });

      const event = new StorageEvent("storage", {
        key: "some-other-key",
        oldValue: null,
        newValue: JSON.stringify({ noise: true }),
      });
      window.dispatchEvent(event);

      expect(useDynastiesStore.getState().expandedStates).toEqual({
        tang: true,
      });
    });
  });
});
