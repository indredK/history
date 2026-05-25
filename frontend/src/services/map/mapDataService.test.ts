/**
 * MapDataService 单元测试 (§2.8)
 *
 * 主要覆盖维度:
 *   1) MapDataCache (singleflight + memo):
 *      - 第二次 get 走缓存 → loader 只执行 1 次
 *      - 并发 get 共享同一个 loadingPromise → loader 也只执行 1 次
 *      - loader 抛错时 loadingPromise 被清掉,但不进入缓存,下一次 get 会重跑
 *      - clear(key) 只清单 key,clear() 全清
 *      - getStats 返回 {cacheSize, loadingCount, cachedKeys}
 *   2) MapDataService 公共方法:
 *      - loadPlaces 走 loadJsonData('/data/json/places.json')
 *      - loadBoundaryMappings 返回 10 个朝代硬编码映射
 *      - loadBoundaryData(period) 找到 mapping 后走 /data/raw/<file>;period 不存在 → null
 *      - getBoundaryDataByYear 用 [validFrom, validTo] 闭区间命中后透传 loadBoundaryData
 *        - 年份未命中 → null
 *      - clearCache 清缓存 + getCacheStats 透传
 *
 * 用 vi.mock 拦截 '@/utils/services/dataLoaders' 的 loadJsonData,
 * 让全部走 in-memory mock,不需要真 fetch。
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Mock } from "vitest";

vi.mock("@/utils/services/dataLoaders", () => ({
  loadJsonData: vi.fn(),
}));

import { loadJsonData } from "@/utils/services/dataLoaders";
import { MapDataService, mapDataService } from "./mapDataService";

const mockedLoad = loadJsonData as unknown as Mock;

describe("MapDataService", () => {
  let svc: MapDataService;

  beforeEach(() => {
    mockedLoad.mockReset();
    svc = new MapDataService();
  });

  afterEach(() => {
    svc.clearCache();
  });

  describe("loadPlaces", () => {
    it("走 /data/json/places.json,二次调用走缓存", async () => {
      mockedLoad.mockResolvedValueOnce([{ id: "p1" }, { id: "p2" }]);
      const r1 = await svc.loadPlaces();
      expect(r1).toEqual([{ id: "p1" }, { id: "p2" }]);
      expect(mockedLoad).toHaveBeenCalledTimes(1);
      expect(mockedLoad).toHaveBeenCalledWith("/data/json/places.json");

      // 二次 get → 走缓存,loader 不再执行
      const r2 = await svc.loadPlaces();
      expect(r2).toBe(r1);
      expect(mockedLoad).toHaveBeenCalledTimes(1);
    });

    it("并发 loadPlaces 只触发一次 loader (singleflight)", async () => {
      mockedLoad.mockImplementationOnce(
        () =>
          new Promise((resolve) => setTimeout(() => resolve([{ id: "x" }]), 5)),
      );
      const [a, b, c] = await Promise.all([
        svc.loadPlaces(),
        svc.loadPlaces(),
        svc.loadPlaces(),
      ]);
      expect(a).toEqual([{ id: "x" }]);
      expect(b).toBe(a);
      expect(c).toBe(a);
      expect(mockedLoad).toHaveBeenCalledTimes(1);
    });

    it("loader 抛错时不缓存,后续可重试", async () => {
      mockedLoad.mockRejectedValueOnce(new Error("boom"));
      await expect(svc.loadPlaces()).rejects.toThrow("boom");

      // 上一次失败已被 .catch 清理 loadingPromises;现在重新解析成功
      mockedLoad.mockResolvedValueOnce([{ id: "ok" }]);
      const r = await svc.loadPlaces();
      expect(r).toEqual([{ id: "ok" }]);
      expect(mockedLoad).toHaveBeenCalledTimes(2);
    });
  });

  describe("loadBoundaryMappings", () => {
    it("返回 10 个朝代映射 + 二次走缓存(不调用 loadJsonData)", async () => {
      const ms1 = await svc.loadBoundaryMappings();
      expect(ms1).toHaveLength(10);
      // 检查若干已知 period
      const periods = ms1.map((m) => m.period);
      expect(periods).toEqual([
        "qin",
        "han",
        "sanguo",
        "jin",
        "sui",
        "tang",
        "song",
        "yuan",
        "ming",
        "qing",
      ]);

      // loadBoundaryMappings 本身不调用 loadJsonData
      expect(mockedLoad).not.toHaveBeenCalled();

      // 二次走缓存
      const ms2 = await svc.loadBoundaryMappings();
      expect(ms2).toBe(ms1);
    });
  });

  describe("loadBoundaryData(period)", () => {
    it("命中 mapping → 走 /data/raw/<file>", async () => {
      mockedLoad.mockResolvedValueOnce({ name: "tang-bd" });
      const r = await svc.loadBoundaryData("tang");
      expect(r).toEqual({ name: "tang-bd" });
      expect(mockedLoad).toHaveBeenCalledWith(
        "/data/raw/boundaries_tang.geojson",
      );
    });

    it("period 不在 mappings 中 → 返回 null,且不调用 loadJsonData", async () => {
      const r = await svc.loadBoundaryData("不存在");
      expect(r).toBeNull();
      expect(mockedLoad).not.toHaveBeenCalled();
    });

    it("loadJsonData 抛错 → 落到 catch 返回 null", async () => {
      mockedLoad.mockRejectedValueOnce(new Error("fetch fail"));
      const r = await svc.loadBoundaryData("tang");
      expect(r).toBeNull();
    });

    it("二次 loadBoundaryData(同 period)走缓存", async () => {
      mockedLoad.mockResolvedValueOnce({ name: "song-bd" });
      const r1 = await svc.loadBoundaryData("song");
      const r2 = await svc.loadBoundaryData("song");
      expect(r2).toBe(r1);
      expect(mockedLoad).toHaveBeenCalledTimes(1);
    });
  });

  describe("getBoundaryDataByYear", () => {
    it("年份命中区间 → 转发到 loadBoundaryData", async () => {
      mockedLoad.mockResolvedValueOnce({ name: "tang-bd" });
      const r = await svc.getBoundaryDataByYear(700); // tang [618, 907]
      expect(r).toEqual({ name: "tang-bd" });
      expect(mockedLoad).toHaveBeenCalledWith(
        "/data/raw/boundaries_tang.geojson",
      );
    });

    it("命中边界(等于 validTo)", async () => {
      mockedLoad.mockResolvedValueOnce({ name: "qin-bd" });
      const r = await svc.getBoundaryDataByYear(-206); // qin validTo = -206
      expect(r).toEqual({ name: "qin-bd" });
    });

    it("年份未命中(过早 → 没有秦之前的)→ null", async () => {
      const r = await svc.getBoundaryDataByYear(-500);
      expect(r).toBeNull();
      expect(mockedLoad).not.toHaveBeenCalled();
    });

    it("年份未命中(明清之间空档之前还行,过晚比清结束更晚 → null)", async () => {
      const r = await svc.getBoundaryDataByYear(2000); // qing validTo=1912
      expect(r).toBeNull();
    });
  });

  describe("clearCache + getCacheStats", () => {
    it("clearCache(key) 只清单 key", async () => {
      mockedLoad.mockResolvedValue([{ id: "p1" }]);
      await svc.loadPlaces();
      await svc.loadBoundaryMappings();
      let stats = svc.getCacheStats();
      expect(stats.cacheSize).toBe(2);
      expect(new Set(stats.cachedKeys)).toEqual(
        new Set(["places", "boundary-mappings"]),
      );

      svc.clearCache("places");
      stats = svc.getCacheStats();
      expect(stats.cacheSize).toBe(1);
      expect(stats.cachedKeys).toEqual(["boundary-mappings"]);
    });

    it("clearCache() 全清", async () => {
      mockedLoad.mockResolvedValue([{ id: "p1" }]);
      await svc.loadPlaces();
      await svc.loadBoundaryMappings();
      svc.clearCache();
      const stats = svc.getCacheStats();
      expect(stats.cacheSize).toBe(0);
      expect(stats.cachedKeys).toEqual([]);
    });

    it("getCacheStats 初始 loadingCount=0", () => {
      const stats = svc.getCacheStats();
      expect(stats.loadingCount).toBe(0);
      expect(stats.cacheSize).toBe(0);
    });
  });

  describe("全局单例 mapDataService", () => {
    it("是 MapDataService 实例", () => {
      expect(mapDataService).toBeInstanceOf(MapDataService);
    });
  });
});
