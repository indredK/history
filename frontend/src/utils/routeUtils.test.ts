/**
 * routeUtils.ts 单元测试 (§2.8)
 *
 * 覆盖目标(全部 4 个对外函数):
 * - getRouteByPath:已注册路径返回 RouteConfig,未注册返回 undefined
 * - getActiveTabFromPath:4 个具名路径分支 + 默认 'timeline'
 * - getAllRoutes:返回与 router/routes 一致的数组
 * - validateRoutes:console.log 路由头 + 每条路由,返回数组长度
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getRouteByPath,
  getActiveTabFromPath,
  getAllRoutes,
  validateRoutes,
} from './routeUtils';
import { routes } from '../router/routes';

describe('getRouteByPath', () => {
  it('已注册的 /timeline 路径返回对应 RouteConfig', () => {
    const r = getRouteByPath('/timeline');
    expect(r).toBeDefined();
    expect(r?.key).toBe('timeline');
  });

  it('已注册的 /dynasties 路径返回对应 RouteConfig', () => {
    const r = getRouteByPath('/dynasties');
    expect(r?.key).toBe('dynasties');
  });

  it('未注册的路径返回 undefined', () => {
    expect(getRouteByPath('/no-such-page')).toBeUndefined();
  });

  it('严格匹配:空字符串 / 仅前缀均不命中', () => {
    expect(getRouteByPath('')).toBeUndefined();
    expect(getRouteByPath('/time')).toBeUndefined();
  });
});

describe('getActiveTabFromPath', () => {
  it.each([
    ['/timeline', 'timeline'],
    ['/map', 'map'],
    ['/people', 'people'],
    ['/culture', 'culture'],
  ])('%s → %s', (path, expected) => {
    expect(getActiveTabFromPath(path)).toBe(expected);
  });

  it('未列入分支的路径默认回 timeline', () => {
    expect(getActiveTabFromPath('/dynasties')).toBe('timeline');
    expect(getActiveTabFromPath('/mythology')).toBe('timeline');
    expect(getActiveTabFromPath('/')).toBe('timeline');
    expect(getActiveTabFromPath('')).toBe('timeline');
  });

  it('大小写敏感:/Timeline 不被识别', () => {
    expect(getActiveTabFromPath('/Timeline')).toBe('timeline');
  });
});

describe('getAllRoutes', () => {
  it('返回的就是 router/routes 同一引用', () => {
    expect(getAllRoutes()).toBe(routes);
  });

  it('返回数组非空,每一项含 key/path/label/component 字段', () => {
    const all = getAllRoutes();
    expect(all.length).toBeGreaterThan(0);
    all.forEach((r) => {
      expect(typeof r.key).toBe('string');
      expect(typeof r.path).toBe('string');
      expect(typeof r.label).toBe('string');
      expect(r.component).toBeDefined();
    });
  });
});

describe('validateRoutes', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('返回 routes.length', () => {
    expect(validateRoutes()).toBe(routes.length);
  });

  it('先打头部提示,再逐条 console.log 路由(总共 routes.length + 1 次)', () => {
    validateRoutes();
    expect(console.log).toHaveBeenCalledTimes(routes.length + 1);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    expect(console.log).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('路由配置验证'),
    );
  });

  it('每条路由的 log 行包含 label / key / path', () => {
    validateRoutes();
    // 收集 console.log 的所有参数(每次调用第一个参数)。
    const lines = (console.log as unknown as { mock: { calls: unknown[][] } })
      .mock.calls.map((c) => String(c[0]));
    routes.forEach((r) => {
      const matched = lines.some(
        (line) =>
          line.includes(r.label) &&
          line.includes(r.key) &&
          line.includes(r.path),
      );
      expect(matched).toBe(true);
    });
  });
});
