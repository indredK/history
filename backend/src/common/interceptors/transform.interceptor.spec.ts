import { lastValueFrom, of } from 'rxjs';
import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { TransformInterceptor } from './transform.interceptor';
import { ApiResponseDto } from '../dto/api-response.dto';

/**
 * TransformInterceptor 单元测试 (§1.6)
 *
 * 全局响应包装器:把 Controller 返回的裸数据包成 ApiResponseDto.success,
 * 但如果数据已经是 ApiResponseDto 形状(含 success + timestamp),则原样直通,
 * 避免双重包装。
 *
 * 覆盖目标:
 * - 裸对象 / 数组 / 原始值 → 全部包成 success
 * - 已是 ApiResponseDto(success + timestamp 双键)→ 原样透传
 * - null / undefined / number / string 等 falsy/原始类型 → 包装(走 else 分支)
 */
describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<unknown>;
  const ctx = {} as ExecutionContext;

  beforeEach(() => {
    interceptor = new TransformInterceptor<unknown>();
  });

  function runWith<T>(data: T): Promise<unknown> {
    const next: CallHandler = { handle: () => of(data) };
    return lastValueFrom(interceptor.intercept(ctx, next));
  }

  describe('包装路径', () => {
    it('裸对象包成 ApiResponseDto.success', async () => {
      const result = (await runWith({ id: 1 })) as ApiResponseDto<unknown>;
      expect(result.success).toBe(true);
      expect(result.message).toBe('Success');
      expect(result.data).toEqual({ id: 1 });
      expect(result.timestamp).toEqual(expect.any(String));
    });

    it('裸数组包成 success', async () => {
      const result = (await runWith([1, 2, 3])) as ApiResponseDto<number[]>;
      expect(result.success).toBe(true);
      expect(result.data).toEqual([1, 2, 3]);
    });

    it('null 包成 success(`if (data && ...)` 中 data=null 走 else)', async () => {
      const result = (await runWith(null)) as ApiResponseDto<null>;
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('原始字符串包成 success(typeof !== "object")', async () => {
      const result = (await runWith('hello')) as ApiResponseDto<string>;
      expect(result.success).toBe(true);
      expect(result.data).toBe('hello');
    });

    it('对象只有 success 一个键(缺 timestamp)仍被包装', async () => {
      const result = (await runWith({ success: true })) as ApiResponseDto<{
        success: boolean;
      }>;
      // 因为缺 timestamp,走 else 分支被再包一层
      expect(result.data).toEqual({ success: true });
      expect(result.message).toBe('Success');
    });

    it('对象只有 timestamp 一个键(缺 success)仍被包装', async () => {
      const result = (await runWith({
        timestamp: '2026-01-01T00:00:00.000Z',
      })) as ApiResponseDto<{ timestamp: string }>;
      expect(result.data).toEqual({ timestamp: '2026-01-01T00:00:00.000Z' });
      expect(result.message).toBe('Success');
    });
  });

  describe('透传路径(已是 ApiResponseDto)', () => {
    it('已含 success + timestamp 的对象原样返回', async () => {
      const ready = ApiResponseDto.success({ x: 1 }, 'Already wrapped');
      const result = await runWith(ready);
      expect(result).toBe(ready);
    });

    it('error 形态的 ApiResponseDto 也透传', async () => {
      const ready = ApiResponseDto.error('Boom');
      const result = await runWith(ready);
      expect(result).toBe(ready);
    });

    it('鸭子类型对象(含 success + timestamp 两键)也透传(已知行为锁定)', async () => {
      const duck = { success: false, timestamp: 'now', extra: 1 };
      const result = await runWith(duck);
      expect(result).toBe(duck);
    });
  });
});
