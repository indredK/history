/**
 * themeStore 单元测试 (§2.8)
 *
 * 覆盖目标:
 * - 初始 state:从 localStorage 取值 / 没取到时回落 DEFAULT_THEME / 非法值兜底
 * - setTheme:合法值 → 写 localStorage + 设 data-theme + 更新 state;
 *            非法值 → console.warn 且不改 state
 * - toggleTheme:dark ↔ light 互换 + 持久化 + DOM
 * - initializeTheme:从存储恢复 + 写 DOM + 更新 prefersReducedMotion
 * - getSavedTheme:localStorage 抛错时 console.warn 并回落 DEFAULT_THEME
 * - saveTheme:setItem 抛错时 console.warn 但不抛
 * - 命名导出 initializeTheme 函数:读存储并写 DOM
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useThemeStore, initializeTheme } from "./themeStore";
import { THEME_STORAGE_KEY, DEFAULT_THEME } from "@/config/themeConfig";

describe("themeStore", () => {
  beforeEach(() => {
    // localStorage 清空,DOM 重置
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    vi.spyOn(console, "warn").mockImplementation(() => {});
    // 手动重置 store 到一个稳定的初值 — store 创建时已读过 localStorage,
    // 但每个用例之间我们都重新 setState
    useThemeStore.setState({
      theme: DEFAULT_THEME,
      prefersReducedMotion: false,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe("setTheme", () => {
    it("合法值 → 写入 localStorage + DOM + state", () => {
      useThemeStore.getState().setTheme("light");

      expect(useThemeStore.getState().theme).toBe("light");
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    });

    it("非法值 → console.warn 且 state/DOM 不变", () => {
      useThemeStore.getState().setTheme("rainbow" as never);

      expect(useThemeStore.getState().theme).toBe(DEFAULT_THEME);
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("Invalid theme value"),
      );
    });

    it("可以 setTheme('dark') 把已经是 light 的 store 切回去", () => {
      useThemeStore.getState().setTheme("light");
      useThemeStore.getState().setTheme("dark");
      expect(useThemeStore.getState().theme).toBe("dark");
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    });
  });

  describe("toggleTheme", () => {
    it("dark → light", () => {
      useThemeStore.setState({ theme: "dark" });
      useThemeStore.getState().toggleTheme();
      expect(useThemeStore.getState().theme).toBe("light");
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    });

    it("light → dark", () => {
      useThemeStore.setState({ theme: "light" });
      useThemeStore.getState().toggleTheme();
      expect(useThemeStore.getState().theme).toBe("dark");
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    });
  });

  describe("initializeTheme(store action)", () => {
    it("从 localStorage 恢复 theme,并写 DOM", () => {
      localStorage.setItem(THEME_STORAGE_KEY, "light");

      useThemeStore.getState().initializeTheme();

      expect(useThemeStore.getState().theme).toBe("light");
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    });

    it("localStorage 没值时回落 DEFAULT_THEME", () => {
      // 已经 clear,确保 setItem 没被调用
      useThemeStore.getState().initializeTheme();

      expect(useThemeStore.getState().theme).toBe(DEFAULT_THEME);
      expect(document.documentElement.getAttribute("data-theme")).toBe(
        DEFAULT_THEME,
      );
    });

    it("localStorage 存的是非法值 → 回落 DEFAULT_THEME", () => {
      localStorage.setItem(THEME_STORAGE_KEY, "neon");

      useThemeStore.getState().initializeTheme();

      expect(useThemeStore.getState().theme).toBe(DEFAULT_THEME);
    });

    it("prefersReducedMotion:matchMedia 返回 matches=true 时被记录", () => {
      // happy-dom 默认没有 prefers-reduced-motion,这里 stub matchMedia
      const matchMediaSpy = vi.spyOn(window, "matchMedia").mockReturnValue({
        matches: true,
      } as unknown as MediaQueryList);

      useThemeStore.getState().initializeTheme();

      expect(useThemeStore.getState().prefersReducedMotion).toBe(true);
      expect(matchMediaSpy).toHaveBeenCalledWith(
        "(prefers-reduced-motion: reduce)",
      );
    });

    it("prefersReducedMotion:matches=false → 记 false", () => {
      vi.spyOn(window, "matchMedia").mockReturnValue({
        matches: false,
      } as unknown as MediaQueryList);

      useThemeStore.getState().initializeTheme();
      expect(useThemeStore.getState().prefersReducedMotion).toBe(false);
    });
  });

  describe("localStorage 异常容错", () => {
    // happy-dom 的 Storage 是 Proxy:`set` 拦截会对已有方法名静默 no-op,
    // 必须走 Object.defineProperty(因为 defineProperty 拦截会真把 descriptor 落到 target)。
    it("getSavedTheme:getItem 抛错 → console.warn,回落 DEFAULT_THEME", () => {
      const originalGetItem = window.localStorage.getItem.bind(
        window.localStorage,
      );
      Object.defineProperty(window.localStorage, "getItem", {
        value: () => {
          throw new Error("blocked");
        },
        configurable: true,
        writable: true,
      });

      try {
        useThemeStore.getState().initializeTheme();

        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining("Failed to read theme"),
          expect.any(Error),
        );
        expect(useThemeStore.getState().theme).toBe(DEFAULT_THEME);
      } finally {
        Object.defineProperty(window.localStorage, "getItem", {
          value: originalGetItem,
          configurable: true,
          writable: true,
        });
      }
    });

    it("saveTheme:setItem 抛错 → console.warn,但不抛", () => {
      const originalSetItem = window.localStorage.setItem.bind(
        window.localStorage,
      );
      Object.defineProperty(window.localStorage, "setItem", {
        value: () => {
          throw new Error("quota exceeded");
        },
        configurable: true,
        writable: true,
      });

      try {
        expect(() => useThemeStore.getState().setTheme("light")).not.toThrow();
        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining("Failed to save theme"),
          expect.any(Error),
        );
        // state 仍然被更新(setTheme 在 saveTheme 之后调用 set,故仍然生效)
        expect(useThemeStore.getState().theme).toBe("light");
      } finally {
        Object.defineProperty(window.localStorage, "setItem", {
          value: originalSetItem,
          configurable: true,
          writable: true,
        });
      }
    });
  });

  describe("命名导出 initializeTheme()", () => {
    it("读 localStorage + 写 DOM,但不接触 store(纯 DOM 副作用)", () => {
      localStorage.setItem(THEME_STORAGE_KEY, "light");
      // 故意把 store 设置成 dark,验证函数不会改 store
      useThemeStore.setState({ theme: "dark" });

      initializeTheme();

      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
      // store 不会被这个独立函数动到
      expect(useThemeStore.getState().theme).toBe("dark");
    });

    it("没存值时也写入 DEFAULT_THEME 到 DOM", () => {
      initializeTheme();
      expect(document.documentElement.getAttribute("data-theme")).toBe(
        DEFAULT_THEME,
      );
    });
  });
});
