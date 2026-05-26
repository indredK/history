/**
 * serviceFactory.ts 单元测试 (§2.8)
 *
 * 这个文件里复杂的 `createUnifiedService` 涉及 axios / fallbackManager /
 * loadJsonArray 三方面副作用,集成在 services/* 业务侧已被实际使用,
 * 这里只覆盖纯函数 / 纯状态部分:
 *
 * - createSimpleDataClient:根据 getDataSourceMode() 返回 api 或 mock
 * - createMultipleServices:把 configs 数组转成 { key: BaseService } 映射
 * - ServiceMonitor:getInstance 单例 / registerService / recordCall 累计 calls
 *   和 errors / getStats 含 errorRate 百分比 / getServiceList 返回已注册名单
 */
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
} from 'vitest';

// dataSource 是模块加载时根据 import.meta.env 计算的常量,
// 为了让 createSimpleDataClient 走两条分支,这里直接 mock。
vi.mock('@/config/dataSource', () => {
  let mode: 'mock' | 'api' = 'mock';
  return {
    getDataSourceMode: () => mode,
    // 让测试代码可以切换 mode
    __setMode: (m: 'mock' | 'api') => {
      mode = m;
    },
    DATA_SOURCE_CONFIG: {
      api: { baseURL: '/api/v1', timeout: 10000 },
      mock: { delay: 0, errorRate: 0 },
    },
  };
});

import * as dataSourceMock from '@/config/dataSource';
import {
  createSimpleDataClient,
  createMultipleServices,
  ServiceMonitor,
  serviceMonitor,
  type ServiceConfig,
  type BaseService,
} from './serviceFactory';

// dataSourceMock 在 vi.mock 工厂里挂了 __setMode 辅助函数,这里取出来
const setMode = (
  dataSourceMock as unknown as { __setMode: (m: 'mock' | 'api') => void }
).__setMode;

describe('createSimpleDataClient', () => {
  it('默认 mock 模式 → 返回 mockService', () => {
    setMode('mock');
    const api = { tag: 'api' };
    const mock = { tag: 'mock' };
    expect(createSimpleDataClient(api, mock)).toBe(mock);
  });

  it("mode='api' → 返回 apiService", () => {
    setMode('api');
    const api = { tag: 'api' };
    const mock = { tag: 'mock' };
    expect(createSimpleDataClient(api, mock)).toBe(api);
  });
});

describe('createMultipleServices', () => {
  beforeEach(() => {
    setMode('mock');
  });

  it('把每个 config 转成 BaseService 并按 key 装入 map', () => {
    const configs = [
      {
        key: 'a' as const,
        name: 'A 服务',
        apiEndpoint: '/api/a',
        jsonDataPath: '/data/a.json',
        transformer: (item: { id: string }) => ({ id: item.id }),
      },
      {
        key: 'b' as const,
        name: 'B 服务',
        apiEndpoint: '/api/b',
        jsonDataPath: '/data/b.json',
        transformer: (item: { id: string }) => ({ id: item.id }),
      },
    ] satisfies Array<
      ServiceConfig<{ id: string }> & { key: 'a' | 'b' }
    >;

    const services = createMultipleServices<{
      a: BaseService<{ id: string }>;
      b: BaseService<{ id: string }>;
    }>(configs);

    expect(Object.keys(services).sort()).toEqual(['a', 'b']);
    expect(typeof services.a.getAll).toBe('function');
    expect(typeof services.b.getAll).toBe('function');
  });

  it('空 configs → 返回空 map', () => {
    const services = createMultipleServices<Record<string, BaseService<any>>>(
      [],
    );
    expect(Object.keys(services)).toEqual([]);
  });
});

describe('ServiceMonitor', () => {
  let monitor: ServiceMonitor;

  beforeEach(() => {
    monitor = ServiceMonitor.getInstance();
    // 单例 — 每次都重置内部 Map 避免被其它用例污染
    // (没有 reset 方法,这里直接清空内部字段)
    (
      monitor as unknown as {
        services: Map<string, unknown>;
        stats: Map<string, unknown>;
      }
    ).services.clear();
    (
      monitor as unknown as {
        services: Map<string, unknown>;
        stats: Map<string, unknown>;
      }
    ).stats.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('getInstance 返回同一个单例;serviceMonitor 是同一引用', () => {
    expect(ServiceMonitor.getInstance()).toBe(monitor);
    expect(serviceMonitor).toBe(monitor);
  });

  it('registerService 把服务记入名单,getServiceList 返回 key', () => {
    monitor.registerService('svc-a', { tag: 'a' });
    monitor.registerService('svc-b', { tag: 'b' });

    const list = monitor.getServiceList();
    expect(list.sort()).toEqual(['svc-a', 'svc-b']);
  });

  it('未注册的服务 recordCall 是 no-op', () => {
    expect(() => monitor.recordCall('never-registered', true)).not.toThrow();
    expect(monitor.getStats()).toEqual({});
  });

  it('recordCall 成功累计 calls,不增加 errors', () => {
    monitor.registerService('svc-x', {});
    monitor.recordCall('svc-x', true);
    monitor.recordCall('svc-x', true);

    const stats = monitor.getStats();
    expect(stats['svc-x']).toEqual(
      expect.objectContaining({
        calls: 2,
        errors: 0,
        errorRate: '0.00%',
      }),
    );
     
    expect((stats['svc-x'] as { lastCall: number }).lastCall).toBeGreaterThan(
      0,
    );
  });

  it('recordCall 失败累计 errors,errorRate 按百分比四舍五入到两位', () => {
    monitor.registerService('svc-y', {});
    monitor.recordCall('svc-y', true);
    monitor.recordCall('svc-y', false);
    monitor.recordCall('svc-y', false);

    const stats = monitor.getStats();
    expect(stats['svc-y']).toEqual(
      expect.objectContaining({
        calls: 3,
        errors: 2,
        // 2/3 ≈ 66.666... → "66.67%"
        errorRate: '66.67%',
      }),
    );
  });

  it('零调用的服务 errorRate 显示 0%', () => {
    monitor.registerService('svc-z', {});
    const stats = monitor.getStats();
    expect(stats['svc-z']).toEqual(
      expect.objectContaining({ calls: 0, errors: 0, errorRate: '0%' }),
    );
  });

  it('getStats 同时返回多个服务的快照', () => {
    monitor.registerService('s1', {});
    monitor.registerService('s2', {});
    monitor.recordCall('s1', true);
    monitor.recordCall('s2', false);

    const stats = monitor.getStats();
    expect(Object.keys(stats).sort()).toEqual(['s1', 's2']);
     
    expect((stats['s1'] as { calls: number }).calls).toBe(1);
     
    expect((stats['s2'] as { errors: number }).errors).toBe(1);
  });
});
