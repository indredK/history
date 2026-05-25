/**
 * dataLoaders.ts 单元测试 (§2.8)
 *
 * 覆盖目标(全部对外 API):
 * - getResourcePath:相对路径透传 / 绝对路径加 base / base 末尾斜杠去重
 * - loadJsonData:成功返回 / response.ok=false 抛错 / 非 2xx 错误向上抛
 * - loadJsonArray:JSON 数组直接返回 / 单对象包成 [obj] / 错误兜底 []
 * - ResourceLoader.loadJson:命中缓存不走 fetch、未命中写缓存、useCache=false bypass
 * - ResourceLoader.clearCache:有 key 删指定项、无 key 全清
 * - ResourceLoader.getCacheInfo:返回 size 与 keys 列表
 * - DataLoadError:Error 子类身份与字段
 * - retryLoad:首次成功不重试 / 全失败包成 DataLoadError(含 originalError)/
 *   maxRetries=1 时不等待
 * - createLoadingState:返回默认 { data:null, loading:false, error:null }
 * - handleApiResponse(列表):success=true+数组、分页 data.data、单对象 → [obj]、
 *   success=false 抛错、直接数组、空兜底 []
 * - handleSingleApiResponse:success=true+data、success=false 抛错、无 success
 *   字段时直接返回 response.data、response.data 为空抛错
 * - createDataFetcher:'mock' 走 mock、'api' 走 api、默认 'mock'
 */
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  getResourcePath,
  loadJsonData,
  loadJsonArray,
  ResourceLoader,
  DataLoadError,
  retryLoad,
  createLoadingState,
  handleApiResponse,
  handleSingleApiResponse,
  createDataFetcher,
} from "./dataLoaders";

describe("getResourcePath", () => {
  it("相对路径不加前缀", () => {
    expect(getResourcePath("relative/path")).toBe("relative/path");
  });

  it('绝对路径在前面拼接 BASE_URL(默认 "/")', () => {
    // jsdom 下 import.meta.env.BASE_URL 默认 '/',
    // 实现里会把末尾斜杠去掉再拼 → '' + '/data/x.json'
    expect(getResourcePath("/data/x.json")).toBe("/data/x.json");
  });
});

describe("loadJsonData / loadJsonArray", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loadJsonData 成功时返回 fetch 的 JSON", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      statusText: "OK",
      json: () => Promise.resolve({ k: 1 }),
    } as unknown as Response);

    const data = await loadJsonData<{ k: number }>("/data/x.json");
    expect(data).toEqual({ k: 1 });
    expect(fetchSpy).toHaveBeenCalledOnce();
  });

  it("loadJsonData 在 response.ok=false 时抛错", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      statusText: "Not Found",
      json: () => Promise.resolve({}),
    } as unknown as Response);

    await expect(loadJsonData("/missing.json")).rejects.toThrow(/Not Found/);
  });

  it("loadJsonData 在 fetch 拒绝时把错误透传", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("network down"));
    await expect(loadJsonData("/x.json")).rejects.toThrow("network down");
  });

  it("loadJsonArray JSON 是数组时原样返回", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      statusText: "OK",
      json: () => Promise.resolve([1, 2, 3]),
    } as unknown as Response);

    const data = await loadJsonArray<number>("/arr.json");
    expect(data).toEqual([1, 2, 3]);
  });

  it("loadJsonArray JSON 是单对象时包成 [obj]", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      statusText: "OK",
      json: () => Promise.resolve({ k: 1 }),
    } as unknown as Response);

    const data = await loadJsonArray<{ k: number }>("/obj.json");
    expect(data).toEqual([{ k: 1 }]);
  });

  it("loadJsonArray fetch 失败时兜底返回空数组", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("boom"));
    const data = await loadJsonArray("/x.json");
    expect(data).toEqual([]);
  });
});

describe("ResourceLoader", () => {
  beforeEach(() => {
    ResourceLoader.clearCache();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    ResourceLoader.clearCache();
  });

  it("未命中缓存时调 fetch 并写入", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      statusText: "OK",
      json: () => Promise.resolve({ v: 1 }),
    } as unknown as Response);

    const data1 = await ResourceLoader.loadJson<{ v: number }>("/a.json");
    expect(data1).toEqual({ v: 1 });
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // 再读一次走缓存
    const data2 = await ResourceLoader.loadJson<{ v: number }>("/a.json");
    expect(data2).toEqual({ v: 1 });
    expect(fetchSpy).toHaveBeenCalledTimes(1); // 没有再次 fetch
  });

  it("useCache=false 时永远走 fetch", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      statusText: "OK",
      json: () => Promise.resolve({ v: 2 }),
    } as unknown as Response);

    await ResourceLoader.loadJson("/b.json", false);
    await ResourceLoader.loadJson("/b.json", false);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("clearCache(path) 只删指定项,clearCache() 清空全部", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      statusText: "OK",
      json: () => Promise.resolve({}),
    } as unknown as Response);

    await ResourceLoader.loadJson("/a.json");
    await ResourceLoader.loadJson("/b.json");
    expect(ResourceLoader.getCacheInfo().size).toBe(2);

    ResourceLoader.clearCache("/a.json");
    const info = ResourceLoader.getCacheInfo();
    expect(info.size).toBe(1);
    expect(info.keys).toEqual(["/b.json"]);

    ResourceLoader.clearCache();
    expect(ResourceLoader.getCacheInfo().size).toBe(0);
  });
});

