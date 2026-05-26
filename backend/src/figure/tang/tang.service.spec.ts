import { Test, type TestingModule } from '@nestjs/testing';
import { TangService } from './tang.service';
import { PrismaService } from '../../prisma/prisma.service';
import type { FigureQueryDto } from '../common/query.dto';

/**
 * 把 mock 的第 N 次调用第 M 个参数还原为期望类型,
 * 集中处理 jest.Mock.calls 必然产生的 unsafe-member-access。
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
 * TangService 单元测试 (§1.6)
 *
 * Tang 是 Figure 6 个朝代服务里"最完整"的样本(role contains + period eq +
 * name contains + birthYear gte + deathYear OR + null),覆盖它即覆盖了
 * Ming 的完全相同形状以及 Song/Yuan/Qing 的子集(后三者没有 period)。
 *
 * Sanguo 因为 kingdom 字段单独建模,有独立 spec。
 *
 * 覆盖目标:
 * - getTangFigures:where 拼装 5 字段、双 orderBy、分页 skip 计算
 * - transformFigure(继承自 FigureBaseService)在 service 路径上被正确调用,
 *   解析 JSON 字段
 */
describe('TangService', () => {
  let service: TangService;
  let prisma: {
    tangFigure: {
      findMany: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      tangFigure: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [TangService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get<TangService>(TangService);
  });

  describe('getTangFigures - where 拼装', () => {
    it('默认 page=1 limit=20 skip=0,where = {}', async () => {
      prisma.tangFigure.findMany.mockResolvedValue([]);
      prisma.tangFigure.count.mockResolvedValue(0);

      await service.getTangFigures(asQuery<FigureQueryDto>({}));

      expect(prisma.tangFigure.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 20,
        orderBy: [{ birthYear: 'asc' }, { name: 'asc' }],
      });
    });

    it('page=5 limit=10 → skip=40', async () => {
      prisma.tangFigure.findMany.mockResolvedValue([]);
      prisma.tangFigure.count.mockResolvedValue(0);

      await service.getTangFigures(
        asQuery<FigureQueryDto>({ page: 5, limit: 10 }),
      );

      expect(prisma.tangFigure.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 40, take: 10 }),
      );
    });

    it('role / name 走 contains,period 直接 eq', async () => {
      prisma.tangFigure.findMany.mockResolvedValue([]);
      prisma.tangFigure.count.mockResolvedValue(0);

      await service.getTangFigures(
        asQuery<FigureQueryDto>({
          role: 'poet',
          period: '盛唐',
          name: '李',
        }),
      );

      const call = getCallArg<{
        where: {
          role?: { contains?: string };
          period?: string;
          name?: { contains?: string };
        };
      }>(prisma.tangFigure.findMany);
      expect(call.where.role).toEqual({ contains: 'poet' });
      expect(call.where.period).toBe('盛唐');
      expect(call.where.name).toEqual({ contains: '李' });
    });

    it('birthYear 生成 gte', async () => {
      prisma.tangFigure.findMany.mockResolvedValue([]);
      prisma.tangFigure.count.mockResolvedValue(0);

      await service.getTangFigures(asQuery<FigureQueryDto>({ birthYear: 700 }));

      expect(prisma.tangFigure.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { birthYear: { gte: 700 } } }),
      );
    });

    it('deathYear 生成 OR(lte + null),允许仍在世的角色被截止年覆盖', async () => {
      prisma.tangFigure.findMany.mockResolvedValue([]);
      prisma.tangFigure.count.mockResolvedValue(0);

      await service.getTangFigures(asQuery<FigureQueryDto>({ deathYear: 800 }));

      expect(prisma.tangFigure.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [{ deathYear: { lte: 800 } }, { deathYear: null }],
          },
        }),
      );
    });

    it('birthYear=0 也会进入 where(因为用 !== undefined 而非 truthy 判断)', async () => {
      prisma.tangFigure.findMany.mockResolvedValue([]);
      prisma.tangFigure.count.mockResolvedValue(0);

      await service.getTangFigures(asQuery<FigureQueryDto>({ birthYear: 0 }));

      const call = getCallArg<{ where: { birthYear?: { gte?: number } } }>(
        prisma.tangFigure.findMany,
      );
      expect(call.where.birthYear).toEqual({ gte: 0 });
    });
  });

  describe('getTangFigures - transformFigure 串联', () => {
    it('每个返回项的 JSON 字段都被解析(委托 FigureBaseService)', async () => {
      prisma.tangFigure.findMany.mockResolvedValue([
        {
          id: 'libai',
          name: '李白',
          birthYear: 701,
          deathYear: 762,
          role: 'poet',
          period: '盛唐',
          achievements: '["诗仙"]',
          positions: '["翰林"]',
          events: '[]',
          evaluations: null,
          sources: null,
          works: '["将进酒","蜀道难"]',
          battles: null,
          policies: null,
          majorEvents: null,
        },
      ]);
      prisma.tangFigure.count.mockResolvedValue(1);

      const result = await service.getTangFigures(asQuery<FigureQueryDto>({}));

      const figure = result.data[0] as unknown as Record<string, unknown>;
      expect(figure.id).toBe('libai');
      expect(figure.name).toBe('李白');
      expect(figure.achievements).toEqual(['诗仙']);
      expect(figure.positions).toEqual(['翰林']);
      expect(figure.works).toEqual(['将进酒', '蜀道难']);
      expect(figure.events).toEqual([]);
      // 缺失字段被 FigureBaseService 补成 null
      expect(figure.evaluations).toBeNull();
    });

    it('PaginatedResponseDto meta 字段正确', async () => {
      prisma.tangFigure.findMany.mockResolvedValue([]);
      prisma.tangFigure.count.mockResolvedValue(58);

      const result = await service.getTangFigures(
        asQuery<FigureQueryDto>({ page: 3, limit: 20 }),
      );

      expect(result.meta).toEqual(
        expect.objectContaining({ total: 58, page: 3, limit: 20 }),
      );
    });
  });
});
