import { Test, type TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
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
 * 覆盖目标:
 * - findAll:where 拼装(name 模糊 / startYear gte / endYear lte+null)、分页计算、空筛选场景
 * - findOne:命中返回、未命中抛 NotFoundException
 * - create/update/remove: 重名校验、年份范围校验、可选字段清空语义
 *
 * Prisma 使用 mock 注入,不涉及真实数据库,适合 CI 中跑。
 */
describe('DynastyService', () => {
  let service: DynastyService;
  let prisma: {
    dynasty: {
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      dynasty: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
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

  describe('create', () => {
    it('创建时校验重名并规范化名称与可选文本字段', async () => {
      const fake = {
        id: 'tang',
        name: '唐朝',
        startYear: 618,
        endYear: 907,
        capital: null,
        founder: '李渊',
        description: '盛世王朝',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      };
      prisma.dynasty.findUnique.mockResolvedValueOnce(null);
      prisma.dynasty.create.mockResolvedValue(fake);

      const result = await service.create({
        name: ' 唐朝 ',
        startYear: 618,
        endYear: 907,
        capital: '   ',
        founder: ' 李渊 ',
        description: ' 盛世王朝 ',
      });

      expect(prisma.dynasty.findUnique).toHaveBeenCalledWith({
        where: { name: '唐朝' },
        select: { id: true },
      });
      expect(prisma.dynasty.create).toHaveBeenCalledWith({
        data: {
          name: '唐朝',
          startYear: 618,
          endYear: 907,
          founder: '李渊',
          description: '盛世王朝',
        },
      });
      expect(result).toBe(fake);
    });

    it('名称重复时抛 ConflictException', async () => {
      prisma.dynasty.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.create({
          name: '唐朝',
          startYear: 618,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('结束年份早于开始年份时抛 BadRequestException', async () => {
      await expect(
        service.create({
          name: '唐朝',
          startYear: 618,
          endYear: 617,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('更新时支持清空可选字段并只写入显式传入字段', async () => {
      const existing = {
        id: 'song',
        name: '宋朝',
        startYear: 960,
        endYear: 1279,
        capital: '开封',
        founder: '赵匡胤',
        description: '原描述',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      };
      const updated = {
        ...existing,
        capital: null,
        founder: '赵匡胤',
        description: null,
        updatedAt: new Date('2026-02-01T00:00:00.000Z'),
      };
      prisma.dynasty.findUnique.mockResolvedValueOnce(existing);
      prisma.dynasty.update.mockResolvedValue(updated);

      const result = await service.update('song', {
        capital: '',
        founder: ' 赵匡胤 ',
        description: null,
      });

      expect(prisma.dynasty.update).toHaveBeenCalledWith({
        where: { id: 'song' },
        data: {
          capital: null,
          founder: '赵匡胤',
          description: null,
        },
      });
      expect(result).toBe(updated);
    });

    it('空更新体时直接返回现有记录且不触发数据库更新', async () => {
      const existing = {
        id: 'zhou',
        name: '周朝',
        startYear: -1046,
        endYear: -256,
        capital: '镐京',
        founder: '姬发',
        description: '西周与东周',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      };
      prisma.dynasty.findUnique.mockResolvedValueOnce(existing);

      const result = await service.update('zhou', {});

      expect(prisma.dynasty.update).not.toHaveBeenCalled();
      expect(result).toBe(existing);
    });

    it('修改名称时会校验重名', async () => {
      prisma.dynasty.findUnique
        .mockResolvedValueOnce({
          id: 'han',
          name: '汉朝',
          startYear: -202,
          endYear: 220,
          capital: '长安',
          founder: '刘邦',
          description: null,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        })
        .mockResolvedValueOnce({ id: 'tang' });

      await expect(
        service.update('han', {
          name: '唐朝',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('更新后的年份范围非法时抛 BadRequestException', async () => {
      prisma.dynasty.findUnique.mockResolvedValue({
        id: 'ming',
        name: '明朝',
        startYear: 1368,
        endYear: 1644,
        capital: '南京',
        founder: '朱元璋',
        description: null,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      await expect(
        service.update('ming', {
          endYear: 1200,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('删除前先确认记录存在', async () => {
      const fake = {
        id: 'qin',
        name: '秦朝',
        startYear: -221,
        endYear: -206,
        capital: '咸阳',
        founder: '嬴政',
        description: null,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      };
      prisma.dynasty.findUnique.mockResolvedValueOnce(fake);
      prisma.dynasty.delete.mockResolvedValue(fake);

      const result = await service.remove('qin');

      expect(prisma.dynasty.delete).toHaveBeenCalledWith({
        where: { id: 'qin' },
      });
      expect(result).toBe(fake);
    });

    it('删除不存在记录时抛 NotFoundException', async () => {
      prisma.dynasty.findUnique.mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