describe("DataLoadError", () => {
  it("Error 子类,字段完整", () => {
    const cause = new Error("underlying");
    const err = new DataLoadError("failed", "/path", cause);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(DataLoadError);
    expect(err.name).toBe("DataLoadError");
    expect(err.message).toBe("failed");
    expect(err.path).toBe("/path");
    expect(err.originalError).toBe(cause);
  });

  it("originalError 可选", () => {
    const err = new DataLoadError("failed", "/path");
    expect(err.originalError).toBeUndefined();
  });
});

describe("retryLoad", () => {
  it("首次成功 → 不重试", async () => {
    const fn = vi.fn().mockResolvedValue("ok");
    const result = await retryLoad(fn, 3, 1);
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledOnce();
  });

  it("第二次成功 → 总共调 2 次", async () => {
    const fn = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error("fail-1"))
      .mockResolvedValueOnce("ok");

    const result = await retryLoad(fn, 3, 1);
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("全部失败时抛 DataLoadError 并保留 originalError", async () => {
    const finalErr = new Error("final");
    const fn = vi
      .fn<() => Promise<unknown>>()
      .mockRejectedValueOnce(new Error("a"))
      .mockRejectedValueOnce(new Error("b"))
      .mockRejectedValueOnce(finalErr);

    try {
      await retryLoad(fn, 3, 1);
      throw new Error("should not reach");
    } catch (e) {
      expect(e).toBeInstanceOf(DataLoadError);
      const err = e as DataLoadError;
      expect(err.originalError).toBe(finalErr);
      expect(err.path).toBe("unknown");
    }
  });

  it("maxRetries=1 时不等待", async () => {
    const fn = vi
      .fn<() => Promise<unknown>>()
      .mockRejectedValue(new Error("boom"));
    const start = Date.now();
    await expect(retryLoad(fn, 1, 5000)).rejects.toBeInstanceOf(DataLoadError);
    expect(Date.now() - start).toBeLessThan(200);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe("createLoadingState", () => {
  it("返回默认的 { data:null, loading:false, error:null }", () => {
    const s = createLoadingState<string>();
    expect(s).toEqual({ data: null, loading: false, error: null });
  });
});

describe("handleApiResponse(列表)", () => {
  it("success=true + 数组数据 → 透传", () => {
    const r = handleApiResponse<number>({
      data: { success: true, data: [1, 2, 3] },
    });
    expect(r.data).toEqual([1, 2, 3]);
  });

  it("success=true + 分页响应 data.data → 解包内层", () => {
    const r = handleApiResponse<number>({
      data: { success: true, data: { data: [4, 5] } },
    });
    expect(r.data).toEqual([4, 5]);
  });

  it("success=true + 单对象 → 包成 [obj]", () => {
    const r = handleApiResponse({
      data: { success: true, data: { id: "x" } },
    });
    expect(r.data).toEqual([{ id: "x" }]);
  });

  it("success=false 时抛错(用 backendData.message)", () => {
    expect(() =>
      handleApiResponse({ data: { success: false, message: "后端拒绝" } }),
    ).toThrow("后端拒绝");
  });

  it("success=false 且无 message 时抛默认错误", () => {
    expect(() => handleApiResponse({ data: { success: false } })).toThrow(
      "API请求失败",
    );
  });

  it("response.data 直接是数组(无 success 字段)→ 包装返回", () => {
    const r = handleApiResponse<number>({ data: [7, 8, 9] });
    expect(r.data).toEqual([7, 8, 9]);
  });

  it("response.data 为空时返回 { data: [] }", () => {
    const r = handleApiResponse({ data: null });
    expect(r.data).toEqual([]);
  });
});

describe("handleSingleApiResponse", () => {
  it("success=true + data → 解包", () => {
    const r = handleSingleApiResponse<{ id: string }>({
      data: { success: true, data: { id: "a" } },
    });
    expect(r.data).toEqual({ id: "a" });
  });

  it("success=false 时抛错", () => {
    expect(() =>
      handleSingleApiResponse({
        data: { success: false, message: "denied" },
      }),
    ).toThrow("denied");
  });

  it("无 success 字段时直接把 response.data 当作结果", () => {
    const r = handleSingleApiResponse({ data: { id: "b" } });
    expect(r.data).toEqual({ id: "b" });
  });

  it("response.data 为空时抛错", () => {
    expect(() => handleSingleApiResponse({ data: null })).toThrow(
      "响应数据为空",
    );
  });
});

describe("createDataFetcher", () => {
  it("默认走 mock", () => {
    const api = vi.fn().mockReturnValue("api");
    const mock = vi.fn().mockReturnValue("mock");
    const fetcher = createDataFetcher(api, mock);
    fetcher();
    expect(mock).toHaveBeenCalledOnce();
    expect(api).not.toHaveBeenCalled();
  });

  it('mode="api" → 走 api', () => {
    const api = vi.fn().mockReturnValue("api");
    const mock = vi.fn().mockReturnValue("mock");
    const fetcher = createDataFetcher(api, mock, "api");
    fetcher();
    expect(api).toHaveBeenCalledOnce();
    expect(mock).not.toHaveBeenCalled();
  });

  it('mode="mock" → 走 mock(显式)', () => {
    const api = vi.fn().mockReturnValue("api");
    const mock = vi.fn().mockReturnValue("mock");
    const fetcher = createDataFetcher(api, mock, "mock");
    fetcher();
    expect(mock).toHaveBeenCalledOnce();
  });

  it("返回函数透传参数", () => {
    const api = vi.fn();
    const mock = vi.fn().mockReturnValue("result");
    const fetcher = createDataFetcher(api, mock);
    const out = fetcher("a", "b", 1);
    expect(mock).toHaveBeenCalledWith("a", "b", 1);
    expect(out).toBe("result");
  });
});
