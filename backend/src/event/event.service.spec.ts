import { Test, type TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventService } from './event.service';
import { PrismaService } from '../prisma/prisma.service';
import type { EventQueryDto } from './dto/event-query.dto';

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
 * 不满足 EventQueryDto 类型 —— 用一个泛型 helper 集中收口 as 断言。
 */
function asQuery<T>(partial: Partial<T>): T {
  return partial as T;
}

/**
 * EventService 单元测试 (§1.6)
 *
 * 覆盖目标:
 * - findAll:基础 where(title/eventType/startYear/endYear)
 *   + buildOverlapRangeFilter 三分支(全两侧 / 只 start / 只 end / 都不给)
 *   + mergeWhere 单/多块合并
 * - findOne:命中(剥离 participants/locations)、未命中抛 NotFoundException
 * - getTimeline:无事件回落到入参 startYear/endYear,有事件取 min/max
 */
describe('EventService', () => {
  let service: EventService;
  let prisma: {
    event: {
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      event: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [EventService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get<EventService>(EventService);
  });

  describe('findAll', () => {
    it('无任何筛选条件时 where = {}', async () => {
      prisma.event.findMany.mockResolvedValue([]);
      prisma.event.count.mockResolvedValue(0);

      await service.findAll(asQuery<EventQueryDto>({}));

      expect(prisma.event.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 20,
        orderBy: { startYear: 'asc' },
      });
    });

    it('title / eventType / startYear / endYear 各自生成对应字段', async () => {
      prisma.event.findMany.mockResolvedValue([]);
      prisma.event.count.mockResolvedValue(0);

      await service.findAll(
        asQuery<EventQueryDto>({
          title: '战',
          eventType: 'war',
          startYear: 100,
          endYear: 200,
        }),
      );

      const call = getCallArg<{ where: Record<string, unknown> }>(
        prisma.event.findMany,
      );
      expect(call.where).toEqual({
        startYear: { gte: 100 },
        OR: [{ endYear: { lte: 200 } }, { endYear: null }],
        eventType: 'war',
        title: { contains: '战' },
      });
    });

    it('双侧 yearRangeStart + yearRangeEnd 生成三选一 OR(并以 AND 与基础筛选合并)', async () => {
      prisma.event.findMany.mockResolvedValue([]);
      prisma.event.count.mockResolvedValue(0);

      await service.findAll(
        asQuery<EventQueryDto>({
          eventType: 'war',
          yearRangeStart: 100,
          yearRangeEnd: 200,
        }),
      );

      const call = getCallArg<{ where: Record<string, unknown> }>(
        prisma.event.findMany,
      );
      // 基础 where 仅 eventType,因此 mergeWhere 会用 AND 把两块拼起来
      expect(call.where).toHaveProperty('AND');
      const and = call.where.AND as Array<Record<string, unknown>>;
      expect(and).toHaveLength(2);
      expect(and[0]).toEqual({ eventType: 'war' });
      expect(and[1]).toHaveProperty('OR');
      const overlapOr = and[1].OR as Array<Record<string, unknown>>;
      expect(overlapOr).toHaveLength(3);
      // 区间内的 startYear / endYear / 跨越整个区间
      expect(overlapOr[0]).toEqual({
        startYear: { gte: 100, lte: 200 },
      });
      expect(overlapOr[1]).toEqual({
        endYear: { gte: 100, lte: 200 },
      });
    });

    it('只给 yearRangeStart 时:OR( startYear>=start, AND(start<rangeStart, endYear>=rangeStart | endYear null) )', async () => {
      prisma.event.findMany.mockResolvedValue([]);
      prisma.event.count.mockResolvedValue(0);

      await service.findAll(asQuery<EventQueryDto>({ yearRangeStart: 500 }));

      const call = getCallArg<{ where: Record<string, unknown> }>(
        prisma.event.findMany,
      );
      expect(call.where).toHaveProperty('OR');
      const or = call.where.OR as Array<Record<string, unknown>>;
      expect(or[0]).toEqual({ startYear: { gte: 500 } });
      expect(or[1]).toHaveProperty('AND');
    });

    it('只给 yearRangeEnd 时:简化为 startYear lte rangeEnd', async () => {
      prisma.event.findMany.mockResolvedValue([]);
      prisma.event.count.mockResolvedValue(0);

      await service.findAll(asQuery<EventQueryDto>({ yearRangeEnd: 900 }));

      const call = getCallArg<{ where: Record<string, unknown> }>(
        prisma.event.findMany,
      );
      expect(call.where).toEqual({ startYear: { lte: 900 } });
    });
  });

  describe('findOne', () => {
    it('命中时剥离 participants / locations 返回基础字段', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 'e1',
        title: '安史之乱',
        startYear: 755,
        endYear: 763,
        participants: [{ person: { id: 'p1' } }],
        locations: [{ place: { id: 'pl1' } }],
      });

      const result = await service.findOne('e1');

      expect(
        (result as { participants?: unknown }).participants,
      ).toBeUndefined();
      expect((result as { locations?: unknown }).locations).toBeUndefined();
      expect(result).toEqual({
        id: 'e1',
        title: '安史之乱',
        startYear: 755,
        endYear: 763,
      });
    });

    it('未命中时抛 NotFoundException', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getTimeline', () => {
    it('无事件时:bounds 落回入参 startYear / endYear', async () => {
      prisma.event.findMany.mockResolvedValue([]);

      const result = await service.getTimeline({
        startYear: 600,
        endYear: 900,
      });

      expect(result.events).toEqual([]);
      expect(result.totalEvents).toBe(0);
      expect(result.startYear).toBe(600);
      expect(result.endYear).toBe(900);
    });

    it('无事件且无入参 startYear/endYear 时:bounds = 0/0', async () => {
      prisma.event.findMany.mockResolvedValue([]);

      const result = await service.getTimeline({});

      expect(result.startYear).toBe(0);
      expect(result.endYear).toBe(0);
    });

    it('有事件时:bounds 取实际 min(startYear) / max(endYear || startYear)', async () => {
      prisma.event.findMany.mockResolvedValue([
        {
          id: 'a',
          title: 'A',
          startYear: 700,
          endYear: 720,
          eventType: 'war',
          description: 'd1',
        },
        {
          id: 'b',
          title: 'B',
          startYear: 650,
          endYear: null,
          eventType: 'culture',
          description: 'd2',
        },
        {
          id: 'c',
          title: 'C',
          startYear: 800,
          endYear: 850,
          eventType: 'war',
          description: 'd3',
        },
      ]);

      const result = await service.getTimeline({});

      expect(result.events).toHaveLength(3);
      expect(result.totalEvents).toBe(3);
      expect(result.startYear).toBe(650);
      // endYear null 的事件 fallback 到 startYear,因此 max = max(720,650,850) = 850
      expect(result.endYear).toBe(850);
    });

    it('Prisma select 字段为最小集合(不取 participants/locations 等关联)', async () => {
      prisma.event.findMany.mockResolvedValue([]);

      await service.getTimeline({ startYear: 0, endYear: 100 });

      const call = getCallArg<{ select: Record<string, boolean> }>(
        prisma.event.findMany,
      );
      expect(call.select).toEqual({
        id: true,
        title: true,
        startYear: true,
        endYear: true,
        eventType: true,
        description: true,
      });
    });

    it('limit 默认 100,可被入参覆盖', async () => {
      prisma.event.findMany.mockResolvedValue([]);

      await service.getTimeline({});
      let call = getCallArg<{ take: number }>(prisma.event.findMany);
      expect(call.take).toBe(100);

      prisma.event.findMany.mockClear();
      await service.getTimeline({ limit: 5 });
      call = getCallArg<{ take: number }>(prisma.event.findMany);
      expect(call.take).toBe(5);
    });
  });
});
