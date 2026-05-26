import { Test, type TestingModule } from '@nestjs/testing';
import { QingService } from './qing.service';
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
 * QingService 单元测试 (§1.6)
 *
 * Qing 与 Tang/Ming/Song/Yuan 的差异点:
 * - orderBy 用 `[reignStart asc, name asc]` 而非 `[birthYear asc, name asc]`
 *   (因为 Qing 模型是 QingRuler — 帝王,以登基年序而非出生年序排列)
 * - 没有 `period` 字段(与 Yuan 一样是 Tang 的子集)
 *
 * 本 spec 仅覆盖 Qing 独有的代码路径;
 * 共用的 transformFigure 路径已在 FigureBaseService spec 中验证。
 */
describe('QingService', () => {
  let service: QingService;
  let prisma: {
    qingRuler: {
      findMany: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      qingRuler: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [QingService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get<QingService>(QingService);
  });

  it('默认 page=1 limit=20 skip=0,where = {},orderBy 用 reignStart(非 birthYear)', async () => {
    prisma.qingRuler.findMany.mockResolvedValue([]);
    prisma.qingRuler.count.mockResolvedValue(0);

    await service.getQingRulers(asQuery<FigureQueryDto>({}));

    expect(prisma.qingRuler.findMany).toHaveBeenCalledWith({
      where: {},
      skip: 0,
      take: 20,
      orderBy: [{ reignStart: 'asc' }, { name: 'asc' }],
    });
  });

  it('role 走 contains 模糊匹配', async () => {
    prisma.qingRuler.findMany.mockResolvedValue([]);
    prisma.qingRuler.count.mockResolvedValue(0);

    await service.getQingRulers(asQuery<FigureQueryDto>({ role: 'emperor' }));

    const call = getCallArg<{ where: { role?: { contains?: string } } }>(
      prisma.qingRuler.findMany,
    );
    expect(call.where.role).toEqual({ contains: 'emperor' });
  });

  it('name 走 contains 模糊匹配', async () => {
    prisma.qingRuler.findMany.mockResolvedValue([]);
    prisma.qingRuler.count.mockResolvedValue(0);

    await service.getQingRulers(asQuery<FigureQueryDto>({ name: '康' }));

    const call = getCallArg<{ where: { name?: { contains?: string } } }>(
      prisma.qingRuler.findMany,
    );
    expect(call.where.name).toEqual({ contains: '康' });
  });

  it('birthYear 走 gte(0 也进入 where,因为是 !== undefined 而非 truthy)', async () => {
    prisma.qingRuler.findMany.mockResolvedValue([]);
    prisma.qingRuler.count.mockResolvedValue(0);

    await service.getQingRulers(asQuery<FigureQueryDto>({ birthYear: 0 }));

    const call = getCallArg<{ where: { birthYear?: { gte?: number } } }>(
      prisma.qingRuler.findMany,
    );
    expect(call.where.birthYear).toEqual({ gte: 0 });
  });

  it('deathYear 走 OR(lte, null)', async () => {
    prisma.qingRuler.findMany.mockResolvedValue([]);
    prisma.qingRuler.count.mockResolvedValue(0);

    await service.getQingRulers(asQuery<FigureQueryDto>({ deathYear: 1912 }));

    const call = getCallArg<{
      where: {
        OR?: Array<{ deathYear?: { lte: number } } | { deathYear: null }>;
      };
    }>(prisma.qingRuler.findMany);
    expect(call.where.OR).toEqual([
      { deathYear: { lte: 1912 } },
      { deathYear: null },
    ]);
  });

  it('不接受 period 字段(Qing 模型无 period)', async () => {
    prisma.qingRuler.findMany.mockResolvedValue([]);
    prisma.qingRuler.count.mockResolvedValue(0);

    // 即便上层 DTO 传了 period,Qing service 解构里没有该字段
    await service.getQingRulers({ role: '皇帝' } as never);

    const call = getCallArg<{ where: Record<string, unknown> }>(
      prisma.qingRuler.findMany,
    );
    expect(call.where).not.toHaveProperty('period');
  });

  it('分页参数透传:page=3 limit=5 → skip=10 take=5', async () => {
    prisma.qingRuler.findMany.mockResolvedValue([]);
    prisma.qingRuler.count.mockResolvedValue(0);

    await service.getQingRulers(asQuery<FigureQueryDto>({ page: 3, limit: 5 }));

    expect(prisma.qingRuler.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 5 }),
    );
  });

  it('返回项走 transformFigure,JSON 字段被解析', async () => {
    prisma.qingRuler.findMany.mockResolvedValue([
      {
        id: 'kangxi',
        name: '康熙',
        role: '皇帝',
        reignStart: 1661,
        reignEnd: 1722,
        achievements: '["平三藩","收台湾","三征噶尔丹"]',
        policies: '["崇儒重道"]',
        events: '[]',
        evaluations: null,
        sources: null,
      },
    ]);
    prisma.qingRuler.count.mockResolvedValue(1);

    const result = await service.getQingRulers(asQuery<FigureQueryDto>({}));

    const figure = result.data[0] as unknown as Record<string, unknown>;
    expect(figure.id).toBe('kangxi');
    expect(figure.achievements).toEqual(['平三藩', '收台湾', '三征噶尔丹']);
    expect(figure.policies).toEqual(['崇儒重道']);
  });

  it('PaginatedResponseDto meta 字段正确', async () => {
    prisma.qingRuler.findMany.mockResolvedValue([]);
    prisma.qingRuler.count.mockResolvedValue(12);

    const result = await service.getQingRulers(
      asQuery<FigureQueryDto>({ page: 2, limit: 5 }),
    );

    expect(result.meta).toEqual(
      expect.objectContaining({ total: 12, page: 2, limit: 5 }),
    );
  });
});
