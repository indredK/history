/**
 * useSidebar Hook 单元测试 (§2.8)
 *
 * 覆盖目标:
 * - 初始化:用 sidebarStorage.getCollapsed() 作为 useState 初值
 * - toggle:翻转 collapsed
 * - setCollapsed:直接覆写
 * - expand / collapse:固定到 false / true
 * - useEffect 持久化:每次 collapsed 变化都会调 sidebarStorage.setCollapsed(value)
 * - 跨标签页同步:StorageListener 收到 storage 事件后会回填 state(且新值 !== 当前值)
 * - 清理:卸载 hook 后 StorageListener 移除监听
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { STORAGE_KEYS } from "@/utils/storage";
import { useSidebar } from "./useSidebar";

describe("useSidebar", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    // 静默 console.debug,避免污染测试输出
    vi.spyOn(console, "debug").mockImplementation(() => {});
  });

  describe("初始化", () => {
    it("localStorage 无值 → 默认 collapsed=false", () => {
      const { result } = renderHook(() => useSidebar());
      expect(result.current.collapsed).toBe(false);
    });

    it("localStorage 已存 true → 初值 collapsed=true", () => {
      localStorage.setItem(
        STORAGE_KEYS.SIDEBAR_COLLAPSED,
        JSON.stringify(true),
      );
      const { result } = renderHook(() => useSidebar());
      expect(result.current.collapsed).toBe(true);
    });

    it("localStorage 已存 false → 初值 collapsed=false(关键回归:false 不被默认值覆盖)", () => {
      localStorage.setItem(
        STORAGE_KEYS.SIDEBAR_COLLAPSED,
        JSON.stringify(false),
      );
      const { result } = renderHook(() => useSidebar());
      expect(result.current.collapsed).toBe(false);
    });
  });

  describe("操作 API", () => {
    it("toggle:false → true → false", () => {
      const { result } = renderHook(() => useSidebar());
      expect(result.current.collapsed).toBe(false);

      act(() => result.current.toggle());
      expect(result.current.collapsed).toBe(true);

      act(() => result.current.toggle());
      expect(result.current.collapsed).toBe(false);
    });

    it("setCollapsed 直接覆写", () => {
      const { result } = renderHook(() => useSidebar());
      act(() => result.current.setCollapsed(true));
      expect(result.current.collapsed).toBe(true);

      act(() => result.current.setCollapsed(false));
      expect(result.current.collapsed).toBe(false);
    });

    it("expand → false / collapse → true(幂等)", () => {
      const { result } = renderHook(() => useSidebar());

      act(() => result.current.collapse());
      expect(result.current.collapsed).toBe(true);
      act(() => result.current.collapse()); // 再调一次,仍 true
      expect(result.current.collapsed).toBe(true);

      act(() => result.current.expand());
      expect(result.current.collapsed).toBe(false);
      act(() => result.current.expand()); // 再调一次,仍 false
      expect(result.current.collapsed).toBe(false);
    });
  });

  describe("useEffect 持久化", () => {
    it("首挂载即写一次 localStorage(把初值落盘)", () => {
      renderHook(() => useSidebar());
      expect(localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED)).toBe(
        JSON.stringify(false),
      );
    });

    it("collapsed 变化后自动同步到 localStorage", () => {
      const { result } = renderHook(() => useSidebar());

      act(() => result.current.collapse());
      expect(localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED)).toBe(
        JSON.stringify(true),
      );

      act(() => result.current.expand());
      expect(localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED)).toBe(
        JSON.stringify(false),
      );
    });
  });

  describe("跨标签页同步", () => {
    it("收到 storage 事件且 newValue !== 当前值 → 回填 state", () => {
      const { result } = renderHook(() => useSidebar());
      expect(result.current.collapsed).toBe(false);

      act(() => {
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: STORAGE_KEYS.SIDEBAR_COLLAPSED,
            oldValue: JSON.stringify(false),
            newValue: JSON.stringify(true),
          }),
        );
      });

      expect(result.current.collapsed).toBe(true);
    });

    it("storage 事件中 newValue === 当前值 → 不重复 setState(无副作用)", () => {
      const { result } = renderHook(() => useSidebar());
      expect(result.current.collapsed).toBe(false);

      // 与当前值相同,不应触发额外渲染/落盘(只断言 state 不变)
      act(() => {
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: STORAGE_KEYS.SIDEBAR_COLLAPSED,
            oldValue: JSON.stringify(true),
            newValue: JSON.stringify(false),
          }),
        );
      });

      expect(result.current.collapsed).toBe(false);
    });

    it("其它 key 的 storage 事件被忽略", () => {
      const { result } = renderHook(() => useSidebar());

      act(() => {
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "some-other-key",
            oldValue: JSON.stringify(false),
            newValue: JSON.stringify(true),
          }),
        );
      });

      expect(result.current.collapsed).toBe(false);
    });

    it("卸载后再触发 storage 事件不会更新已卸载 hook(只验证不抛)", () => {
      const { result, unmount } = renderHook(() => useSidebar());
      expect(result.current.collapsed).toBe(false);

      unmount();

      expect(() => {
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: STORAGE_KEYS.SIDEBAR_COLLAPSED,
            oldValue: JSON.stringify(false),
            newValue: JSON.stringify(true),
          }),
        );
      }).not.toThrow();
    });
  });
});
