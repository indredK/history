import { Test, type TestingModule } from '@nestjs/testing';
import { MingService } from './ming.service';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * 把 mock 的第 N 次调用第 M 个参数还原为期望类型,集中处理 jest.Mock.calls 的 unsafe-member-access。
 */
function getCallArg<T>(mock: jest.Mock, callIdx = 0, argIdx = 0): T {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return mock.mock.calls[callIdx]?.[argIdx] as T;
}

/**
 * MingService 单元测试 (§1.6)
 *
 * Ming 与 Tang 形状完全一致(同样 5 字段 where + period),但 role 枚举与
 * achievements/positions 业务上偏向 "cabinet/eunuch/scholar" 三个明朝特有方向,
 * 这里对 role contains 验证使用明朝典型值 `cabinet`,避免和 Tang spec 混淆。
 */
describe('MingService', () => {
  let service: MingService;
  let prisma: {
    mingFigure: {
      findMany: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      mingFigure: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [MingService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get<MingService>(MingService);
  });

  describe('getMingFigures - where 拼装', () => {
    it('默认 page=1 limit=20 skip=0,where = {}', async () => {
      prisma.mingFigure.findMany.mockResolvedValue([]);
      prisma.mingFigure.count.mockResolvedValue(0);

      await service.getMingFigures({});

      expect(prisma.mingFigure.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 20,
        orderBy: [{ birthYear: 'asc' }, { name: 'asc' }],
      });
    });

    it('page=3 limit=15 → skip=30', async () => {
      prisma.mingFigure.findMany.mockResolvedValue([]);
      prisma.mingFigure.count.mockResolvedValue(0);

      await service.getMingFigures({ page: 3, limit: 15 });

      expect(prisma.mingFigure.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 30, take: 15 }),
      );
    });

    it('role / name contains + period eq', async () => {
      prisma.mingFigure.findMany.mockResolvedValue([]);
      prisma.mingFigure.count.mockResolvedValue(0);

      await service.getMingFigures({
        role: 'cabinet',
        period: '中后期',
        name: '张',
      });

      const call = getCallArg<{
        where: {
          role?: { contains?: string };
          period?: string;
          name?: { contains?: string };
        };
      }>(prisma.mingFigure.findMany);
      expect(call.where.role).toEqual({ contains: 'cabinet' });
      expect(call.where.period).toBe('中后期');
      expect(call.where.name).toEqual({ contains: '张' });
    });

    it('birthYear 生成 gte', async () => {
      prisma.mingFigure.findMany.mockResolvedValue([]);
      prisma.mingFigure.count.mockResolvedValue(0);

      await service.getMingFigures({ birthYear: 1500 });

      expect(prisma.mingFigure.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { birthYear: { gte: 1500 } } }),
      );
    });

    it('deathYear 生成 OR(lte + null)', async () => {
      prisma.mingFigure.findMany.mockResolvedValue([]);
      prisma.mingFigure.count.mockResolvedValue(0);

      await service.getMingFigures({ deathYear: 1600 });

      expect(prisma.mingFigure.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [{ deathYear: { lte: 1600 } }, { deathYear: null }],
          },
        }),
      );
    });

    it('birthYear=0 也会进入 where(用 !== undefined 而非 truthy 判断)', async () => {
      prisma.mingFigure.findMany.mockResolvedValue([]);
      prisma.mingFigure.count.mockResolvedValue(0);

      await service.getMingFigures({ birthYear: 0 });

      const call = getCallArg<{ where: { birthYear?: { gte?: number } } }>(
        prisma.mingFigure.findMany,
      );
      expect(call.where.birthYear).toEqual({ gte: 0 });
    });
  });

  describe('getMingFigures - transformFigure 串联', () => {
    it('每个返回项的 JSON 字段都被解析', async () => {
      prisma.mingFigure.findMany.mockResolvedValue([
        {
          id: 'zhangjuzheng',
          name: '张居正',
          birthYear: 1525,
          deathYear: 1582,
          role: 'cabinet',
          period: '中后期',
          achievements: '["一条鞭法"]',
          positions: '["内阁首辅"]',
          events: '[]',
          evaluations: null,
          sources: null,
          works: null,
          battles: null,
          policies: '["考成法"]',
          majorEvents: null,
        },
      ]);
      prisma.mingFigure.count.mockResolvedValue(1);

      const result = await service.getMingFigures({});

      const figure = result.data[0] as Record<string, unknown>;
      expect(figure.id).toBe('zhangjuzheng');
      expect(figure.achievements).toEqual(['一条鞭法']);
      expect(figure.positions).toEqual(['内阁首辅']);
      expect(figure.policies).toEqual(['考成法']);
      expect(figure.evaluations).toBeNull();
    });

    it('PaginatedResponseDto meta 字段正确', async () => {
      prisma.mingFigure.findMany.mockResolvedValue([]);
      prisma.mingFigure.count.mockResolvedValue(42);

      const result = await service.getMingFigures({ page: 2, limit: 20 });

      expect(result.meta).toEqual(
        expect.objectContaining({ total: 42, page: 2, limit: 20 }),
      );
    });
  });
});
