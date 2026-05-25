import { Test, type TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EmperorService } from './emperor.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * 把 mock 的第 N 次调用第 M 个参数还原为期望类型,
 * 集中处理 jest.Mock.calls 必然产生的 unsafe-member-access。
 */
function getCallArg<T>(mock: jest.Mock, callIdx = 0, argIdx = 0): T {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return mock.mock.calls[callIdx]?.[argIdx] as T;
}

/**
 * EmperorService 单元测试 (§1.6)
 *
 * 覆盖目标:
 * - findAll:where 拼装(dynastyId / reignStart gte / reignEnd lte+null /
 *   name+dynastyName contains)、双 orderBy(reignStart → name)、分页、
 *   include dynasty 关联、返回时剥离 dynasty 并解析 JSON 字段
 * - findOne:命中(剥离 dynasty + 解析 JSON 字段)、未命中抛 NotFoundException
 * - safeJsonParse:经由 transform 路径间接验证 string→obj / 非法 JSON 兜底
 */
describe('EmperorService', () => {
  let service: EmperorService;
  let prisma: {
    emperor: {
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      emperor: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [EmperorService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get<EmperorService>(EmperorService);
  });

  describe('findAll', () => {
    it('默认参数使用 page=1 limit=20 skip=0,where 为空,include dynasty', async () => {
      prisma.emperor.findMany.mockResolvedValue([]);
      prisma.emperor.count.mockResolvedValue(0);

      await service.findAll({});

      expect(prisma.emperor.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 20,
        orderBy: [{ reignStart: 'asc' }, { name: 'asc' }],
        include: { dynasty: true },
      });
    });

    it('page=3 limit=10 → skip=20', async () => {
      prisma.emperor.findMany.mockResolvedValue([]);
      prisma.emperor.count.mockResolvedValue(0);

      await service.findAll({ page: 3, limit: 10 });

      expect(prisma.emperor.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
    });

    it('dynastyId 直接 eq,name 走 contains 模糊', async () => {
      prisma.emperor.findMany.mockResolvedValue([]);
      prisma.emperor.count.mockResolvedValue(0);

      await service.findAll({ dynastyId: 'tang-id', name: '宗' });

      const call = getCallArg<{
        where: { dynastyId?: string; name?: { contains?: string } };
      }>(prisma.emperor.findMany);
      expect(call.where.dynastyId).toBe('tang-id');
      expect(call.where.name).toEqual({ contains: '宗' });
    });

    it('reignStart 生成 gte', async () => {
      prisma.emperor.findMany.mockResolvedValue([]);
      prisma.emperor.count.mockResolvedValue(0);

      await service.findAll({ reignStart: 600 });

      expect(prisma.emperor.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { reignStart: { gte: 600 } } }),
      );
    });

    it('reignEnd 生成 lte 与 null 兜底(在位皇帝)', async () => {
      prisma.emperor.findMany.mockResolvedValue([]);
      prisma.emperor.count.mockResolvedValue(0);

      await service.findAll({ reignEnd: 1000 });

      expect(prisma.emperor.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [{ reignEnd: { lte: 1000 } }, { reignEnd: null }],
          },
        }),
      );
    });

    it('dynastyName 走嵌套 dynasty.name contains 联表筛选', async () => {
      prisma.emperor.findMany.mockResolvedValue([]);
      prisma.emperor.count.mockResolvedValue(0);

      await service.findAll({ dynastyName: '唐' });

      expect(prisma.emperor.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { dynasty: { name: { contains: '唐' } } },
        }),
      );
    });

    it('返回时剥离 dynasty 字段,且 JSON 字段(string)被解析为对象', async () => {
      prisma.emperor.findMany.mockResolvedValue([
        {
          id: 'e1',
          name: '李世民',
          eraNames: '["贞观"]',
          achievements: '["贞观之治"]',
          historicalEvaluation: '{"score":95}',
          dynasty: { id: 'tang', name: '唐朝' },
        },
      ]);
      prisma.emperor.count.mockResolvedValue(1);

      const result = await service.findAll({});

      expect(result.data[0]).toEqual({
        id: 'e1',
        name: '李世民',
        eraNames: ['贞观'],
        achievements: ['贞观之治'],
        historicalEvaluation: { score: 95 },
      });
      expect((result.data[0] as { dynasty?: unknown }).dynasty).toBeUndefined();
    });

    it('JSON 字段为非法字符串时,safeJsonParse 兜底返回原字符串', async () => {
      prisma.emperor.findMany.mockResolvedValue([
        {
          id: 'e1',
          name: '某',
          eraNames: 'not-json',
          achievements: null,
          historicalEvaluation: '',
        },
      ]);
      prisma.emperor.count.mockResolvedValue(1);

      const result = await service.findAll({});

      expect(result.data[0]?.eraNames).toBe('not-json');
      expect(result.data[0]?.achievements).toBeNull();
      // 空字符串走 if (!value) return null
      expect(result.data[0]?.historicalEvaluation).toBeNull();
    });

    it('PaginatedResponseDto meta 字段正确(total / page / limit)', async () => {
      prisma.emperor.findMany.mockResolvedValue([]);
      prisma.emperor.count.mockResolvedValue(157);

      const result = await service.findAll({ page: 2, limit: 25 });

      expect(result.meta).toEqual(
        expect.objectContaining({ total: 157, page: 2, limit: 25 }),
      );
    });
  });

  describe('findOne', () => {
    it('命中时剥离 dynasty 并解析 JSON 字段', async () => {
      prisma.emperor.findUnique.mockResolvedValue({
        id: 'libai',
        name: '李白',
        eraNames: '["开元","天宝"]',
        achievements: '["诗歌"]',
        historicalEvaluation: null,
        dynasty: { id: 'tang', name: '唐朝' },
      });

      const result = await service.findOne('libai');

      expect((result as { dynasty?: unknown }).dynasty).toBeUndefined();
      expect(result.eraNames).toEqual(['开元', '天宝']);
      expect(result.achievements).toEqual(['诗歌']);
      expect(result.historicalEvaluation).toBeNull();
    });

    it('未命中时抛 NotFoundException,异常信息含传入 ID', async () => {
      prisma.emperor.findUnique.mockResolvedValue(null);

      await expect(service.findOne('ghost')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('ghost')).rejects.toThrow(/ghost/);
    });

    it('查询 include 关联 dynasty', async () => {
      prisma.emperor.findUnique.mockResolvedValue({
        id: 'x',
        name: 'x',
        dynasty: null,
      });

      await service.findOne('x');

      expect(prisma.emperor.findUnique).toHaveBeenCalledWith({
        where: { id: 'x' },
        include: { dynasty: true },
      });
    });
  });
});
