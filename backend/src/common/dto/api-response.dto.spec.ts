import { ApiResponseDto } from './api-response.dto';

/**
 * ApiResponseDto 单元测试 (§1.6)
 *
 * 全局响应包络,所有 controller 经 TransformInterceptor 落点之一。
 * 覆盖目标:
 * - 构造器各字段顺序与默认行为
 * - timestamp ISO 8601 格式
 * - 静态 success() / error() 工厂
 * - data/error 可选字段在不传时的默认值
 */
describe('ApiResponseDto', () => {
  describe('constructor', () => {
    it('全参构造正确写入所有字段', () => {
      const dto = new ApiResponseDto(true, 'ok', { id: 1 }, { code: 'X' });
      expect(dto.success).toBe(true);
      expect(dto.message).toBe('ok');
      expect(dto.data).toEqual({ id: 1 });
      expect(dto.error).toEqual({ code: 'X' });
    });

    it('不传 data / error 时这两个字段为 undefined', () => {
      const dto = new ApiResponseDto(false, 'bad');
      expect(dto.success).toBe(false);
      expect(dto.message).toBe('bad');
      expect(dto.data).toBeUndefined();
      expect(dto.error).toBeUndefined();
    });

    it('timestamp 是合法 ISO 8601 字符串', () => {
      const dto = new ApiResponseDto(true, 'ok');
      expect(dto.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
      // 反向解析回 Date 后能再 toISOString 还原
      expect(new Date(dto.timestamp).toISOString()).toBe(dto.timestamp);
    });
  });

  describe('ApiResponseDto.success()', () => {
    it('默认 message=Success,success=true,data 透传', () => {
      const dto = ApiResponseDto.success({ items: [1, 2, 3] });
      expect(dto.success).toBe(true);
      expect(dto.message).toBe('Success');
      expect(dto.data).toEqual({ items: [1, 2, 3] });
      expect(dto.error).toBeUndefined();
    });

    it('自定义 message 覆盖默认值', () => {
      const dto = ApiResponseDto.success({ id: 42 }, 'Created');
      expect(dto.message).toBe('Created');
      expect(dto.data).toEqual({ id: 42 });
    });

    it('data 是 null / 0 / 空数组 时也保留(不被 falsy 屏蔽)', () => {
      expect(ApiResponseDto.success(null).data).toBeNull();
      expect(ApiResponseDto.success(0).data).toBe(0);
      expect(ApiResponseDto.success([]).data).toEqual([]);
    });
  });

  describe('ApiResponseDto.error()', () => {
    it('success=false,data=null,error 透传', () => {
      const dto = ApiResponseDto.error('Bad Request', { code: 'INVALID' });
      expect(dto.success).toBe(false);
      expect(dto.message).toBe('Bad Request');
      expect(dto.data).toBeNull();
      expect(dto.error).toEqual({ code: 'INVALID' });
    });

    it('不传 error 时 error=undefined,但 data 必为 null', () => {
      const dto = ApiResponseDto.error('Server Error');
      expect(dto.data).toBeNull();
      expect(dto.error).toBeUndefined();
    });
  });
});
