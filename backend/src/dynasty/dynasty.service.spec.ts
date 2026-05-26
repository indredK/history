import { Test, type TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DynastyService } from './dynasty.service';
import { PrismaService } from '../prisma/prisma.service';
import type { DynastyQueryDto } from './dto/dynasty-query.dto';

/**
 * PaginationQueryDto 把 skip/take 暴露为只读 getter,导致裸字面量
 * 不满足 DynastyQueryDto 类型 —— 用一个泛型 helper 集中收口 as 断言。
 */
function asQuery<T>(partial: Partial<T>): T {
  return partial as T;
}

/**
 * DynastyService 单元测试
 *
 * 覆盖目标(§1.6 单元测试起步):
 * - findAll:where 拼装(name 模糊 / startYear gte / endYear lte+null)、分页计算、空筛选场景
 * - findOne:命中返回、未命中抛 NotFoundException
 *
 * Prisma 使用 mock 注入,不涉及真实数据库,适合 CI 中跑。
 */
describe('DynastyService', () => {
  let service: DynastyService;
  let prisma: {
    dynasty: {
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      dynasty: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [DynastyService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get<DynastyService>(DynastyService);
  });

  describe('findAll', () => {
    it('无筛选条件时使用默认分页,where 为空对象', async () => {
      prisma.dynasty.findMany.mockResolvedValue([]);
      prisma.dynasty.count.mockResolvedValue(0);

      const result = await service.findAll(asQuery<DynastyQueryDto>({}));

      expect(prisma.dynasty.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 20,
        orderBy: { startYear: 'asc' },
      });
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
      expect(result.meta.total).toBe(0);
    });

    it('name 参数生成 contains 模糊查询', async () => {
      prisma.dynasty.findMany.mockResolvedValue([]);
      prisma.dynasty.count.mockResolvedValue(0);

      await service.findAll(asQuery<DynastyQueryDto>({ name: '唐' }));

      expect(prisma.dynasty.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { name: { contains: '唐' } },
        }),
      );
    });

    it('startYear / endYear 转为对应的 gte 与 OR(lte 或 null)条件', async () => {
      prisma.dynasty.findMany.mockResolvedValue([]);
      prisma.dynasty.count.mockResolvedValue(0);

      await service.findAll(
        asQuery<DynastyQueryDto>({ startYear: 200, endYear: 600 }),
      );

      expect(prisma.dynasty.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            startYear: { gte: 200 },
            OR: [{ endYear: { lte: 600 } }, { endYear: null }],
          },
        }),
      );
    });

    it('page=3 limit=10 转换为 skip=20', async () => {
      prisma.dynasty.findMany.mockResolvedValue([]);
      prisma.dynasty.count.mockResolvedValue(0);

      await service.findAll(asQuery<DynastyQueryDto>({ page: 3, limit: 10 }));

      expect(prisma.dynasty.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
    });

    it('返回结构包含 data 与 pagination', async () => {
      const fakeRows = [{ id: 'a', name: '唐', startYear: 618, endYear: 907 }];
      prisma.dynasty.findMany.mockResolvedValue(fakeRows);
      prisma.dynasty.count.mockResolvedValue(1);

      const result = await service.findAll(asQuery<DynastyQueryDto>({}));

      expect(result.data).toBe(fakeRows);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('找到记录时直接返回', async () => {
      const fake = { id: 'tang', name: '唐' };
      prisma.dynasty.findUnique.mockResolvedValue(fake);

      const result = await service.findOne('tang');

      expect(prisma.dynasty.findUnique).toHaveBeenCalledWith({
        where: { id: 'tang' },
      });
      expect(result).toBe(fake);
    });

    it('未找到时抛 NotFoundException,异常信息含传入 ID', async () => {
      prisma.dynasty.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('missing')).rejects.toThrow(/missing/);
    });
  });
});
