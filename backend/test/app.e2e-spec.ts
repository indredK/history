import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { AllExceptionsFilter } from './../src/common/filters/all-exceptions.filter';
import { TransformInterceptor } from './../src/common/interceptors/transform.interceptor';

/**
 * 端到端冒烟测试:
 * - 启动完整 Nest App(含全局管道、过滤器、拦截器、API 前缀)
 * - 验证 /api/v1/health 返回标准 ApiResponseDto 包装
 * - 验证未注册路径返回 404(经 AllExceptionsFilter 标准化)
 *
 * 这里复刻 main.ts 的核心引导逻辑,确保 e2e 行为与生产一致。
 */
describe('App (e2e)', () => {
  let app: INestApplication<App>;
  const apiPrefix = 'api/v1';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new TransformInterceptor());
    app.setGlobalPrefix(apiPrefix);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/health', () => {
    it('应返回 200 + ApiResponseDto 包装的健康状态', async () => {
      const res = await request(app.getHttpServer()).get(
        `/${apiPrefix}/health`,
      );

      // supertest 的 res.body 是 any,这里收口成 ApiResponseDto 形状方便后续断言
      const body = res.body as {
        success: boolean;
        message: string;
        data: { status: string; timestamp: string };
        timestamp: string;
      };

      expect(res.status).toBe(200);
      expect(body).toMatchObject({
        success: true,
        message: expect.any(String),
        data: {
          status: 'ok',
          timestamp: expect.any(String),
        },
        timestamp: expect.any(String),
      });
      // 时间戳必须是合法 ISO 字符串
      expect(() => new Date(body.data.timestamp).toISOString()).not.toThrow();
    });
  });

  describe('未注册路径', () => {
    it('GET /api/v1/__definitely_not_a_route__ 应返回 404', async () => {
      const res = await request(app.getHttpServer()).get(
        `/${apiPrefix}/__definitely_not_a_route__`,
      );
      expect(res.status).toBe(404);
    });
  });
});
