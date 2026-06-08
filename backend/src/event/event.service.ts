import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';
import type { EventGetPayload } from '../generated/prisma/models';
import { EventQueryDto } from './dto/event-query.dto';
import { TimelineQueryDto } from './dto/timeline-query.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { EventDto } from './dto/event.dto';
import {
  CreateEventDto,
  EventLocationInputDto,
  EventParticipantInputDto,
} from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import {
  TimelineResponseDto,
  TimelineEventDto,
} from './dto/timeline-event.dto';

const EVENT_DETAIL_INCLUDE = {
  participants: {
    include: {
      person: {
        select: {
          id: true,
          name: true,
          dynasty: true,
        },
      },
    },
  },
  locations: {
    include: {
      place: {
        select: {
          id: true,
          name: true,
          latitude: true,
          longitude: true,
        },
      },
    },
  },
  eventSources: {
    include: {
      source: {
        select: {
          id: true,
          title: true,
          url: true,
          author: true,
        },
      },
    },
  },
} as const;

type EventDetailRecord = EventGetPayload<{
  include: typeof EVENT_DETAIL_INCLUDE;
}>;

/** 时间轴事件查询的最小字段集合,由 Prisma `select` 直接生成。 */
type TimelineEventRow = Pick<
  TimelineEventDto,
  'id' | 'title' | 'startYear' | 'endYear' | 'eventType' | 'description'
>;

type NormalizedParticipant = {
  personId: string;
  role: string | null;
};

type NormalizedLocation = {
  placeId: string;
  role: string | null;
};

type NormalizedEventWriteInput = {
  title: string;
  startYear: number;
  endYear: number | null;
  description: string | null;
  eventType: string | null;
  participants: NormalizedParticipant[];
  locations: NormalizedLocation[];
  sourceIds: string[];
};

