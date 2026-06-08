import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';
import { EventQueryDto } from './dto/event-query.dto';
import { TimelineQueryDto } from './dto/timeline-query.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { EventDto } from './dto/event.dto';
import {
  TimelineResponseDto,
  TimelineEventDto,
} from './dto/timeline-event.dto';

/** 时间轴事件查询的最小字段集合,由 Prisma `select` 直接生成。 */
type TimelineEventRow = Pick<
  TimelineEventDto,
  'id' | 'title' | 'startYear' | 'endYear' | 'eventType' | 'description'
>;

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
    if (eventType) baseWhere.eventType = eventType;
    if (title) baseWhere.title = { contains: title };

    // 2) 时间区间重叠筛选(可选)
    const rangeWhere = this.buildOverlapRangeFilter(
      yearRangeStart,
      yearRangeEnd,
    );

    // 3) 合并
    const where = this.mergeWhere(baseWhere, rangeWhere);

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
      include: {
        participants: { include: { person: true } },
        locations: { include: { place: true } },
      },
    });

    if (!event) {
      throw new NotFoundException(`未找到 ID 为 ${id} 的历史事件记录`);
    }

    // 仅返回基础字段,关联关系预留后续扩展
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { participants, locations, ...eventData } = event;
    return eventData;
  }

  async getTimeline(query: TimelineQueryDto): Promise<TimelineResponseDto> {
    const { startYear, endYear, limit = 100, eventType } = query;

    // 时间轴只用范围重叠筛选 + 可选事件类型
    const baseWhere: Prisma.EventWhereInput = {};
    if (eventType) baseWhere.eventType = eventType;

    const rangeWhere = this.buildOverlapRangeFilter(startYear, endYear);
    const where = this.mergeWhere(baseWhere, rangeWhere);

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
   * 时间轴边界计算:有事件时取实际 min/max,无事件时落回入参边界(或 0)。
   * endYear 为 null 的事件用 startYear 兜底参与 max 计算。
   */
  private calculateTimelineBounds(
    events: ReadonlyArray<Pick<TimelineEventRow, 'startYear' | 'endYear'>>,
    fallbackStart?: number,
    fallbackEnd?: number,
  ): { startYear: number; endYear: number } {
    if (events.length === 0) {
      return {
        startYear: fallbackStart ?? 0,
        endYear: fallbackEnd ?? 0,
      };
    }
    return {
      startYear: Math.min(...events.map((e) => e.startYear)),
      endYear: Math.max(...events.map((e) => e.endYear ?? e.startYear)),
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
