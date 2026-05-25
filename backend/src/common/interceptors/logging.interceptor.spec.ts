import { lastValueFrom, of } from 'rxjs';
import { Logger } from '@nestjs/common';
import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { LoggingInterceptor } from './logging.interceptor';

/**
 * LoggingInterceptor 单元测试 (§1.6)
 *
 * 在请求进入时记一条 `method url - ip - userAgent`,
 * 在响应完成时记一条 `method url - <duration>ms`。
 *
 * 覆盖目标:
 * - 请求开始时 logger.log 含 method / url / ip / userAgent
 * - 响应完成时 logger.log 含耗时(单位 ms)
 * - userAgent 缺失时回落空字符串
 * - 通过控制 Date.now 模拟稳定的时间差
 */
describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let logSpy: jest.SpiedFunction<Logger['log']>;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    jest.useRealTimers();
  });

  function makeContext(req: {
    method?: string;
    url?: string;
    ip?: string;
    userAgent?: string;
  }): ExecutionContext {
    const request = {
      method: req.method ?? 'GET',
      url: req.url ?? '/test',
      ip: req.ip ?? '127.0.0.1',
      get: (h: string) => (h === 'User-Agent' ? req.userAgent : undefined),
    };
    return {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
  }

  it('请求入口记一条 "method url - ip - userAgent"', async () => {
    const ctx = makeContext({
      method: 'POST',
      url: '/api/items',
      ip: '10.0.0.1',
      userAgent: 'Mozilla/5.0',
    });
    const next: CallHandler = { handle: () => of('ok') };

    await lastValueFrom(interceptor.intercept(ctx, next));

    // 第 1 条 log 是请求入口
    expect(logSpy).toHaveBeenNthCalledWith(
      1,
      'POST /api/items - 10.0.0.1 - Mozilla/5.0',
    );
  });

  it('userAgent 缺失时回落空字符串', async () => {
    const ctx = makeContext({
      method: 'GET',
      url: '/a',
      ip: '1.1.1.1',
      userAgent: undefined,
    });
    const next: CallHandler = { handle: () => of(null) };

    await lastValueFrom(interceptor.intercept(ctx, next));

    expect(logSpy).toHaveBeenNthCalledWith(1, 'GET /a - 1.1.1.1 - ');
  });

  it('响应完成后记一条带 "<duration>ms"(用 Date.now 模拟时间差)', async () => {
    // 第 1 次 Date.now() = 1000(startTime),第 2 次 Date.now() = 1042(tap 时)
    const nowSpy = jest
      .spyOn(Date, 'now')
      .mockReturnValueOnce(1000)
      .mockReturnValueOnce(1042);

    const ctx = makeContext({ method: 'GET', url: '/x' });
    const next: CallHandler = { handle: () => of({}) };

    await lastValueFrom(interceptor.intercept(ctx, next));

    expect(logSpy).toHaveBeenNthCalledWith(2, 'GET /x - 42ms');
    nowSpy.mockRestore();
  });

  it('总共记 2 条 log(请求入口 + 响应完成)', async () => {
    const ctx = makeContext({});
    const next: CallHandler = { handle: () => of(undefined) };

    await lastValueFrom(interceptor.intercept(ctx, next));

    expect(logSpy).toHaveBeenCalledTimes(2);
  });
});
