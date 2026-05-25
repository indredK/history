import { Test, type TestingModule } from '@nestjs/testing';
import { SanguoService } from './sanguo.service';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * 把 mock 的第 N 次调用第 M 个参数还原为期望类型,
 * 集中处理 jest.Mock.calls 必然产生的 unsafe-member-access。
 */
function getCallArg<T>(mock: jest.Mock, callIdx = 0, argIdx = 0): T {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return mock.mock.calls[callIdx]?.[argIdx] as T;
}

/**
 * SanguoService 单元测试 (§1.6)
 *
 * Sanguo 与其它 5 个朝代不同:筛选维度是 `kingdom`(国家)而不是 `period`(时期),
 * 且 `role / kingdom` 都用 eq 而不是 contains。这个 spec 覆盖 Sanguo 与
 * Tang 模板的差异部分;共用的 transformFigure 路径已在
 * FigureBaseService spec 中验证过。
 */
describe('SanguoService', () => {
  let service: SanguoService;
  let prisma: {
    sanguoFigure: {
      findMany: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      sanguoFigure: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [SanguoService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get<SanguoService>(SanguoService);
  });

  it('默认 page=1 limit=20 skip=0,where = {},orderBy 与其它朝代一致', async () => {
    prisma.sanguoFigure.findMany.mockResolvedValue([]);
    prisma.sanguoFigure.count.mockResolvedValue(0);

    await service.getSanguoFigures({});

    expect(prisma.sanguoFigure.findMany).toHaveBeenCalledWith({
      where: {},
      skip: 0,
      take: 20,
      orderBy: [{ birthYear: 'asc' }, { name: 'asc' }],
    });
  });

  it('kingdom 直接 eq(不是 contains),与其它朝代的 role 区分开', async () => {
    prisma.sanguoFigure.findMany.mockResolvedValue([]);
    prisma.sanguoFigure.count.mockResolvedValue(0);

    await service.getSanguoFigures({ kingdom: '蜀' });

    const call = getCallArg<{ where: { kingdom?: string } }>(
      prisma.sanguoFigure.findMany,
    );
    expect(call.where.kingdom).toBe('蜀');
  });

  it('role 直接 eq(与 Tang/Song/Yuan/Ming/Qing 的 contains 不一样)', async () => {
    prisma.sanguoFigure.findMany.mockResolvedValue([]);
    prisma.sanguoFigure.count.mockResolvedValue(0);

    await service.getSanguoFigures({ role: 'general' });

    const call = getCallArg<{ where: { role?: string } }>(
      prisma.sanguoFigure.findMany,
    );
    expect(call.where.role).toBe('general');
  });

  it('name 走 contains 模糊匹配', async () => {
    prisma.sanguoFigure.findMany.mockResolvedValue([]);
    prisma.sanguoFigure.count.mockResolvedValue(0);

    await service.getSanguoFigures({ name: '诸' });

    const call = getCallArg<{ where: { name?: { contains?: string } } }>(
      prisma.sanguoFigure.findMany,
    );
    expect(call.where.name).toEqual({ contains: '诸' });
  });

  it('返回项走 transformFigure,JSON 字段被解析', async () => {
    prisma.sanguoFigure.findMany.mockResolvedValue([
      {
        id: 'zhugeliang',
        name: '诸葛亮',
        kingdom: '蜀',
        role: 'general',
        achievements: '["三顾茅庐","赤壁之战"]',
        battles: '["官渡","赤壁","汉中"]',
        positions: '["丞相"]',
        events: '[]',
        evaluations: null,
        sources: null,
        works: null,
        policies: null,
        majorEvents: null,
      },
    ]);
    prisma.sanguoFigure.count.mockResolvedValue(1);

    const result = await service.getSanguoFigures({});

    const figure = result.data[0] as Record<string, unknown>;
    expect(figure.id).toBe('zhugeliang');
    expect(figure.achievements).toEqual(['三顾茅庐', '赤壁之战']);
    expect(figure.battles).toEqual(['官渡', '赤壁', '汉中']);
    expect(figure.positions).toEqual(['丞相']);
  });

  it('PaginatedResponseDto meta 字段正确', async () => {
    prisma.sanguoFigure.findMany.mockResolvedValue([]);
    prisma.sanguoFigure.count.mockResolvedValue(7);

    const result = await service.getSanguoFigures({ page: 1, limit: 20 });

    expect(result.meta).toEqual(
      expect.objectContaining({ total: 7, page: 1, limit: 20 }),
    );
  });
});
