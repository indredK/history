import { Test, type TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CultureService } from './culture.service';
import { PrismaService } from '../prisma/prisma.service';
import type { ScholarQueryDto } from './dto/scholar-query.dto';
import type { SchoolQueryDto } from './dto/school-query.dto';

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
 * 不满足 ScholarQueryDto / SchoolQueryDto 类型 —— 用一个泛型 helper
 * 集中收口 as 断言。
 */
function asQuery<T>(partial: Partial<T>): T {
  return partial as T;
}

/**
 * CultureService 单元测试 (§1.6)
 *
 * 覆盖目标:
 * - findAllScholars:
 *   * where 拼装:dynastyPeriod / philosophicalSchoolId / schoolName(嵌套) /
 *     name / birthYear gte / deathYear OR(lte + null)
 *   * 双 orderBy:birthYear asc → name asc
 *   * include philosophicalSchool 关联,返回时剥离
 *   * JSON 字段 majorWorks / contributions 解析
 * - findScholarById:命中(剥离 + 解析)、未命中抛 NotFoundException
 * - findAllSchools:
 *   * where 拼装:name / founder / foundingYear gte
 *   * 双 orderBy:foundingYear asc → name asc
 *   * JSON 字段 coreBeliefs / keyTexts 解析
 * - findSchoolById:命中(解析 JSON)、未命中抛 NotFoundException
 * - safeJsonParse 路径间接验证(空值 / 合法 JSON / 非法 JSON / 非字符串原样返回)
 */
