import { Test, type TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { EventService } from './event.service';
import { PrismaService } from '../prisma/prisma.service';
import type { EventQueryDto } from './dto/event-query.dto';

function getCallArg<T>(mock: jest.Mock, callIdx = 0, argIdx = 0): T {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return mock.mock.calls[callIdx]?.[argIdx] as T;
}

function asQuery<T>(partial: Partial<T>): T {
  return partial as T;
}

function buildDetailRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: 'event-1',
    title: '安史之乱',
    startYear: 755,
    endYear: 763,
    description: '唐朝中后期重大内乱',
    eventType: 'war,civil_war',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    participants: [
      {
        id: 'ep-1',
        personId: 'p-1',
        role: '主将',
        person: {
          id: 'p-1',
          name: '郭子仪',
          dynasty: '唐',
        },
      },
    ],
    locations: [
      {
        id: 'el-1',
        placeId: 'pl-1',
        role: '战场',
        place: {
          id: 'pl-1',
          name: '洛阳',
          latitude: 34.62,
          longitude: 112.45,
        },
      },
    ],
    eventSources: [
      {
        id: 'es-1',
        sourceId: 's-1',
        source: {
          id: 's-1',
          title: '资治通鉴',
          url: 'https://example.com/zztj',
          author: '司马光',
        },
      },
    ],
    ...overrides,
  };
}

