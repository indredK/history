import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

/**
 * AllExceptionsFilter 单元测试 (§1.6)
 *
 * 全局兜底过滤器,把所有未捕获异常转换成 ApiResponseDto.error 格式。
 *
 * 覆盖目标:
 * - HttpException(BadRequest / NotFound 等)走 instanceof 分支
 *   - exceptionResponse 为对象时 message 优先取 obj.message
 *   - exceptionResponse 为字符串时 message 直接采用
 * - 非 HttpException(Error 或字面量)走 else 分支
 *   - status=500,message="Internal server error"
 *   - NODE_ENV=development 时 error.stack 存在
 *   - NODE_ENV 非 development 时 error 不含 stack
 * - 总会调 response.status(N).json(errorResponse)
 * - logger.error 总被调用 1 次
 */
describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let errorSpy: jest.SpiedFunction<Logger['error']>;
  let statusFn: jest.Mock;
  let jsonFn: jest.Mock;

  function makeHost(): {
    host: ArgumentsHost;
    captured: { status: number; body: unknown };
  } {
    const captured = { status: 0, body: null as unknown };
    jsonFn = jest.fn((b: unknown) => {
      captured.body = b;
    });
    statusFn = jest.fn((code: number) => {
      captured.status = code;
      return { json: jsonFn };
    });
    const response = { status: statusFn };
    const request = { method: 'GET', url: '/x' };
    return {
      host: {
        switchToHttp: () => ({
          getResponse: () => response,
          getRequest: () => request,
        }),
      } as unknown as ArgumentsHost,
      captured,
    };
  }

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    errorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  describe('HttpException 分支', () => {
    it('BadRequestException(对象 response)取 obj.message', () => {
      const { host, captured } = makeHost();
      const ex = new BadRequestException({
        statusCode: 400,
        message: 'name is required',
        error: 'Bad Request',
      });

      filter.catch(ex, host);

      expect(captured.status).toBe(HttpStatus.BAD_REQUEST);
      const body = captured.body as {
        success: boolean;
        message: string;
        error: unknown;
      };
      expect(body.success).toBe(false);
      expect(body.message).toBe('name is required');
      expect(body.error).toEqual({
        statusCode: 400,
        message: 'name is required',
        error: 'Bad Request',
      });
    });

    it('NotFoundException(字符串 response)直接采用 message', () => {
      const { host, captured } = makeHost();
      const ex = new NotFoundException('record gone');

      filter.catch(ex, host);

      expect(captured.status).toBe(HttpStatus.NOT_FOUND);
      const body = captured.body as { message: string; error: unknown };
      expect(body.message).toBe('record gone');
    });

    it('exceptionResponse 是对象但缺 message 时回落到 exception.message', () => {
      const { host, captured } = makeHost();
      // 自造一个无 message 的 HttpException response
      class BareException extends HttpException {
        constructor() {
          super({ statusCode: 418, code: 'TEAPOT' }, 418);
        }
      }
      const ex = new BareException();

      filter.catch(ex, host);

      expect(captured.status).toBe(418);
      const body = captured.body as { message: string };
      // exception.message 是 Nest 给的 fallback
      expect(typeof body.message).toBe('string');
      expect(body.message.length).toBeGreaterThan(0);
    });
  });

  describe('非 HttpException 分支', () => {
    const originalNodeEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('Error 实例 → status=500 + 通用 message + 不含 stack(NODE_ENV != development)', () => {
      process.env.NODE_ENV = 'production';
      const { host, captured } = makeHost();

      filter.catch(new Error('boom'), host);

      expect(captured.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      const body = captured.body as {
        message: string;
        error: { statusCode: number; message: string; stack?: string };
      };
      expect(body.message).toBe('Internal server error');
      expect(body.error.statusCode).toBe(500);
      expect(body.error.message).toBe('Internal server error');
      expect(body.error.stack).toBeUndefined();
    });

    it('Error 实例 + NODE_ENV=development → error 含 stack', () => {
      process.env.NODE_ENV = 'development';
      const { host, captured } = makeHost();

      const err = new Error('boom-dev');
      filter.catch(err, host);

      const body = captured.body as {
        error: { statusCode: number; message: string; stack?: string };
      };
      expect(body.error.stack).toBeDefined();
      expect(body.error.stack).toContain('boom-dev');
    });

    it('非 Error 字面量也被兜成 500(走 else 分支)', () => {
      process.env.NODE_ENV = 'production';
      const { host, captured } = makeHost();

      filter.catch('plain string thrown', host);

      expect(captured.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      const body = captured.body as { message: string };
      expect(body.message).toBe('Internal server error');
    });
  });

  describe('副作用', () => {
    it('logger.error 总被调用 1 次', () => {
      const { host } = makeHost();
      filter.catch(new BadRequestException('x'), host);
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });

    it('response.status(N).json(body) 链路被调用', () => {
      const { host } = makeHost();
      filter.catch(new BadRequestException('x'), host);
      expect(statusFn).toHaveBeenCalledTimes(1);
      expect(jsonFn).toHaveBeenCalledTimes(1);
    });
  });
});
