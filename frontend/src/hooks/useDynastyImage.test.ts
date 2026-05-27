/**
 * useDynastyImage Hook 单元测试 (§2.8)
 *
 * 覆盖目标:
 * - dynastyId 为 null → state 重置(imageUrl=null, isLoading=false, error=null)
 * - dynastyId 切换 → 创建 new Image() 并以 /images/dynasties/{id}.svg 加载
 * - img.onload → imageUrl 写入 + isLoading=false + 缓存
 * - img.onerror → error 写入 + imageUrl=null + isLoading=false
 * - 二次访问同一 id → 缓存命中(不再 new Image),且立刻 imageUrl 就绪
 *
 * 实现细节:
 * - imageCache 是模块级单例,跨测试持续存在,因此每个测试用不同的 dynastyId
 * - 用 vi.stubGlobal('Image', ImageMock) 截获 new Image() 调用,
 *   记录每一个实例,测试代码手动触发 onload / onerror
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useDynastyImage } from "./useDynastyImage";

interface MockImage {
  src: string;
  onload: (() => void) | null;
  onerror: (() => void) | null;
}

let imageInstances: MockImage[] = [];

class ImageMock {
  src: string = "";
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor() {
    imageInstances.push(this as unknown as MockImage);
  }
}

describe("useDynastyImage", () => {
  beforeEach(() => {
    imageInstances = [];
    vi.stubGlobal("Image", ImageMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("dynastyId=null → 直接返回空 state,不创建 Image", () => {
    const { result } = renderHook(() => useDynastyImage(null));
    expect(result.current.imageUrl).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(imageInstances).toHaveLength(0);
  });

  it("初次加载某 id → isLoading=true,创建 Image 并设置 .svg url", () => {
    const { result } = renderHook(() => useDynastyImage("tang-unique-1"));
    // useEffect 在 mount 后同步触发 → state 立刻是 loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.imageUrl).toBeNull();
    expect(imageInstances).toHaveLength(1);
    expect(imageInstances[0]!.src).toBe("/images/dynasties/tang-unique-1.svg");
  });

  it("onload 触发 → imageUrl 写入 / isLoading=false / error 仍为 null", () => {
    const { result } = renderHook(() => useDynastyImage("song-unique-2"));
    act(() => {
      imageInstances[0]!.onload?.();
    });
    expect(result.current.imageUrl).toBe("/images/dynasties/song-unique-2.svg");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("onerror 触发 → error 写入 / imageUrl=null / isLoading=false", () => {
    const { result } = renderHook(() => useDynastyImage("missing-unique-3"));
    act(() => {
      imageInstances[0]!.onerror?.();
    });
    expect(result.current.imageUrl).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toMatch(/missing-unique-3/);
  });

  it("缓存命中:同一 id 第二次加载不再 new Image,且 imageUrl 立刻就绪", () => {
    // 第一次:正常加载并 onload
    const first = renderHook(() => useDynastyImage("yuan-cache-4"));
    act(() => {
      imageInstances[0]!.onload?.();
    });
    expect(first.result.current.imageUrl).toBe(
      "/images/dynasties/yuan-cache-4.svg",
    );

    // 第二次:同样的 id → 命中模块级缓存
    imageInstances = [];
    const second = renderHook(() => useDynastyImage("yuan-cache-4"));
    expect(imageInstances).toHaveLength(0);
    expect(second.result.current.imageUrl).toBe(
      "/images/dynasties/yuan-cache-4.svg",
    );
    expect(second.result.current.isLoading).toBe(false);
    expect(second.result.current.error).toBeNull();
  });

  it("id 切换:从有值 → null → 状态被重置", () => {
    const { result, rerender } = renderHook(
      ({ id }: { id: string | null }) => useDynastyImage(id),
      { initialProps: { id: "ming-toggle-5" as string | null } },
    );
    act(() => {
      imageInstances[0]!.onload?.();
    });
    expect(result.current.imageUrl).toBe("/images/dynasties/ming-toggle-5.svg");

    rerender({ id: null });
    expect(result.current.imageUrl).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
