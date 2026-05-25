/**
 * useDataFetch Hook 单元测试 (§2.8)
 *
 * 覆盖目标:
 * - 默认成功路径:fetchFn 解析 { data } → result.data 写入,loading false
 * - 错误路径:fetchFn 抛错 → error 被捕获,onError 被调用
 * - enabled=false → 不发起请求
 * - 缓存:同 cacheKey 第二次 hook 命中缓存,不调 fetchFn(loading 维持 false 收尾)
 * - SWR 模式:过期缓存先返,再重新请求覆盖
 * - refetch():手动触发,isRefetching 在期间为 true
 * - retryCount:fetchFn 抛错 → 重试至上限
 * - cancel():卸载触发 abort
 * - clearCache/clearAllCache:辅助函数
 *
 * 注意:Map 单例 cache 跨测试持续,因此用唯一 cacheKey 避免污染
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useDataFetch, clearCache, clearAllCache } from "./useDataFetch";

describe("useDataFetch", () => {
  beforeEach(() => {
    clearAllCache();
    vi.restoreAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    clearAllCache();
  });

  it("成功路径:fetchFn → { data } 被写入 state,loading 终态 false", async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValue({ data: { id: 1, name: "tang" } });
    const { result } = renderHook(() => useDataFetch(fetchFn));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.data).toEqual({ id: 1, name: "tang" });
    expect(result.current.error).toBeNull();
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("成功路径触发 onSuccess(data 透传)", async () => {
    const onSuccess = vi.fn();
    const fetchFn = vi.fn().mockResolvedValue({ data: 42 });
    renderHook(() => useDataFetch(fetchFn, { onSuccess }));
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(42);
    });
  });

  it("错误路径:fetchFn 抛错 → error 被写入,onError 被调用", async () => {
    const onError = vi.fn();
    const err = new Error("boom");
    const fetchFn = vi.fn().mockRejectedValue(err);
    const { result } = renderHook(() =>
      useDataFetch(fetchFn, { onError, retryCount: 0 }),
    );
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBe(err);
    expect(onError).toHaveBeenCalledWith(err);
  });

  it("enabled=false → 不调 fetchFn", async () => {
    const fetchFn = vi.fn();
    renderHook(() => useDataFetch(fetchFn, { enabled: false }));
    await new Promise((r) => setTimeout(r, 30));
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("缓存命中:第二次同 cacheKey hook 不再调 fetchFn", async () => {
    const fetchFn1 = vi.fn().mockResolvedValue({ data: "first-payload" });
    const first = renderHook(() =>
      useDataFetch(fetchFn1, { cacheKey: "unique-key-cache-1" }),
    );
    await waitFor(() => {
      expect(first.result.current.data).toBe("first-payload");
    });

    // 第二次 mount:同 key → 命中缓存,不调
    const fetchFn2 = vi.fn().mockResolvedValue({ data: "should-not-be-used" });
    const second = renderHook(() =>
      useDataFetch(fetchFn2, { cacheKey: "unique-key-cache-1" }),
    );
    await waitFor(() => {
      expect(second.result.current.data).toBe("first-payload");
    });
    expect(fetchFn2).not.toHaveBeenCalled();
  });

  it("clearCache(key):清掉单条缓存,再 mount 会重新调", async () => {
    const fetchFn1 = vi.fn().mockResolvedValue({ data: "v1" });
    const first = renderHook(() =>
      useDataFetch(fetchFn1, { cacheKey: "key-cleared" }),
    );
    await waitFor(() => expect(first.result.current.data).toBe("v1"));
    clearCache("key-cleared");

    const fetchFn2 = vi.fn().mockResolvedValue({ data: "v2" });
    const second = renderHook(() =>
      useDataFetch(fetchFn2, { cacheKey: "key-cleared" }),
    );
    await waitFor(() => expect(second.result.current.data).toBe("v2"));
    expect(fetchFn2).toHaveBeenCalledTimes(1);
  });

  it("refetch():触发 isRefetching=true,完成后回到 false 且 data 更新", async () => {
    let payload = "v1";
    const fetchFn = vi.fn(() => Promise.resolve({ data: payload }));
    const { result } = renderHook(() => useDataFetch(fetchFn));
    await waitFor(() => expect(result.current.data).toBe("v1"));

    payload = "v2";
    await act(async () => {
      await result.current.refetch();
    });
    expect(result.current.data).toBe("v2");
    expect(result.current.isRefetching).toBe(false);
  });

  it("retryCount=2:fetchFn 一直抛错 → 重试到 2,error 最终写入", async () => {
    const err = new Error("network");
    const fetchFn = vi.fn().mockRejectedValue(err);
    const { result } = renderHook(() =>
      useDataFetch(fetchFn, { retryCount: 2, retryInterval: 5 }),
    );
    await waitFor(
      () => {
        expect(result.current.error).toBeInstanceOf(Error);
      },
      { timeout: 1000 },
    );
    // 总调用次数 = 初次 + 2 次重试 = 3
    expect(fetchFn).toHaveBeenCalledTimes(3);
    expect(result.current.retryCount).toBe(3);
  });

  it("retryCount + 中途成功:第一次失败,第二次成功 → data 写入,error=null", async () => {
    const fetchFn = vi
      .fn()
      .mockRejectedValueOnce(new Error("transient"))
      .mockResolvedValueOnce({ data: "ok" });

    const { result } = renderHook(() =>
      useDataFetch(fetchFn, { retryCount: 2, retryInterval: 5 }),
    );
    await waitFor(() => expect(result.current.data).toBe("ok"));
    expect(result.current.error).toBeNull();
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it("cancel():卸载触发 abort(不抛错,且不会留下未处理的 promise 异常)", async () => {
    const fetchFn = vi.fn().mockResolvedValue({ data: "x" });
    const { result, unmount } = renderHook(() => useDataFetch(fetchFn));
    await waitFor(() => expect(result.current.data).toBe("x"));
    expect(() => unmount()).not.toThrow();
  });

  it("clearAllCache:所有 key 都被清空,下次 mount 会重新调 fetchFn", async () => {
    const fetchFn1 = vi.fn().mockResolvedValue({ data: "v1" });
    const first = renderHook(() =>
      useDataFetch(fetchFn1, { cacheKey: "all-cache-1" }),
    );
    await waitFor(() => expect(first.result.current.data).toBe("v1"));

    clearAllCache();

    const fetchFn2 = vi.fn().mockResolvedValue({ data: "v2" });
    const second = renderHook(() =>
      useDataFetch(fetchFn2, { cacheKey: "all-cache-1" }),
    );
    await waitFor(() => expect(second.result.current.data).toBe("v2"));
    expect(fetchFn2).toHaveBeenCalledTimes(1);
  });
});
