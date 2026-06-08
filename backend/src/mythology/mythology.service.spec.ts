import { Test, type TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MythologyService } from './mythology.service';
import { PrismaService } from '../prisma/prisma.service';
import type { MythologyQueryDto } from './dto/mythology-query.dto';

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
 * 不满足 MythologyQueryDto 类型 —— 用一个泛型 helper 集中收口 as 断言。
 */
function asQuery<T>(partial: Partial<T>): T {
  return partial as T;
}

/**
 * MythologyService 单元测试 (§1.6)
 *
 * 覆盖目标:
 * - findAll:
 *   * where:category(eq) / origin(contains) / period(contains) / name(contains)
 *   * 双 orderBy:category asc → name asc
 *   * 分页 page/limit/skip
 *   * 字段映射:DB `name → title`、`origin → source`、固定 `englishTitle=''`/`imageUrl=''`
 *   * description null → 空串兜底
 *   * characters = stories.slice(0,5),非数组时取 []
 *   * safeJsonParse 失败时 `|| []` 兜底
 * - findOne:命中(同样映射 + JSON 解析)、未命中抛 NotFoundException
 */
describe('MythologyService', () => {
  let service: MythologyService;
  let prisma: {
    mythology: {
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      mythology: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        MythologyService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = moduleRef.get<MythologyService>(MythologyService);
  });

  describe('findAll - where 拼装', () => {
    it('默认 page=1 limit=20 skip=0,where = {}', async () => {
      prisma.mythology.findMany.mockResolvedValue([]);
      prisma.mythology.count.mockResolvedValue(0);

      await service.findAll(asQuery<MythologyQueryDto>({}));

      expect(prisma.mythology.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 20,
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      });
    });

    it('page=4 limit=5 → skip=15', async () => {
      prisma.mythology.findMany.mockResolvedValue([]);
      prisma.mythology.count.mockResolvedValue(0);

      await service.findAll(asQuery<MythologyQueryDto>({ page: 4, limit: 5 }));

      expect(prisma.mythology.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 15, take: 5 }),
      );
    });

    it('category legacy 别名归一为中文分类后 eq', async () => {
      prisma.mythology.findMany.mockResolvedValue([]);
      prisma.mythology.count.mockResolvedValue(0);

      await service.findAll(
        asQuery<MythologyQueryDto>({ category: 'creation' }),
      );

      const call = getCallArg<{ where: { category?: string } }>(
        prisma.mythology.findMany,
      );
      expect(call.where.category).toBe('创世神话');
    });

    it('origin / period / name 都走 contains 模糊匹配', async () => {
      prisma.mythology.findMany.mockResolvedValue([]);
      prisma.mythology.count.mockResolvedValue(0);

      await service.findAll(
        asQuery<MythologyQueryDto>({
          origin: '黄河',
          period: '上古',
          name: '盘古',
        }),
      );

      const call = getCallArg<{
        where: {
          origin?: { contains?: string };
          period?: { contains?: string };
          name?: { contains?: string };
        };
      }>(prisma.mythology.findMany);
      expect(call.where.origin).toEqual({ contains: '黄河' });
      expect(call.where.period).toEqual({ contains: '上古' });
      expect(call.where.name).toEqual({ contains: '盘古' });
    });
  });

  describe('findAll - 字段映射与转换', () => {
    it('name → title, origin → source, 固定占位 englishTitle/imageUrl=""', async () => {
      prisma.mythology.findMany.mockResolvedValue([
        {
          id: 'pangu',
          name: '盘古开天',
          category: 'creation',
          description: '盘古劈开混沌',
          origin: '上古传说',
          stories: '[]',
          symbolism: '[]',
        },
      ]);
      prisma.mythology.count.mockResolvedValue(1);

      const result = await service.findAll(asQuery<MythologyQueryDto>({}));

      expect(result.data[0]).toMatchObject({
        id: 'pangu',
        title: '盘古开天',
        englishTitle: '',
        category: '创世神话',
        description: '盘古劈开混沌',
        source: '上古传说',
        imageUrl: '',
      });
    });

    it('description / origin 为 null 时回落空字符串', async () => {
      prisma.mythology.findMany.mockResolvedValue([
        {
          id: 'x',
          name: 'x',
          category: 'creation',
          description: null,
          origin: null,
          stories: null,
          symbolism: null,
        },
      ]);
      prisma.mythology.count.mockResolvedValue(1);

      const result = await service.findAll(asQuery<MythologyQueryDto>({}));

      expect(result.data[0]?.description).toBe('');
      expect(result.data[0]?.source).toBe('');
    });

    it('characters = stories.slice(0,5),超长数组被截断到 5 个', async () => {
      prisma.mythology.findMany.mockResolvedValue([
        {
          id: 'x',
          name: 'x',
          category: 'creation',
          description: '',
          origin: '',
          stories: '["a","b","c","d","e","f","g"]',
          symbolism: '[]',
        },
      ]);
      prisma.mythology.count.mockResolvedValue(1);

      const result = await service.findAll(asQuery<MythologyQueryDto>({}));

      expect(result.data[0]?.characters).toEqual(['a', 'b', 'c', 'd', 'e']);
    });

    it('stories 不是数组(对象)时,characters 回落空数组', async () => {
      prisma.mythology.findMany.mockResolvedValue([
        {
          id: 'x',
          name: 'x',
          category: 'creation',
          description: '',
          origin: '',
          // 解析出来是对象,不是数组
          stories: '{"a":1}',
          symbolism: '[]',
        },
      ]);
      prisma.mythology.count.mockResolvedValue(1);

      const result = await service.findAll(asQuery<MythologyQueryDto>({}));

      expect(result.data[0]?.characters).toEqual([]);
    });

    it('stories 为 null / 非法 JSON 时 characters = []', async () => {
      prisma.mythology.findMany.mockResolvedValue([
        {
          id: 'a',
          name: 'a',
          category: 'creation',
          description: '',
          origin: '',
          stories: null,
          symbolism: null,
        },
        {
          id: 'b',
          name: 'b',
          category: 'creation',
          description: '',
          origin: '',
          // 非法 JSON,safeJsonParse 兜底返回原字符串
          // → `|| []` 兜底走原字符串?注意原字符串是 truthy,
          //   所以 stories 取到原字符串,Array.isArray('not-json') === false,
          //   最终 characters 为 []
          stories: 'not-json',
          symbolism: 'not-json',
        },
      ]);
      prisma.mythology.count.mockResolvedValue(2);

      const result = await service.findAll(asQuery<MythologyQueryDto>({}));

      expect(result.data[0]?.characters).toEqual([]);
      expect(result.data[1]?.characters).toEqual([]);
    });

    it('PaginatedResponseDto meta 字段正确', async () => {
      prisma.mythology.findMany.mockResolvedValue([]);
      prisma.mythology.count.mockResolvedValue(13);

      const result = await service.findAll(
        asQuery<MythologyQueryDto>({ page: 2, limit: 5 }),
      );

      expect(result.meta).toEqual(
        expect.objectContaining({ total: 13, page: 2, limit: 5 }),
      );
    });
  });

  describe('findOne', () => {
    it('命中时返回字段映射后的 DTO', async () => {
      prisma.mythology.findUnique.mockResolvedValue({
        id: 'nuwa',
        name: '女娲造人',
        category: '创世神话',
        description: '抟土造人',
        origin: '上古',
        stories: '["女娲","伏羲","共工"]',
        symbolism: '["创世","母性"]',
      });

      const result = await service.findOne('nuwa');

      expect(result).toMatchObject({
        id: 'nuwa',
        title: '女娲造人',
        englishTitle: '',
        category: '创世神话',
        description: '抟土造人',
        source: '上古',
        imageUrl: '',
        characters: ['女娲', '伏羲', '共工'],
      });
    });

    it('未命中时抛 NotFoundException,异常信息含传入 ID', async () => {
      prisma.mythology.findUnique.mockResolvedValue(null);

      await expect(service.findOne('ghost')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('ghost')).rejects.toThrow(/ghost/);
    });

    it('查询使用 findUnique where: { id }', async () => {
      prisma.mythology.findUnique.mockResolvedValue({
        id: 'x',
        name: 'x',
        category: 'creation',
        description: null,
        origin: null,
        stories: null,
        symbolism: null,
      });

      await service.findOne('x');

      expect(prisma.mythology.findUnique).toHaveBeenCalledWith({
        where: { id: 'x' },
      });
    });

    it('findOne 也对 description / origin null 做空串兜底', async () => {
      prisma.mythology.findUnique.mockResolvedValue({
        id: 'x',
        name: 'x',
        category: 'creation',
        description: null,
        origin: null,
        stories: null,
        symbolism: null,
      });

      const result = await service.findOne('x');

      expect(result.description).toBe('');
      expect(result.source).toBe('');
      expect(result.characters).toEqual([]);
    });
  });

  describe('create/update - 保存校验', () => {
    it('创建神话时标题不能为空', async () => {
      await expect(
        service.create(asQuery({
          title: '   ',
          category: '创世神话',
          description: '描述',
        })),
      ).rejects.toThrow(BadRequestException);
    });

    it('创建神话时分类必须有效', async () => {
      await expect(
        service.create(asQuery({
          title: '盘古开天',
          category: '未知分类',
          description: '描述',
        })),
      ).rejects.toThrow(BadRequestException);
    });

    it('更新神话时不能清空描述', async () => {
      prisma.mythology.findUnique.mockResolvedValue({
        id: 'pangu',
        name: '盘古开天',
        category: '创世神话',
        description: '盘古劈开混沌',
        origin: '',
        stories: null,
        symbolism: null,
      });

      await expect(
        service.update('pangu', asQuery({ description: '   ' })),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