describe('CultureService', () => {
  let service: CultureService;
  let prisma: {
    scholar: {
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
    };
    philosophicalSchool: {
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      scholar: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
      },
      philosophicalSchool: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [CultureService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get<CultureService>(CultureService);
  });

  describe('findAllScholars - where 拼装', () => {
    it('默认 page=1 limit=20 skip=0,where = {}', async () => {
      prisma.scholar.findMany.mockResolvedValue([]);
      prisma.scholar.count.mockResolvedValue(0);

      await service.findAllScholars(asQuery<ScholarQueryDto>({}));

      expect(prisma.scholar.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 20,
        orderBy: [{ birthYear: 'asc' }, { name: 'asc' }],
        include: { philosophicalSchool: true },
      });
    });

    it('page=2 limit=15 → skip=15', async () => {
      prisma.scholar.findMany.mockResolvedValue([]);
      prisma.scholar.count.mockResolvedValue(0);

      await service.findAllScholars(
        asQuery<ScholarQueryDto>({ page: 2, limit: 15 }),
      );

      expect(prisma.scholar.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 15, take: 15 }),
      );
    });

    it('dynastyPeriod 走 contains 模糊匹配', async () => {
      prisma.scholar.findMany.mockResolvedValue([]);
      prisma.scholar.count.mockResolvedValue(0);

      await service.findAllScholars(
        asQuery<ScholarQueryDto>({ dynastyPeriod: '春秋' }),
      );

      const call = getCallArg<{
        where: { dynastyPeriod?: { contains?: string } };
      }>(prisma.scholar.findMany);
      expect(call.where.dynastyPeriod).toEqual({ contains: '春秋' });
    });

    it('philosophicalSchoolId 直接 eq', async () => {
      prisma.scholar.findMany.mockResolvedValue([]);
      prisma.scholar.count.mockResolvedValue(0);

      await service.findAllScholars(
        asQuery<ScholarQueryDto>({ philosophicalSchoolId: 'confucianism' }),
      );

      const call = getCallArg<{
        where: { philosophicalSchoolId?: string };
      }>(prisma.scholar.findMany);
      expect(call.where.philosophicalSchoolId).toBe('confucianism');
    });

    it('schoolName 走嵌套 philosophicalSchool.name contains 联表筛选', async () => {
      prisma.scholar.findMany.mockResolvedValue([]);
      prisma.scholar.count.mockResolvedValue(0);

      await service.findAllScholars(
        asQuery<ScholarQueryDto>({ schoolName: '儒' }),
      );

      expect(prisma.scholar.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { philosophicalSchool: { name: { contains: '儒' } } },
        }),
      );
    });

    it('name 走 contains,birthYear 走 gte', async () => {
      prisma.scholar.findMany.mockResolvedValue([]);
      prisma.scholar.count.mockResolvedValue(0);

      await service.findAllScholars(
        asQuery<ScholarQueryDto>({ name: '孔', birthYear: -500 }),
      );

      const call = getCallArg<{
        where: {
          name?: { contains?: string };
          birthYear?: { gte?: number };
        };
      }>(prisma.scholar.findMany);
      expect(call.where.name).toEqual({ contains: '孔' });
      expect(call.where.birthYear).toEqual({ gte: -500 });
    });

    it('deathYear 生成 OR(lte + null)(在世学者兜底)', async () => {
      prisma.scholar.findMany.mockResolvedValue([]);
      prisma.scholar.count.mockResolvedValue(0);

      await service.findAllScholars(asQuery<ScholarQueryDto>({ deathYear: 0 }));

      expect(prisma.scholar.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [{ deathYear: { lte: 0 } }, { deathYear: null }],
          },
        }),
      );
    });
  });

  describe('findAllScholars - 转换与返回', () => {
    it('返回时剥离 philosophicalSchool,并解析 JSON 字段', async () => {
      prisma.scholar.findMany.mockResolvedValue([
        {
          id: 'kongzi',
          name: '孔子',
          majorWorks: '["论语","春秋"]',
          contributions: '["仁","礼"]',
          philosophicalSchool: { id: 'ru', name: '儒家' },
        },
      ]);
      prisma.scholar.count.mockResolvedValue(1);

      const result = await service.findAllScholars(
        asQuery<ScholarQueryDto>({}),
      );

      expect(result.data[0]).toEqual({
        id: 'kongzi',
        name: '孔子',
        majorWorks: ['论语', '春秋'],
        contributions: ['仁', '礼'],
      });
      expect(
        (result.data[0] as { philosophicalSchool?: unknown })
          .philosophicalSchool,
      ).toBeUndefined();
    });

    it('JSON 字段为非法字符串时,safeJsonParse 兜底返回原字符串', async () => {
      prisma.scholar.findMany.mockResolvedValue([
        {
          id: 'x',
          name: 'x',
          majorWorks: 'not-json',
          contributions: null,
          philosophicalSchool: null,
        },
      ]);
      prisma.scholar.count.mockResolvedValue(1);

      const result = await service.findAllScholars(
        asQuery<ScholarQueryDto>({}),
      );

      expect(result.data[0]?.majorWorks).toBe('not-json');
      expect(result.data[0]?.contributions).toBeNull();
    });

    it('PaginatedResponseDto meta 字段正确(total / page / limit)', async () => {
      prisma.scholar.findMany.mockResolvedValue([]);
      prisma.scholar.count.mockResolvedValue(42);

      const result = await service.findAllScholars(
        asQuery<ScholarQueryDto>({ page: 3, limit: 10 }),
      );

      expect(result.meta).toEqual(
        expect.objectContaining({ total: 42, page: 3, limit: 10 }),
      );
    });
  });

  describe('findScholarById', () => {
    it('命中时剥离 philosophicalSchool 并解析 JSON 字段', async () => {
      prisma.scholar.findUnique.mockResolvedValue({
        id: 'mengzi',
        name: '孟子',
        majorWorks: '["孟子"]',
        contributions: '["性善论"]',
        philosophicalSchool: { id: 'ru', name: '儒家' },
      });

      const result = await service.findScholarById('mengzi');

      expect(
        (result as { philosophicalSchool?: unknown }).philosophicalSchool,
      ).toBeUndefined();
      expect(result.majorWorks).toEqual(['孟子']);
      expect(result.contributions).toEqual(['性善论']);
    });

    it('未命中时抛 NotFoundException,异常信息含传入 ID', async () => {
      prisma.scholar.findUnique.mockResolvedValue(null);

      await expect(service.findScholarById('ghost')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findScholarById('ghost')).rejects.toThrow(/ghost/);
    });

    it('查询 include philosophicalSchool', async () => {
      prisma.scholar.findUnique.mockResolvedValue({
        id: 'x',
        name: 'x',
        majorWorks: null,
        contributions: null,
        philosophicalSchool: null,
      });

      await service.findScholarById('x');

      expect(prisma.scholar.findUnique).toHaveBeenCalledWith({
        where: { id: 'x' },
        include: { philosophicalSchool: true },
      });
    });
  });

  describe('findAllSchools - where 拼装', () => {
    it('默认 page=1 limit=20 skip=0,where = {}', async () => {
      prisma.philosophicalSchool.findMany.mockResolvedValue([]);
      prisma.philosophicalSchool.count.mockResolvedValue(0);

      await service.findAllSchools(asQuery<SchoolQueryDto>({}));

      expect(prisma.philosophicalSchool.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 20,
        orderBy: [{ foundingYear: 'asc' }, { name: 'asc' }],
      });
    });

    it('name / founder 走 contains,foundingYear 走 gte', async () => {
      prisma.philosophicalSchool.findMany.mockResolvedValue([]);
      prisma.philosophicalSchool.count.mockResolvedValue(0);

      await service.findAllSchools(
        asQuery<SchoolQueryDto>({
          name: '道',
          founder: '老',
          foundingYear: -600,
        }),
      );

      const call = getCallArg<{
        where: {
          name?: { contains?: string };
          founder?: { contains?: string };
          foundingYear?: { gte?: number };
        };
      }>(prisma.philosophicalSchool.findMany);
      expect(call.where.name).toEqual({ contains: '道' });
      expect(call.where.founder).toEqual({ contains: '老' });
      expect(call.where.foundingYear).toEqual({ gte: -600 });
    });

    it('返回时解析 JSON 字段 coreBeliefs / keyTexts', async () => {
      prisma.philosophicalSchool.findMany.mockResolvedValue([
        {
          id: 'dao',
          name: '道家',
          coreBeliefs: '["无为","自然"]',
          keyTexts: '["道德经","庄子"]',
        },
      ]);
      prisma.philosophicalSchool.count.mockResolvedValue(1);

      const result = await service.findAllSchools(asQuery<SchoolQueryDto>({}));

      expect(result.data[0]?.coreBeliefs).toEqual(['无为', '自然']);
      expect(result.data[0]?.keyTexts).toEqual(['道德经', '庄子']);
    });
  });

  describe('findSchoolById', () => {
    it('命中时解析 JSON 字段', async () => {
      prisma.philosophicalSchool.findUnique.mockResolvedValue({
        id: 'fa',
        name: '法家',
        coreBeliefs: '["以法治国"]',
        keyTexts: '["韩非子"]',
      });

      const result = await service.findSchoolById('fa');

      expect(result.coreBeliefs).toEqual(['以法治国']);
      expect(result.keyTexts).toEqual(['韩非子']);
    });

    it('未命中时抛 NotFoundException,异常信息含传入 ID', async () => {
      prisma.philosophicalSchool.findUnique.mockResolvedValue(null);

      await expect(service.findSchoolById('missing')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findSchoolById('missing')).rejects.toThrow(
        /missing/,
      );
    });
  });

  describe('safeJsonParse 边界(通过路径间接验证)', () => {
    it('空字符串 → null', async () => {
      prisma.philosophicalSchool.findUnique.mockResolvedValue({
        id: 'x',
        name: 'x',
        coreBeliefs: '',
        keyTexts: '   ', // 仅空白也应回落到 null 路径(value && trim === '' → 走 default)
      });

      const result = await service.findSchoolById('x');

      // '' → falsy → null
      expect(result.coreBeliefs).toBeNull();
      // '   ' → truthy 但 trim === '' → 进 if 但不进 parse,返回原值
      expect(result.keyTexts).toBe('   ');
    });

    it('null / undefined → null', async () => {
      prisma.philosophicalSchool.findUnique.mockResolvedValue({
        id: 'x',
        name: 'x',
        coreBeliefs: null,
        keyTexts: undefined,
      });

      const result = await service.findSchoolById('x');
      expect(result.coreBeliefs).toBeNull();
      expect(result.keyTexts).toBeNull();
    });

    it('已经是数组/对象 → 原样返回(不二次解析)', async () => {
      const arr = ['已经解析'];
      const obj = { k: 1 };
      prisma.philosophicalSchool.findUnique.mockResolvedValue({
        id: 'x',
        name: 'x',
        coreBeliefs: arr,
        keyTexts: obj,
      });

      const result = await service.findSchoolById('x');
      expect(result.coreBeliefs).toBe(arr);
      expect(result.keyTexts).toBe(obj);
    });
  });
});
