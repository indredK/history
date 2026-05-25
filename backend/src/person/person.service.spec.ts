import { Test, type TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PersonService } from './person.service';
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
 * PersonService 单元测试 (§1.6)
 *
 * 覆盖目标:
 * - findAll:where 拼装(name 模糊 / birthYear gte / deathYear lte+null)、
 *   双 orderBy(birthYear → name)、分页
 * - findOne:命中(返回时剥离 events 关联)、未命中抛 NotFoundException
 */
describe('PersonService', () => {
  let service: PersonService;
  let prisma: {
    person: {
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      person: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [PersonService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get<PersonService>(PersonService);
  });

  describe('findAll', () => {
    it('默认参数使用 page=1 limit=20 skip=0,where 为空', async () => {
      prisma.person.findMany.mockResolvedValue([]);
      prisma.person.count.mockResolvedValue(0);

      await service.findAll({});

      expect(prisma.person.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 20,
        orderBy: [{ birthYear: 'asc' }, { name: 'asc' }],
      });
    });

    it('name 参数生成 contains 模糊查询', async () => {
      prisma.person.findMany.mockResolvedValue([]);
      prisma.person.count.mockResolvedValue(0);

      await service.findAll({ name: '李白' });

      expect(prisma.person.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { name: { contains: '李白' } } }),
      );
    });

    it('birthYear 生成 gte;deathYear 同时生成 lte 与 null 兜底', async () => {
      prisma.person.findMany.mockResolvedValue([]);
      prisma.person.count.mockResolvedValue(0);

      await service.findAll({ birthYear: 700, deathYear: 800 });

      expect(prisma.person.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            birthYear: { gte: 700 },
            OR: [{ deathYear: { lte: 800 } }, { deathYear: null }],
          },
        }),
      );
    });

    it('双 orderBy 保留:同生年下按 name 二级排序', async () => {
      prisma.person.findMany.mockResolvedValue([]);
      prisma.person.count.mockResolvedValue(0);

      await service.findAll({});

      const call = getCallArg<{ orderBy: Array<Record<string, string>> }>(
        prisma.person.findMany,
      );
      expect(call.orderBy).toEqual([{ birthYear: 'asc' }, { name: 'asc' }]);
    });
  });

  describe('findOne', () => {
    it('命中时剥离 events 字段返回', async () => {
      prisma.person.findUnique.mockResolvedValue({
        id: 'libai',
        name: '李白',
        birthYear: 701,
        deathYear: 762,
        events: [{ event: { id: 'e1' } }, { event: { id: 'e2' } }],
      });

      const result = await service.findOne('libai');

      expect((result as { events?: unknown }).events).toBeUndefined();
      expect(result).toEqual({
        id: 'libai',
        name: '李白',
        birthYear: 701,
        deathYear: 762,
      });
    });

    it('未命中时抛 NotFoundException,异常信息含传入 ID', async () => {
      prisma.person.findUnique.mockResolvedValue(null);

      await expect(service.findOne('ghost')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('ghost')).rejects.toThrow(/ghost/);
    });

    it('查询 include 关联 events.event,以备后续扩展', async () => {
      prisma.person.findUnique.mockResolvedValue({
        id: 'x',
        name: 'x',
        events: [],
      });

      await service.findOne('x');

      expect(prisma.person.findUnique).toHaveBeenCalledWith({
        where: { id: 'x' },
        include: {
          events: {
            include: { event: true },
          },
        },
      });
    });
  });
});
