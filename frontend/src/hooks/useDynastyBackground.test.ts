/**
 * useDynastyBackground / useHasSelectedDynasty Hook 单元测试 (§2.8)
 *
 * 覆盖目标:
 * - 无 selectedDynasty 时 → 返回 var(--color-bg-gradient) + 透明 backgroundColor,
 *   且 useHasSelectedDynasty 返回 false
 * - 选中 dynasty + 无图(useDynastyImage 给 imageUrl=null)→ background 仍只是渐变,
 *   但 backgroundColor 不再透明
 * - 选中 dynasty + 有图 → background 拼接顺序:gradientBackground, url(图) ..., var(--color-bg-gradient)
 * - isMobile=true → 'scroll' 出现在 backgroundAttachment 与 url() 后缀
 * - isMobile=false → 'fixed' 出现在 backgroundAttachment 与 url() 后缀
 *
 * 设计:vi.mock useDynastyImage,稳定提供 imageUrl 值,避免触发真实 Image 异步加载
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDynastyStore } from "@/store";
import type { Dynasty } from "@/services/culture/types";

// 在 import 被测 hook 前 mock useDynastyImage(测试可单独修改其返回值)
const useDynastyImageMock = vi.fn(() => ({
  imageUrl: null as string | null,
  isLoading: false,
  error: null as Error | null,
}));
vi.mock("./useDynastyImage", () => ({
  useDynastyImage: (id: string | null) => useDynastyImageMock(),
}));

import {
  useDynastyBackground,
  useHasSelectedDynasty,
} from "./useDynastyBackground";

const fakeDynasty = (overrides: Partial<Dynasty> = {}): Dynasty =>
  ({
    id: "tang",
    name: "唐",
    color: "#FF8800",
    startYear: 618,
    endYear: 907,
    ...overrides,
  }) as unknown as Dynasty;

describe("useDynastyBackground / useHasSelectedDynasty", () => {
  beforeEach(() => {
    useDynastyStore.setState({ dynasties: [], selectedDynasty: null });
    useDynastyImageMock.mockReturnValue({
      imageUrl: null,
      isLoading: false,
      error: null,
    });
  });

  describe("useHasSelectedDynasty", () => {
    it("无选中 → false", () => {
      const { result } = renderHook(() => useHasSelectedDynasty());
      expect(result.current).toBe(false);
    });

    it("有选中 → true", () => {
      useDynastyStore.setState({ selectedDynasty: fakeDynasty() });
      const { result } = renderHook(() => useHasSelectedDynasty());
      expect(result.current).toBe(true);
    });
  });

  describe("useDynastyBackground", () => {
    it("无选中 → background 仅渐变 + backgroundColor=transparent", () => {
      const { result } = renderHook(() => useDynastyBackground());
      expect(result.current.background).toBe("var(--color-bg-gradient)");
      expect(result.current.backgroundColor).toBe("transparent");
      expect(result.current.backgroundSize).toBe("cover");
    });

    it("选中但无图 → background 仍只是 var(--color-bg-gradient),backgroundColor 已变", () => {
      useDynastyStore.setState({ selectedDynasty: fakeDynasty() });
      // imageUrl 仍是 null,走 else 分支
      const { result } = renderHook(() => useDynastyBackground());
      expect(result.current.background).toBe("var(--color-bg-gradient)");
      expect(result.current.backgroundColor).not.toBe("transparent");
    });

    it("选中 + 有图 → background 含 url(图) 与 linear-gradient", () => {
      useDynastyStore.setState({ selectedDynasty: fakeDynasty() });
      useDynastyImageMock.mockReturnValue({
        imageUrl: "/images/dynasties/tang.svg",
        isLoading: false,
        error: null,
      });
      const { result } = renderHook(() => useDynastyBackground());
      expect(result.current.background).toContain(
        "url(/images/dynasties/tang.svg)",
      );
      expect(result.current.background).toContain("linear-gradient");
      expect(result.current.background).toContain("var(--color-bg-gradient)");
    });

    it("isMobile=true → backgroundAttachment=scroll,url() 后缀 scroll", () => {
      useDynastyStore.setState({ selectedDynasty: fakeDynasty() });
      useDynastyImageMock.mockReturnValue({
        imageUrl: "/images/dynasties/tang.svg",
        isLoading: false,
        error: null,
      });
      const { result } = renderHook(() => useDynastyBackground(true));
      expect(result.current.backgroundAttachment).toBe("scroll");
      expect(result.current.background).toContain("center center scroll");
    });

    it("isMobile=false(默认)→ backgroundAttachment=fixed,url() 后缀 fixed", () => {
      useDynastyStore.setState({ selectedDynasty: fakeDynasty() });
      useDynastyImageMock.mockReturnValue({
        imageUrl: "/images/dynasties/tang.svg",
        isLoading: false,
        error: null,
      });
      const { result } = renderHook(() => useDynastyBackground());
      expect(result.current.backgroundAttachment).toBe("fixed");
      expect(result.current.background).toContain("center center fixed");
    });

    it("dynasty.color=undefined 时仍能拼出 background(走 dynastyUtils 默认色)", () => {
      useDynastyStore.setState({
        selectedDynasty: fakeDynasty({ color: undefined }),
      });
      const { result } = renderHook(() => useDynastyBackground());
      expect(result.current.background).toBe("var(--color-bg-gradient)");
      expect(typeof result.current.backgroundColor).toBe("string");
    });
  });
});
