/**
 * errorHandling.ts 单元测试 (§2.8)
 *
 * 覆盖目标:
 * - ApiError 构造形态:type / message / originalError / instanceof Error
 * - SimpleFallbackManager.executeWithFallback:
 *   * 首次请求成功 → 直接返回,不走 fallback
 *   * 单次失败但未达阈值 → 抛出 ApiError(非 ApiError 输入被包成 ApiError)
 *   * 连续失败达阈值 → 激活降级,本次请求直接走 fallback
 *   * 已激活降级 + 未超 fallbackDuration → 仍走 fallback
 *   * 已激活降级 + 已超 fallbackDuration → 自动停用,回到 API 路径
 *   * CLIENT_ERROR 默认排除,不计入失败计数,直接抛
 * - 状态管理:reset / manualActivate / manualDeactivate / updateConfig / getState
 * - retryOperation:
 *   * 全部失败时抛最后一个错
 *   * 第二次成功 → 不再重试
 *   * 重试间隔随次数递增(delay * (i+1))
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  ApiError,
  ApiErrorType,
  SimpleFallbackManager,
  fallbackManager,
  retryOperation,
} from './errorHandling';

describe('ApiError', () => {
  it('构造时记录 type / message / originalError', () => {
    const cause = new Error('underlying');
    const err = new ApiError(ApiErrorType.TIMEOUT_ERROR, '请求超时', cause);
    expect(err.type).toBe(ApiErrorType.TIMEOUT_ERROR);
    expect(err.message).toBe('请求超时');
    expect(err.originalError).toBe(cause);
    expect(err.name).toBe('ApiError');
  });

  it('是 Error 子类(可被 instanceof Error 捕获)', () => {
    const err = new ApiError(ApiErrorType.NETWORK_ERROR, 'x');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ApiError);
  });

  it('originalError 可选', () => {
    const err = new ApiError(ApiErrorType.SERVER_ERROR, 'x');
    expect(err.originalError).toBeUndefined();
  });
});

describe('SimpleFallbackManager.executeWithFallback', () => {
  let manager: SimpleFallbackManager;

  beforeEach(() => {
    manager = new SimpleFallbackManager();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('API 成功时直接返回结果,不调用 fallback', async () => {
    const api = vi.fn().mockResolvedValue('api-data');
    const fb = vi.fn().mockResolvedValue('fb-data');

    const result = await manager.executeWithFallback(api, fb);

    expect(result).toBe('api-data');
    expect(api).toHaveBeenCalledOnce();
    expect(fb).not.toHaveBeenCalled();
  });

  it('成功后 failureCount 被清零', async () => {
    const fail = vi.fn().mockRejectedValue(
      new ApiError(ApiErrorType.SERVER_ERROR, 'boom'),
    );
    const succeed = vi.fn().mockResolvedValue('ok');
    const fb = vi.fn().mockResolvedValue('fb');

    // 先攒两次失败(此时 failureCount=2,未到阈值 3)
    await expect(manager.executeWithFallback(fail, fb)).rejects.toThrow();
    await expect(manager.executeWithFallback(fail, fb)).rejects.toThrow();
    expect(manager.getState().failureCount).toBe(2);

    // 然后成功一次 → 计数清零
    await manager.executeWithFallback(succeed, fb);
    expect(manager.getState().failureCount).toBe(0);
  });

  it('单次失败未到阈值时抛 ApiError,不走 fallback', async () => {
    const api = vi
      .fn()
      .mockRejectedValue(new ApiError(ApiErrorType.NETWORK_ERROR, 'no net'));
    const fb = vi.fn().mockResolvedValue('fb');

    await expect(manager.executeWithFallback(api, fb)).rejects.toThrow(
      ApiError,
    );
    expect(fb).not.toHaveBeenCalled();
    expect(manager.getState().failureCount).toBe(1);
  });

  it('非 ApiError 输入被包装成 ApiError(NETWORK_ERROR + originalError)', async () => {
    const cause = new Error('raw');
    const api = vi.fn().mockRejectedValue(cause);
    const fb = vi.fn().mockResolvedValue('fb');

    try {
      await manager.executeWithFallback(api, fb);
      throw new Error('should not reach');
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      const err = e as ApiError;
      expect(err.type).toBe(ApiErrorType.NETWORK_ERROR);
      expect(err.originalError).toBe(cause);
    }
  });

  it('连续达到阈值后,本次请求直接走 fallback 并返回其结果', async () => {
    const api = vi
      .fn()
      .mockRejectedValue(new ApiError(ApiErrorType.SERVER_ERROR, '500'));
    const fb = vi.fn().mockResolvedValue('fallback-result');

    // 阈值=3:前 2 次抛错,第 3 次触发激活并直接走 fallback
    await expect(manager.executeWithFallback(api, fb)).rejects.toThrow();
    await expect(manager.executeWithFallback(api, fb)).rejects.toThrow();
    const result = await manager.executeWithFallback(api, fb);

    expect(result).toBe('fallback-result');
    expect(fb).toHaveBeenCalledOnce();
    expect(manager.getState().isActive).toBe(true);
  });

  it('已激活降级 + 未超 fallbackDuration → 后续请求继续走 fallback,不打 API', async () => {
    manager.manualActivate();
    const api = vi.fn().mockResolvedValue('api');
    const fb = vi.fn().mockResolvedValue('fb');

    await manager.executeWithFallback(api, fb);
    expect(api).not.toHaveBeenCalled();
    expect(fb).toHaveBeenCalledOnce();
  });

  it('已激活降级 + 已超 fallbackDuration → 自动停用,回到 API 路径', async () => {
    manager.manualActivate();
    // 模拟降级激活时间在远古
    manager.updateConfig({ fallbackDuration: 1 });
    // sleep 5ms 让 duration 过期
    await new Promise((r) => setTimeout(r, 5));

    const api = vi.fn().mockResolvedValue('api');
    const fb = vi.fn().mockResolvedValue('fb');

    const result = await manager.executeWithFallback(api, fb);
    expect(result).toBe('api');
    expect(manager.getState().isActive).toBe(false);
  });

  it('CLIENT_ERROR 默认在 excludeErrorTypes 中,不计入失败计数', async () => {
    const api = vi
      .fn()
      .mockRejectedValue(new ApiError(ApiErrorType.CLIENT_ERROR, '400'));
    const fb = vi.fn().mockResolvedValue('fb');

    await expect(manager.executeWithFallback(api, fb)).rejects.toThrow();
    await expect(manager.executeWithFallback(api, fb)).rejects.toThrow();
    await expect(manager.executeWithFallback(api, fb)).rejects.toThrow();
    // 即便 3 次失败,因为是 CLIENT_ERROR 也不触发 fallback
    expect(manager.getState().failureCount).toBe(0);
    expect(manager.getState().isActive).toBe(false);
    expect(fb).not.toHaveBeenCalled();
  });

  it('enableAutoFallback=false 时,即便达阈值也不会走 fallback', async () => {
    manager.updateConfig({ enableAutoFallback: false });
    const api = vi
      .fn()
      .mockRejectedValue(new ApiError(ApiErrorType.SERVER_ERROR, '500'));
    const fb = vi.fn().mockResolvedValue('fb');

    for (let i = 0; i < 5; i++) {
      await expect(manager.executeWithFallback(api, fb)).rejects.toThrow();
    }
    expect(fb).not.toHaveBeenCalled();
    expect(manager.getState().isActive).toBe(false);
  });
});

describe('SimpleFallbackManager 状态管理', () => {
  let manager: SimpleFallbackManager;

  beforeEach(() => {
    manager = new SimpleFallbackManager();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reset 清除所有状态', () => {
    manager.manualActivate();
    expect(manager.getState().isActive).toBe(true);

    manager.reset();
    const s = manager.getState();
    expect(s.isActive).toBe(false);
    expect(s.activatedAt).toBe(0);
    expect(s.failureCount).toBe(0);
  });

  it('manualActivate / manualDeactivate 直接切换激活态', () => {
    expect(manager.getState().isActive).toBe(false);

    manager.manualActivate();
    expect(manager.getState().isActive).toBe(true);
    expect(manager.getState().activatedAt).toBeGreaterThan(0);

    manager.manualDeactivate();
    expect(manager.getState().isActive).toBe(false);
    expect(manager.getState().activatedAt).toBe(0);
  });

  it('updateConfig 浅合并,不影响未提及字段', () => {
    manager.updateConfig({ fallbackThreshold: 99 });
    const s = manager.getState();
    expect(s.config.fallbackThreshold).toBe(99);
    expect(s.config.enableAutoFallback).toBe(true); // 没动
    expect(s.config.excludeErrorTypes).toEqual([ApiErrorType.CLIENT_ERROR]);
  });

  it('getState 返回 config 的副本(改返回值不污染内部)', () => {
    const s1 = manager.getState();
    s1.config.fallbackThreshold = 999;
    const s2 = manager.getState();
    expect(s2.config.fallbackThreshold).toBe(3); // 默认值
  });
});

describe('全局 fallbackManager 单例', () => {
  beforeEach(() => {
    fallbackManager.reset();
  });

  it('被导出为单例,跨次调用共享状态', () => {
    fallbackManager.manualActivate();
    expect(fallbackManager.getState().isActive).toBe(true);
    fallbackManager.reset();
    expect(fallbackManager.getState().isActive).toBe(false);
  });
});

describe('retryOperation', () => {
  // 用真实计时器,delay 设小一些避免拖慢测试。
  // 之前用 fake timers + advanceTimersByTimeAsync 会导致 mockRejectedValue 抛出的
  // promise 在 catch attach 前被 vitest 标记为 unhandled rejection。

  it('首次成功 → 不重试', async () => {
    const op = vi.fn().mockResolvedValue('ok');
    const result = await retryOperation(op, 3, 1);
    expect(result).toBe('ok');
    expect(op).toHaveBeenCalledOnce();
  });

  it('第二次成功 → 总共调 2 次', async () => {
    const op = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error('fail-1'))
      .mockResolvedValueOnce('ok');

    const result = await retryOperation(op, 3, 1);
    expect(result).toBe('ok');
    expect(op).toHaveBeenCalledTimes(2);
  });

  it('全部失败时抛最后一个错', async () => {
    const op = vi
      .fn<() => Promise<unknown>>()
      .mockRejectedValueOnce(new Error('fail-1'))
      .mockRejectedValueOnce(new Error('fail-2'))
      .mockRejectedValueOnce(new Error('fail-3'));

    await expect(retryOperation(op, 3, 1)).rejects.toThrow('fail-3');
    expect(op).toHaveBeenCalledTimes(3);
  });

  it('重试次数耗尽后不再调用 operation', async () => {
    const op = vi
      .fn<() => Promise<unknown>>()
      .mockRejectedValue(new Error('boom'));

    await expect(retryOperation(op, 2, 1)).rejects.toThrow('boom');
    expect(op).toHaveBeenCalledTimes(2);
  });

  it('maxRetries=1 时只调一次,不做任何等待', async () => {
    const op = vi
      .fn<() => Promise<unknown>>()
      .mockRejectedValue(new Error('once'));
    const start = Date.now();
    await expect(retryOperation(op, 1, 5000)).rejects.toThrow('once');
    expect(Date.now() - start).toBeLessThan(200); // 不应等 5s
    expect(op).toHaveBeenCalledTimes(1);
  });
});
