import { Test, type TestingModule } from '@nestjs/testing';
import { YuanService } from './yuan.service';
import { PrismaService } from '../../prisma/prisma.service';
import type { FigureQueryDto } from '../common/query.dto';

/**
 * 把 mock 的第 N 次调用第 M 个参数还原为期望类型,集中处理 jest.Mock.calls 的 unsafe-member-access。
 */
function getCallArg<T>(mock: jest.Mock, callIdx = 0, argIdx = 0): T {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return mock.mock.calls[callIdx]?.[argIdx] as T;
}

/**
 * PaginationQueryDto 把 skip/take 暴露为只读 getter,导致裸字面量
 * 不满足 FigureQueryDto 类型 —— 用一个泛型 helper 集中收口 as 断言。
 */
function asQuery<T>(partial: Partial<T>): T {
  return partial as T;
}

/**
 * YuanService 单元测试 (§1.6)
 *
 * Yuan 是 Tang 的子集:**没有 period 字段**(对应 yuan.service.ts:13 的 destructure),
 * 只有 4 个 where 字段:role contains + name contains + birthYear gte + deathYear OR。
 *
 * 这里必须独立测,因为:
 * 1. 传入 period 时不会进 where(被 destructure 静默丢弃)
 * 2. role contains 用元朝典型值 `khan` 与其它朝代区分
 */
describe('YuanService', () => {
  let service: YuanService;
  let prisma: {
    yuanFigure: {
      findMany: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      yuanFigure: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [YuanService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get<YuanService>(YuanService);
  });

  describe('getYuanFigures - where 拼装', () => {
    it('默认 page=1 limit=20 skip=0,where = {}', async () => {
      prisma.yuanFigure.findMany.mockResolvedValue([]);
      prisma.yuanFigure.count.mockResolvedValue(0);

      await service.getYuanFigures(asQuery<FigureQueryDto>({}));

      expect(prisma.yuanFigure.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 20,
        orderBy: [{ birthYear: 'asc' }, { name: 'asc' }],
      });
    });

    it('page=2 limit=12 → skip=12', async () => {
      prisma.yuanFigure.findMany.mockResolvedValue([]);
      prisma.yuanFigure.count.mockResolvedValue(0);

      await service.getYuanFigures(
        asQuery<FigureQueryDto>({ page: 2, limit: 12 }),
      );

      expect(prisma.yuanFigure.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 12, take: 12 }),
      );
    });

    it('role / name contains', async () => {
      prisma.yuanFigure.findMany.mockResolvedValue([]);
      prisma.yuanFigure.count.mockResolvedValue(0);

      await service.getYuanFigures(
        asQuery<FigureQueryDto>({
          role: 'khan',
          name: '忽必烈',
        }),
      );

      const call = getCallArg<{
        where: {
          role?: { contains?: string };
          name?: { contains?: string };
        };
      }>(prisma.yuanFigure.findMany);
      expect(call.where.role).toEqual({ contains: 'khan' });
      expect(call.where.name).toEqual({ contains: '忽必烈' });
    });

    it('period 字段被静默丢弃(yuan.service 的 destructure 不含 period)', async () => {
      prisma.yuanFigure.findMany.mockResolvedValue([]);
      prisma.yuanFigure.count.mockResolvedValue(0);

      // 即使传入 period,where 也不应该包含 period 键
      await service.getYuanFigures(
        asQuery<FigureQueryDto>({ period: '元前期' }),
      );

      const call = getCallArg<{ where: Record<string, unknown> }>(
        prisma.yuanFigure.findMany,
      );
      expect(call.where).toEqual({});
      expect(call.where).not.toHaveProperty('period');
    });

    it('birthYear 生成 gte', async () => {
      prisma.yuanFigure.findMany.mockResolvedValue([]);
      prisma.yuanFigure.count.mockResolvedValue(0);

      await service.getYuanFigures(
        asQuery<FigureQueryDto>({ birthYear: 1200 }),
      );

      expect(prisma.yuanFigure.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { birthYear: { gte: 1200 } } }),
      );
    });

    it('deathYear 生成 OR(lte + null)', async () => {
      prisma.yuanFigure.findMany.mockResolvedValue([]);
      prisma.yuanFigure.count.mockResolvedValue(0);

      await service.getYuanFigures(
        asQuery<FigureQueryDto>({ deathYear: 1300 }),
      );

      expect(prisma.yuanFigure.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [{ deathYear: { lte: 1300 } }, { deathYear: null }],
          },
        }),
      );
    });

    it('birthYear=0 也会进入 where(用 !== undefined 而非 truthy 判断)', async () => {
      prisma.yuanFigure.findMany.mockResolvedValue([]);
      prisma.yuanFigure.count.mockResolvedValue(0);

      await service.getYuanFigures(asQuery<FigureQueryDto>({ birthYear: 0 }));

      const call = getCallArg<{ where: { birthYear?: { gte?: number } } }>(
        prisma.yuanFigure.findMany,
      );
      expect(call.where.birthYear).toEqual({ gte: 0 });
    });
  });

  describe('getYuanFigures - transformFigure 串联', () => {
    it('每个返回项的 JSON 字段都被解析', async () => {
      prisma.yuanFigure.findMany.mockResolvedValue([
        {
          id: 'kublai',
          name: '忽必烈',
          birthYear: 1215,
          deathYear: 1294,
          role: 'khan',
          achievements: '["统一中国","建立元朝"]',
          positions: '["大汗","皇帝"]',
          events: '[]',
          evaluations: null,
          sources: null,
          works: null,
          battles: '["襄阳之战"]',
          policies: null,
          majorEvents: null,
        },
      ]);
      prisma.yuanFigure.count.mockResolvedValue(1);

      const result = await service.getYuanFigures(asQuery<FigureQueryDto>({}));

      const figure = result.data[0] as unknown as Record<string, unknown>;
      expect(figure.id).toBe('kublai');
      expect(figure.achievements).toEqual(['统一中国', '建立元朝']);
      expect(figure.positions).toEqual(['大汗', '皇帝']);
      expect(figure.battles).toEqual(['襄阳之战']);
      expect(figure.evaluations).toBeNull();
    });

    it('PaginatedResponseDto meta 字段正确', async () => {
      prisma.yuanFigure.findMany.mockResolvedValue([]);
      prisma.yuanFigure.count.mockResolvedValue(28);

      const result = await service.getYuanFigures(
        asQuery<FigureQueryDto>({ page: 1, limit: 20 }),
      );

      expect(result.meta).toEqual(
        expect.objectContaining({ total: 28, page: 1, limit: 20 }),
      );
    });
  });
});
