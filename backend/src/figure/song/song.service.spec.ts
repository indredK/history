import { Test, type TestingModule } from '@nestjs/testing';
import { SongService } from './song.service';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * 把 mock 的第 N 次调用第 M 个参数还原为期望类型,集中处理 jest.Mock.calls 的 unsafe-member-access。
 */
function getCallArg<T>(mock: jest.Mock, callIdx = 0, argIdx = 0): T {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return mock.mock.calls[callIdx]?.[argIdx] as T;
}

/**
 * SongService 单元测试 (§1.6)
 *
 * Song 与 Tang 同形(同样的 5 字段 where + period),但 role 业务侧偏向
 * "poet / scholar / general / chancellor",这里 role contains 用宋特征值 `chancellor`
 * 加以区分。period 字段在 Song 中典型为 "北宋 / 南宋"。
 */
describe('SongService', () => {
  let service: SongService;
  let prisma: {
    songFigure: {
      findMany: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      songFigure: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [SongService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get<SongService>(SongService);
  });

  describe('getSongFigures - where 拼装', () => {
    it('默认 page=1 limit=20 skip=0,where = {}', async () => {
      prisma.songFigure.findMany.mockResolvedValue([]);
      prisma.songFigure.count.mockResolvedValue(0);

      await service.getSongFigures({});

      expect(prisma.songFigure.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 20,
        orderBy: [{ birthYear: 'asc' }, { name: 'asc' }],
      });
    });

    it('page=4 limit=25 → skip=75', async () => {
      prisma.songFigure.findMany.mockResolvedValue([]);
      prisma.songFigure.count.mockResolvedValue(0);

      await service.getSongFigures({ page: 4, limit: 25 });

      expect(prisma.songFigure.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 75, take: 25 }),
      );
    });

    it('role / name contains + period eq("北宋")', async () => {
      prisma.songFigure.findMany.mockResolvedValue([]);
      prisma.songFigure.count.mockResolvedValue(0);

      await service.getSongFigures({
        role: 'chancellor',
        period: '北宋',
        name: '王',
      });

      const call = getCallArg<{
        where: {
          role?: { contains?: string };
          period?: string;
          name?: { contains?: string };
        };
      }>(prisma.songFigure.findMany);
      expect(call.where.role).toEqual({ contains: 'chancellor' });
      expect(call.where.period).toBe('北宋');
      expect(call.where.name).toEqual({ contains: '王' });
    });

    it('birthYear 生成 gte', async () => {
      prisma.songFigure.findMany.mockResolvedValue([]);
      prisma.songFigure.count.mockResolvedValue(0);

      await service.getSongFigures({ birthYear: 1000 });

      expect(prisma.songFigure.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { birthYear: { gte: 1000 } } }),
      );
    });

    it('deathYear 生成 OR(lte + null)', async () => {
      prisma.songFigure.findMany.mockResolvedValue([]);
      prisma.songFigure.count.mockResolvedValue(0);

      await service.getSongFigures({ deathYear: 1100 });

      expect(prisma.songFigure.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [{ deathYear: { lte: 1100 } }, { deathYear: null }],
          },
        }),
      );
    });

    it('birthYear=0 也会进入 where(用 !== undefined 而非 truthy 判断)', async () => {
      prisma.songFigure.findMany.mockResolvedValue([]);
      prisma.songFigure.count.mockResolvedValue(0);

      await service.getSongFigures({ birthYear: 0 });

      const call = getCallArg<{ where: { birthYear?: { gte?: number } } }>(
        prisma.songFigure.findMany,
      );
      expect(call.where.birthYear).toEqual({ gte: 0 });
    });
  });

  describe('getSongFigures - transformFigure 串联', () => {
    it('每个返回项的 JSON 字段都被解析', async () => {
      prisma.songFigure.findMany.mockResolvedValue([
        {
          id: 'wanganshi',
          name: '王安石',
          birthYear: 1021,
          deathYear: 1086,
          role: 'chancellor',
          period: '北宋',
          achievements: '["熙宁变法"]',
          positions: '["同中书门下平章事"]',
          events: '[]',
          evaluations: null,
          sources: null,
          works: '["临川集"]',
          battles: null,
          policies: '["青苗法","募役法"]',
          majorEvents: null,
        },
      ]);
      prisma.songFigure.count.mockResolvedValue(1);

      const result = await service.getSongFigures({});

      const figure = result.data[0] as Record<string, unknown>;
      expect(figure.id).toBe('wanganshi');
      expect(figure.achievements).toEqual(['熙宁变法']);
      expect(figure.positions).toEqual(['同中书门下平章事']);
      expect(figure.works).toEqual(['临川集']);
      expect(figure.policies).toEqual(['青苗法', '募役法']);
      expect(figure.evaluations).toBeNull();
    });

    it('PaginatedResponseDto meta 字段正确', async () => {
      prisma.songFigure.findMany.mockResolvedValue([]);
      prisma.songFigure.count.mockResolvedValue(73);

      const result = await service.getSongFigures({ page: 2, limit: 20 });

      expect(result.meta).toEqual(
        expect.objectContaining({ total: 73, page: 2, limit: 20 }),
      );
    });
  });
});