@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  // -------- 查询入口 --------

  async findAll(query: EventQueryDto): Promise<PaginatedResponseDto<EventDto>> {
    const {
      page = 1,
      limit = 20,
      startYear,
      endYear,
      yearRangeStart,
      yearRangeEnd,
      eventType,
      title,
    } = query;
    const skip = (page - 1) * limit;

    // 1) 基础边界筛选(独立 gte / lte)
    const baseWhere: Prisma.EventWhereInput = {};
    if (startYear !== undefined) {
      baseWhere.startYear = { gte: startYear };
    }
    if (endYear !== undefined) {
      baseWhere.OR = [
        { endYear: { lte: endYear } },
        { endYear: null }, // 包括仍在进行的事件
      ];
    }
    if (title) baseWhere.title = { contains: title };
    const eventTypeWhere = this.buildEventTypeFilter(eventType);

    // 2) 时间区间重叠筛选(可选)
    const rangeWhere = this.buildOverlapRangeFilter(
      yearRangeStart,
      yearRangeEnd,
    );

    // 3) 合并
    const where = this.mergeWhere(baseWhere, eventTypeWhere, rangeWhere);

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startYear: 'asc' },
      }),
      this.prisma.event.count({ where }),
    ]);

    return new PaginatedResponseDto(events, total, page, limit);
  }

  async findOne(id: string): Promise<EventDto> {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: EVENT_DETAIL_INCLUDE,
    });

    if (!event) {
      throw new NotFoundException(`未找到 ID 为 ${id} 的历史事件记录`);
    }

    return this.toEventDto(event);
  }

  async create(input: CreateEventDto): Promise<EventDto> {
    const normalized = this.normalizeCreateInput(input);

    const created = await this.prisma.client.$transaction(async (tx) => {
      await this.validateRelations(tx, normalized);

      const event = await tx.event.create({
        data: {
          title: normalized.title,
          startYear: normalized.startYear,
          endYear: normalized.endYear,
          description: normalized.description,
          eventType: normalized.eventType,
        },
      });

      await this.replaceRelations(tx, event.id, normalized);

      return event;
    });

    return this.findOne(created.id);
  }

  async update(id: string, input: UpdateEventDto): Promise<EventDto> {
    const current = await this.getEventOrThrow(id);

    const merged = this.normalizeUpdateInput(current, input);
    const hasScalarChanges = this.hasEventScalarChanges(current, merged);
    const shouldReplaceParticipants = input.participants !== undefined;
    const shouldReplaceLocations = input.locations !== undefined;
    const shouldReplaceSources = input.sourceIds !== undefined;

    if (
      !hasScalarChanges &&
      !shouldReplaceParticipants &&
      !shouldReplaceLocations &&
      !shouldReplaceSources
    ) {
      return this.toEventDto(current);
    }

    await this.prisma.client.$transaction(async (tx) => {
      await this.validateRelations(tx, merged);

      if (hasScalarChanges) {
        await tx.event.update({
          where: { id },
          data: {
            title: merged.title,
            startYear: merged.startYear,
            endYear: merged.endYear,
            description: merged.description,
            eventType: merged.eventType,
          },
        });
      }

      await this.replaceRelations(tx, id, {
        participants: shouldReplaceParticipants
          ? merged.participants
          : undefined,
        locations: shouldReplaceLocations ? merged.locations : undefined,
        sourceIds: shouldReplaceSources ? merged.sourceIds : undefined,
      });
    });

    return this.findOne(id);
  }

  async remove(id: string): Promise<EventDto> {
    const event = await this.findOne(id);

    await this.prisma.event.delete({
      where: { id },
    });

    return event;
  }

  async getTimeline(query: TimelineQueryDto): Promise<TimelineResponseDto> {
    const { startYear, endYear, limit = 100, eventType } = query;

    // 时间轴只用范围重叠筛选 + 可选事件类型
    const eventTypeWhere = this.buildEventTypeFilter(eventType);

    const rangeWhere = this.buildOverlapRangeFilter(startYear, endYear);
    const where = this.mergeWhere(eventTypeWhere, rangeWhere);

    const events = (await this.prisma.event.findMany({
      where,
      take: limit,
      orderBy: { startYear: 'asc' },
      select: {
        id: true,
        title: true,
        startYear: true,
        endYear: true,
        eventType: true,
        description: true,
      },
    })) as TimelineEventRow[];

    const bounds = this.calculateTimelineBounds(events, startYear, endYear);

    return {
      events: events.map((e) => this.toTimelineEvent(e)),
      startYear: bounds.startYear,
      endYear: bounds.endYear,
      totalEvents: events.length,
    };
  }

  // -------- 私有辅助 --------

  private async getEventOrThrow(id: string): Promise<EventDetailRecord> {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: EVENT_DETAIL_INCLUDE,
    });

    if (!event) {
      throw new NotFoundException(`未找到 ID 为 ${id} 的历史事件记录`);
    }

    return event;
  }

  private normalizeCreateInput(
    input: CreateEventDto,
  ): NormalizedEventWriteInput {
    const title = this.requireTitle(input.title);
    this.assertYearRange(input.startYear, input.endYear ?? null);

    return {
      title,
      startYear: input.startYear,
      endYear: input.endYear ?? null,
      description: this.normalizeOptionalString(input.description),
      eventType: this.normalizeEventTypeList(input.eventType),
      participants: this.normalizeParticipants(input.participants),
      locations: this.normalizeLocations(input.locations),
      sourceIds: this.normalizeSourceIds(input.sourceIds),
    };
  }

  private normalizeUpdateInput(
    current: EventDetailRecord,
    input: UpdateEventDto,
  ): NormalizedEventWriteInput {
    const title =
      input.title !== undefined
        ? this.requireTitle(input.title)
        : current.title;
    const startYear = input.startYear ?? current.startYear;
    const endYear =
      input.endYear !== undefined ? (input.endYear ?? null) : current.endYear;

    this.assertYearRange(startYear, endYear);

    return {
      title,
      startYear,
      endYear,
      description:
        input.description !== undefined
          ? this.normalizeOptionalString(input.description)
          : current.description,
      eventType:
        input.eventType !== undefined
          ? this.normalizeEventTypeList(input.eventType)
          : current.eventType,
      participants:
        input.participants !== undefined
          ? this.normalizeParticipants(input.participants)
          : current.participants.map((item) => ({
              personId: item.personId,
              role: item.role ?? null,
            })),
      locations:
        input.locations !== undefined
          ? this.normalizeLocations(input.locations)
          : current.locations.map((item) => ({
              placeId: item.placeId,
              role: item.role ?? null,
            })),
      sourceIds:
        input.sourceIds !== undefined
          ? this.normalizeSourceIds(input.sourceIds)
          : current.eventSources.map((item) => item.sourceId),
    };
  }

  private hasEventScalarChanges(
    current: EventDetailRecord,
    next: NormalizedEventWriteInput,
  ): boolean {
    return (
      current.title !== next.title ||
      current.startYear !== next.startYear ||
      current.endYear !== next.endYear ||
      current.description !== next.description ||
      current.eventType !== next.eventType
    );
  }

  private requireTitle(value: string): string {
    const normalized = value.trim();
    if (!normalized) {
      throw new BadRequestException('事件标题不能为空');
    }
    return normalized;
  }

  private assertYearRange(startYear: number, endYear: number | null): void {
    if (startYear === 0 || endYear === 0) {
      throw new BadRequestException('事件年份不能为 0，历史纪年没有公元 0 年');
    }

    if (endYear !== null && endYear < startYear) {
      throw new BadRequestException('事件结束年份不能早于开始年份');
    }
  }

  private normalizeOptionalString(value?: string | null): string | null {
    if (value === undefined || value === null) return null;
    const normalized = value.trim();
    return normalized ? normalized : null;
  }

  private normalizeEventTypeList(value?: string | null): string | null {
    if (value === undefined || value === null) return null;

    const tokens = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    return tokens.length > 0 ? [...new Set(tokens)].join(',') : null;
  }

  private normalizeParticipants(
    participants?: EventParticipantInputDto[],
  ): NormalizedParticipant[] {
    return this.normalizeUniqueByKey(
      participants ?? [],
      (item) => item.personId.trim(),
      '参与人物',
      (item, personId) => ({
        personId,
        role: this.normalizeOptionalString(item.role),
      }),
    );
  }

  private normalizeLocations(
    locations?: EventLocationInputDto[],
  ): NormalizedLocation[] {
    return this.normalizeUniqueByKey(
      locations ?? [],
      (item) => item.placeId.trim(),
      '事件地点',
      (item, placeId) => ({
        placeId,
        role: this.normalizeOptionalString(item.role),
      }),
    );
  }

  private normalizeSourceIds(sourceIds?: string[]): string[] {
    return this.normalizeUniqueByKey(
      sourceIds ?? [],
      (item) => item.trim(),
      '事件来源',
      (_item, sourceId) => sourceId,
    );
  }

  private normalizeUniqueByKey<TInput, TOutput>(
    items: TInput[],
    getKey: (item: TInput) => string,
    label: string,
    mapItem: (item: TInput, key: string) => TOutput,
  ): TOutput[] {
    const seen = new Set<string>();

    return items.map((item) => {
      const key = getKey(item);
      if (!key) {
        throw new BadRequestException(`${label} ID 不能为空`);
      }
      if (seen.has(key)) {
        throw new BadRequestException(`${label}存在重复引用: ${key}`);
      }
      seen.add(key);
      return mapItem(item, key);
    });
  }

  private async validateRelations(
    tx: Prisma.TransactionClient,
    input: Pick<
      NormalizedEventWriteInput,
      'participants' | 'locations' | 'sourceIds'
    >,
  ): Promise<void> {
    await Promise.all([
      this.assertReferencedIdsExist(
        tx.person,
        input.participants.map((item) => item.personId),
        '参与人物',
      ),
      this.assertReferencedIdsExist(
        tx.place,
        input.locations.map((item) => item.placeId),
        '事件地点',
      ),
      this.assertReferencedIdsExist(tx.source, input.sourceIds, '事件来源'),
    ]);
  }

  private async assertReferencedIdsExist<
    TDelegate extends {
      findMany: (args: {
        where: { id: { in: string[] } };
        select: { id: true };
      }) => Promise<Array<{ id: string }>>;
    },
  >(delegate: TDelegate, ids: string[], label: string): Promise<void> {
    if (ids.length === 0) {
      return;
    }

    const existing = await delegate.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });
    const existingIds = new Set(existing.map((item) => item.id));
    const missing = ids.filter((id) => !existingIds.has(id));

    if (missing.length > 0) {
      throw new BadRequestException(
        `${label}引用不存在: ${missing.join('、')}`,
      );
    }
  }

  private async replaceRelations(
    tx: Prisma.TransactionClient,
    eventId: string,
    input: {
      participants?: NormalizedParticipant[];
      locations?: NormalizedLocation[];
      sourceIds?: string[];
    },
  ): Promise<void> {
    if (input.participants !== undefined) {
      await tx.eventParticipant.deleteMany({
        where: { eventId },
      });
      if (input.participants.length > 0) {
        await tx.eventParticipant.createMany({
          data: input.participants.map((item) => ({
            eventId,
            personId: item.personId,
            role: item.role,
          })),
        });
      }
    }

    if (input.locations !== undefined) {
      await tx.eventLocation.deleteMany({
        where: { eventId },
      });
      if (input.locations.length > 0) {
        await tx.eventLocation.createMany({
          data: input.locations.map((item) => ({
            eventId,
            placeId: item.placeId,
            role: item.role,
          })),
        });
      }
    }

    if (input.sourceIds !== undefined) {
      await tx.eventSource.deleteMany({
        where: { eventId },
      });
      if (input.sourceIds.length > 0) {
        await tx.eventSource.createMany({
          data: input.sourceIds.map((sourceId) => ({
            eventId,
            sourceId,
          })),
        });
      }
    }
  }

  /**
   * seed-data 中 eventType 是逗号分隔的多标签字符串。按单个标签筛选时,
   * 需要匹配完整 token,避免 `war` 漏掉 `war,civil_war`,也避免误命中
   * `anti_war` 这类非边界子串。
   */
  private buildEventTypeFilter(eventType?: string): Prisma.EventWhereInput {
    const tag = eventType?.trim();
    if (!tag) return {};

    return {
      OR: [
        { eventType: tag },
        { eventType: { startsWith: `${tag},` } },
        { eventType: { endsWith: `,${tag}` } },
        { eventType: { contains: `,${tag},` } },
      ],
    };
  }

  /**
   * 构造"事件与时间区间有交集"的 WhereInput。
   * 命中条件(三选一,任意成立):
   *   a) 事件 startYear 落在区间内
   *   b) 事件 endYear 落在区间内
   *   c) 事件横跨整个区间(start 早于区间起点 且 end 晚于区间终点,end null 视为持续中)
   *
   * 若只给一侧边界:
   *   - 只给 start:命中起点之后开始的、或仍在进行覆盖到起点的事件
   *   - 只给 end:命中起点早于终点的事件(简化版,与原逻辑保持一致)
   *
   * 两侧都未给则返回空对象(表示无范围筛选)。
   */
  private buildOverlapRangeFilter(
    rangeStart?: number,
    rangeEnd?: number,
  ): Prisma.EventWhereInput {
    if (rangeStart === undefined && rangeEnd === undefined) return {};

    if (rangeStart !== undefined && rangeEnd !== undefined) {
      return {
        OR: [
          { startYear: { gte: rangeStart, lte: rangeEnd } },
          { endYear: { gte: rangeStart, lte: rangeEnd } },
          {
            AND: [
              { startYear: { lte: rangeStart } },
              {
                OR: [{ endYear: { gte: rangeEnd } }, { endYear: null }],
              },
            ],
          },
        ],
      };
    }

    if (rangeStart !== undefined) {
      return {
        OR: [
          { startYear: { gte: rangeStart } },
          {
            AND: [
              { startYear: { lt: rangeStart } },
              {
                OR: [{ endYear: { gte: rangeStart } }, { endYear: null }],
              },
            ],
          },
        ],
      };
    }

    // rangeEnd !== undefined
    return { startYear: { lte: rangeEnd! } };
  }

  /**
   * 合并多个 WhereInput:非空块用 AND 组合。空对象会被丢弃,避免引入冗余 AND 节点。
   */
  private mergeWhere(
    ...parts: Prisma.EventWhereInput[]
  ): Prisma.EventWhereInput {
    const nonEmpty = parts.filter((p) => Object.keys(p).length > 0);
    if (nonEmpty.length === 0) return {};
    if (nonEmpty.length === 1) return nonEmpty[0];
    return { AND: nonEmpty };
  }

  /**
   * 时间轴边界计算:有事件时取实际 min/max,无事件时优先落回入参边界。
   * endYear 为 null 的事件用 startYear 兜底参与 max 计算。
   */
  private calculateTimelineBounds(
    events: ReadonlyArray<Pick<TimelineEventRow, 'startYear' | 'endYear'>>,
    fallbackStart?: number,
    fallbackEnd?: number,
  ): { startYear: number; endYear: number } {
    if (events.length === 0) {
      const emptyStart = fallbackStart ?? fallbackEnd ?? -3000;
      const emptyEnd = fallbackEnd ?? fallbackStart ?? new Date().getFullYear();

      return {
        startYear: Math.min(emptyStart, emptyEnd),
        endYear: Math.max(emptyStart, emptyEnd),
      };
    }
    return {
      startYear: Math.min(...events.map((e) => e.startYear)),
      endYear: Math.max(...events.map((e) => e.endYear ?? e.startYear)),
    };
  }

  private toEventDto(record: EventDetailRecord): EventDto {
    return {
      id: record.id,
      title: record.title,
      startYear: record.startYear,
      endYear: record.endYear,
      description: record.description,
      eventType: record.eventType,
      participants: record.participants.map((item) => ({
        id: item.id,
        personId: item.personId,
        role: item.role,
        person: item.person
          ? {
              id: item.person.id,
              name: item.person.name,
              dynasty: item.person.dynasty,
            }
          : null,
      })),
      locations: record.locations.map((item) => ({
        id: item.id,
        placeId: item.placeId,
        role: item.role,
        place: item.place
          ? {
              id: item.place.id,
              name: item.place.name,
              latitude: item.place.latitude,
              longitude: item.place.longitude,
            }
          : null,
      })),
      sources: record.eventSources.map((item) => ({
        id: item.source.id,
        title: item.source.title,
        url: item.source.url,
        author: item.source.author,
      })),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  /** Prisma row → DTO 显式映射,避免依赖结构相等。 */
  private toTimelineEvent(row: TimelineEventRow): TimelineEventDto {
    return {
      id: row.id,
      title: row.title,
      startYear: row.startYear,
      endYear: row.endYear,
      eventType: row.eventType,
      description: row.description,
    };
  }
}
