/**
 * styleStore 单元测试 (§2.8)
 *
 * 覆盖目标:
 * - setStyle:合法值 → 写 localStorage + 设 data-style + 更新 state;
 *            非法值 → console.warn 且不改 state
 * - toggleStyle:glass ↔ classic 互换 + 持久化 + DOM
 * - initializeStyle:从存储恢复 + 写 DOM
 * - getSavedStyle:localStorage 抛错时 console.warn 并回落 DEFAULT_STYLE
 * - saveStyle:setItem 抛错时 console.warn 但不抛
 * - 命名导出 initializeStyle 函数:读存储并写 DOM(不动 store)
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useStyleStore, initializeStyle } from "./styleStore";
import { STYLE_STORAGE_KEY, DEFAULT_STYLE } from "@/config/styles/types";

describe("styleStore", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-style");
    vi.spyOn(console, "warn").mockImplementation(() => {});
    useStyleStore.setState({ style: DEFAULT_STYLE });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe("setStyle", () => {
    it("合法值 → 写入 localStorage + DOM + state", () => {
      useStyleStore.getState().setStyle("classic");

      expect(useStyleStore.getState().style).toBe("classic");
      expect(localStorage.getItem(STYLE_STORAGE_KEY)).toBe("classic");
      expect(document.documentElement.getAttribute("data-style")).toBe(
        "classic",
      );
    });

    it("非法值 → console.warn 且 state/DOM 不变", () => {
      useStyleStore.getState().setStyle("neon" as never);

      expect(useStyleStore.getState().style).toBe(DEFAULT_STYLE);
      expect(localStorage.getItem(STYLE_STORAGE_KEY)).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("Invalid style value"),
      );
    });

    it("可以 setStyle('glass') 把已经是 classic 的 store 切回去", () => {
      useStyleStore.getState().setStyle("classic");
      useStyleStore.getState().setStyle("glass");
      expect(useStyleStore.getState().style).toBe("glass");
      expect(document.documentElement.getAttribute("data-style")).toBe("glass");
    });
  });

  describe("toggleStyle", () => {
    it("glass → classic", () => {
      useStyleStore.setState({ style: "glass" });
      useStyleStore.getState().toggleStyle();
      expect(useStyleStore.getState().style).toBe("classic");
      expect(localStorage.getItem(STYLE_STORAGE_KEY)).toBe("classic");
      expect(document.documentElement.getAttribute("data-style")).toBe(
        "classic",
      );
    });

    it("classic → glass", () => {
      useStyleStore.setState({ style: "classic" });
      useStyleStore.getState().toggleStyle();
      expect(useStyleStore.getState().style).toBe("glass");
      expect(localStorage.getItem(STYLE_STORAGE_KEY)).toBe("glass");
      expect(document.documentElement.getAttribute("data-style")).toBe("glass");
    });
  });

  describe("initializeStyle(store action)", () => {
    it("从 localStorage 恢复 style,并写 DOM", () => {
      localStorage.setItem(STYLE_STORAGE_KEY, "classic");

      useStyleStore.getState().initializeStyle();

      expect(useStyleStore.getState().style).toBe("classic");
      expect(document.documentElement.getAttribute("data-style")).toBe(
        "classic",
      );
    });

    it("localStorage 没值时回落 DEFAULT_STYLE", () => {
      useStyleStore.getState().initializeStyle();

      expect(useStyleStore.getState().style).toBe(DEFAULT_STYLE);
      expect(document.documentElement.getAttribute("data-style")).toBe(
        DEFAULT_STYLE,
      );
    });

    it("localStorage 存的是非法值 → 回落 DEFAULT_STYLE", () => {
      localStorage.setItem(STYLE_STORAGE_KEY, "neon");

      useStyleStore.getState().initializeStyle();

      expect(useStyleStore.getState().style).toBe(DEFAULT_STYLE);
    });
  });

  describe("localStorage 异常容错", () => {
    // happy-dom 的 Storage 是 Proxy:`set` 拦截对已有方法静默 no-op,
    // 必须走 Object.defineProperty 才能真正替换 getItem/setItem。
    it("getSavedStyle:getItem 抛错 → console.warn,回落 DEFAULT_STYLE", () => {
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
        useStyleStore.getState().initializeStyle();

        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining("Failed to read style"),
          expect.any(Error),
        );
        expect(useStyleStore.getState().style).toBe(DEFAULT_STYLE);
      } finally {
        Object.defineProperty(window.localStorage, "getItem", {
          value: originalGetItem,
          configurable: true,
          writable: true,
        });
      }
    });

    it("saveStyle:setItem 抛错 → console.warn,但不抛", () => {
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
        expect(() =>
          useStyleStore.getState().setStyle("classic"),
        ).not.toThrow();
        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining("Failed to save style"),
          expect.any(Error),
        );
        // state 在 saveStyle 之后被写,故仍然生效
        expect(useStyleStore.getState().style).toBe("classic");
      } finally {
        Object.defineProperty(window.localStorage, "setItem", {
          value: originalSetItem,
          configurable: true,
          writable: true,
        });
      }
    });
  });

  describe("命名导出 initializeStyle()", () => {
    it("读 localStorage + 写 DOM,但不接触 store(纯 DOM 副作用)", () => {
      localStorage.setItem(STYLE_STORAGE_KEY, "classic");
      // 故意把 store 设置成 glass,验证函数不会改 store
      useStyleStore.setState({ style: "glass" });

      initializeStyle();

      expect(document.documentElement.getAttribute("data-style")).toBe(
        "classic",
      );
      expect(useStyleStore.getState().style).toBe("glass");
    });

    it("没存值时也写入 DEFAULT_STYLE 到 DOM", () => {
      initializeStyle();
      expect(document.documentElement.getAttribute("data-style")).toBe(
        DEFAULT_STYLE,
      );
    });
  });
});