describe('EventService', () => {
  let service: EventService;
  let tx: {
    event: {
      create: jest.Mock;
      update: jest.Mock;
    };
    person: {
      findMany: jest.Mock;
    };
    place: {
      findMany: jest.Mock;
    };
    source: {
      findMany: jest.Mock;
    };
    eventParticipant: {
      deleteMany: jest.Mock;
      createMany: jest.Mock;
    };
    eventLocation: {
      deleteMany: jest.Mock;
      createMany: jest.Mock;
    };
    eventSource: {
      deleteMany: jest.Mock;
      createMany: jest.Mock;
    };
  };
  let prisma: {
    client: {
      $transaction: jest.Mock;
    };
    event: {
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    tx = {
      event: {
        create: jest.fn(),
        update: jest.fn(),
      },
      person: {
        findMany: jest.fn(),
      },
      place: {
        findMany: jest.fn(),
      },
      source: {
        findMany: jest.fn(),
      },
      eventParticipant: {
        deleteMany: jest.fn(),
        createMany: jest.fn(),
      },
      eventLocation: {
        deleteMany: jest.fn(),
        createMany: jest.fn(),
      },
      eventSource: {
        deleteMany: jest.fn(),
        createMany: jest.fn(),
      },
    };

    prisma = {
      client: {
        $transaction: jest.fn(async (callback: (client: typeof tx) => unknown) =>
          callback(tx),
        ),
      },
      event: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
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
        AND: [
          {
            startYear: { gte: 100 },
            OR: [{ endYear: { lte: 200 } }, { endYear: null }],
            title: { contains: '战' },
          },
          {
            OR: [
              { eventType: 'war' },
              { eventType: { startsWith: 'war,' } },
              { eventType: { endsWith: ',war' } },
              { eventType: { contains: ',war,' } },
            ],
          },
        ],
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
      expect(call.where).toHaveProperty('AND');
      const and = call.where.AND as Array<Record<string, unknown>>;
      expect(and[0]).toEqual({
        OR: [
          { eventType: 'war' },
          { eventType: { startsWith: 'war,' } },
          { eventType: { endsWith: ',war' } },
          { eventType: { contains: ',war,' } },
        ],
      });
      expect(and[1]).toHaveProperty('OR');
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

    it('eventType 按逗号分隔标签边界匹配,避免漏掉多标签事件', async () => {
      prisma.event.findMany.mockResolvedValue([]);
      prisma.event.count.mockResolvedValue(0);

      await service.findAll(asQuery<EventQueryDto>({ eventType: 'civil_war' }));

      const call = getCallArg<{ where: Record<string, unknown> }>(
        prisma.event.findMany,
      );
      expect(call.where).toEqual({
        OR: [
          { eventType: 'civil_war' },
          { eventType: { startsWith: 'civil_war,' } },
          { eventType: { endsWith: ',civil_war' } },
          { eventType: { contains: ',civil_war,' } },
        ],
      });
    });
  });

  describe('findOne', () => {
    it('命中时返回带 participants / locations / sources 的详情结构', async () => {
      prisma.event.findUnique.mockResolvedValue(buildDetailRecord());

      const result = await service.findOne('event-1');

      expect(prisma.event.findUnique).toHaveBeenCalledWith({
        where: { id: 'event-1' },
        include: expect.objectContaining({
          participants: expect.any(Object),
          locations: expect.any(Object),
          eventSources: expect.any(Object),
        }),
      });
      expect(result.participants?.[0]).toEqual({
        id: 'ep-1',
        personId: 'p-1',
        role: '主将',
        person: {
          id: 'p-1',
          name: '郭子仪',
          dynasty: '唐',
        },
      });
      expect(result.locations?.[0]?.place?.name).toBe('洛阳');
      expect(result.sources?.[0]?.title).toBe('资治通鉴');
    });

    it('未命中时抛 NotFoundException', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('创建时规范化标题/标签并写入关联关系', async () => {
      tx.person.findMany.mockResolvedValue([{ id: 'p-1' }]);
      tx.place.findMany.mockResolvedValue([{ id: 'pl-1' }]);
      tx.source.findMany.mockResolvedValue([{ id: 's-1' }]);
      tx.event.create.mockResolvedValue({ id: 'event-1' });
      prisma.event.findUnique.mockResolvedValue(buildDetailRecord());

      const result = await service.create({
        title: ' 安史之乱 ',
        startYear: 755,
        endYear: 763,
        description: ' 唐朝中后期重大内乱 ',
        eventType: ' war , civil_war ',
        participants: [{ personId: 'p-1', role: ' 主将 ' }],
        locations: [{ placeId: 'pl-1', role: ' 战场 ' }],
        sourceIds: ['s-1'],
      });

      expect(tx.event.create).toHaveBeenCalledWith({
        data: {
          title: '安史之乱',
          startYear: 755,
          endYear: 763,
          description: '唐朝中后期重大内乱',
          eventType: 'war,civil_war',
        },
      });
      expect(tx.eventParticipant.deleteMany).toHaveBeenCalledWith({
        where: { eventId: 'event-1' },
      });
      expect(tx.eventParticipant.createMany).toHaveBeenCalledWith({
        data: [{ eventId: 'event-1', personId: 'p-1', role: '主将' }],
      });
      expect(tx.eventLocation.createMany).toHaveBeenCalledWith({
        data: [{ eventId: 'event-1', placeId: 'pl-1', role: '战场' }],
      });
      expect(tx.eventSource.createMany).toHaveBeenCalledWith({
        data: [{ eventId: 'event-1', sourceId: 's-1' }],
      });
      expect(result.sources?.[0]?.id).toBe('s-1');
    });

    it('标题为空时抛 BadRequestException', async () => {
      await expect(
        service.create({
          title: '   ',
          startYear: 755,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('引用不存在的人物/地点/来源时抛 BadRequestException', async () => {
      tx.person.findMany.mockResolvedValue([]);
      tx.place.findMany.mockResolvedValue([]);
      tx.source.findMany.mockResolvedValue([]);

      await expect(
        service.create({
          title: '安史之乱',
          startYear: 755,
          participants: [{ personId: 'missing-person' }],
          locations: [{ placeId: 'missing-place' }],
          sourceIds: ['missing-source'],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('空更新体时直接返回现有详情且不触发事务更新', async () => {
      prisma.event.findUnique.mockResolvedValue(buildDetailRecord());

      const result = await service.update('event-1', {});

      expect(prisma.client.$transaction).not.toHaveBeenCalled();
      expect(result.title).toBe('安史之乱');
    });

    it('支持清空可选字段并替换关联关系', async () => {
      prisma.event.findUnique
        .mockResolvedValueOnce(buildDetailRecord())
        .mockResolvedValueOnce(
          buildDetailRecord({
            description: null,
            eventType: null,
            participants: [],
            locations: [
              {
                id: 'el-2',
                placeId: 'pl-2',
                role: '驻扎地',
                place: {
                  id: 'pl-2',
                  name: '长安',
                  latitude: 34.34,
                  longitude: 108.94,
                },
              },
            ],
            eventSources: [],
          }),
        );
      tx.person.findMany.mockResolvedValue([]);
      tx.place.findMany.mockResolvedValue([{ id: 'pl-2' }]);
      tx.source.findMany.mockResolvedValue([]);

      const result = await service.update('event-1', {
        description: '',
        eventType: '',
        participants: [],
        locations: [{ placeId: 'pl-2', role: ' 驻扎地 ' }],
        sourceIds: [],
      });

      expect(tx.event.update).toHaveBeenCalledWith({
        where: { id: 'event-1' },
        data: {
          title: '安史之乱',
          startYear: 755,
          endYear: 763,
          description: null,
          eventType: null,
        },
      });
      expect(tx.eventParticipant.deleteMany).toHaveBeenCalledWith({
        where: { eventId: 'event-1' },
      });
      expect(tx.eventLocation.createMany).toHaveBeenCalledWith({
        data: [{ eventId: 'event-1', placeId: 'pl-2', role: '驻扎地' }],
      });
      expect(tx.eventSource.deleteMany).toHaveBeenCalledWith({
        where: { eventId: 'event-1' },
      });
      expect(result.locations?.[0]?.place?.name).toBe('长安');
      expect(result.participants).toEqual([]);
    });

    it('结束年份早于开始年份时抛 BadRequestException', async () => {
      prisma.event.findUnique.mockResolvedValue(buildDetailRecord());

      await expect(
        service.update('event-1', {
          startYear: 900,
          endYear: 800,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('删除前先返回现有详情并执行 delete', async () => {
      prisma.event.findUnique.mockResolvedValue(buildDetailRecord());
      prisma.event.delete.mockResolvedValue({ id: 'event-1' });

      const result = await service.remove('event-1');

      expect(prisma.event.delete).toHaveBeenCalledWith({
        where: { id: 'event-1' },
      });
      expect(result.id).toBe('event-1');
      expect(result.sources?.[0]?.title).toBe('资治通鉴');
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

      expect(result.totalEvents).toBe(3);
      expect(result.startYear).toBe(650);
      expect(result.endYear).toBe(850);
    });

    it('eventType 使用与事件列表一致的多标签边界筛选', async () => {
      prisma.event.findMany.mockResolvedValue([]);

      await service.getTimeline({ eventType: 'war' });

      const call = getCallArg<{ where: Record<string, unknown> }>(
        prisma.event.findMany,
      );
      expect(call.where).toEqual({
        OR: [
          { eventType: 'war' },
          { eventType: { startsWith: 'war,' } },
          { eventType: { endsWith: ',war' } },
          { eventType: { contains: ',war,' } },
        ],
      });
    });
  });
});
