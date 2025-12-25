import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventQueryDto } from './dto/event-query.dto';
import { TimelineQueryDto } from './dto/timeline-query.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { EventDto } from './dto/event.dto';
import {
  TimelineResponseDto,
  TimelineEventDto,
} from './dto/timeline-event.dto';

@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

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

    // Build where clause
    const where: any = {};

    if (startYear !== undefined) {
      where.startYear = { gte: startYear };
    }

    if (endYear !== undefined) {
      where.OR = [
        { endYear: { lte: endYear } },
        { endYear: null }, // Include ongoing events
      ];
    }

    // Year range filtering (events that occurred during the specified range)
    if (yearRangeStart !== undefined || yearRangeEnd !== undefined) {
      const rangeConditions: any = {};

      if (yearRangeStart !== undefined && yearRangeEnd !== undefined) {
        // Events that overlap with the range
        rangeConditions.OR = [
          // Event starts within range
          {
            startYear: {
              gte: yearRangeStart,
              lte: yearRangeEnd,
            },
          },
          // Event ends within range
          {
            endYear: {
              gte: yearRangeStart,
              lte: yearRangeEnd,
            },
          },
          // Event spans the entire range
          {
            AND: [
              { startYear: { lte: yearRangeStart } },
              {
                OR: [{ endYear: { gte: yearRangeEnd } }, { endYear: null }],
              },
            ],
          },
        ];
      } else if (yearRangeStart !== undefined) {
        // Events that start after or overlap with start
        rangeConditions.OR = [
          { startYear: { gte: yearRangeStart } },
          {
            AND: [
              { startYear: { lt: yearRangeStart } },
              {
                OR: [{ endYear: { gte: yearRangeStart } }, { endYear: null }],
              },
            ],
          },
        ];
      } else if (yearRangeEnd !== undefined) {
        // Events that end before or overlap with end
        rangeConditions.startYear = { lte: yearRangeEnd };
      }

      // Merge range conditions with existing where clause
      if (Object.keys(where).length > 0) {
        where.AND = [where, rangeConditions];
      } else {
        Object.assign(where, rangeConditions);
      }
    }

    if (eventType) {
      where.eventType = eventType;
    }

    if (title) {
      where.title = { contains: title };
    }

    // Execute queries
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
        participants: {
          include: {
            person: true,
          },
        },
        locations: {
          include: {
            place: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    // Return the event without the relations for now (can be extended later)
    const { participants, locations, ...eventData } = event;
    return eventData;
  }

  async getTimeline(query: TimelineQueryDto): Promise<TimelineResponseDto> {
    const { startYear, endYear, limit = 100, eventType } = query;

    // Build where clause for timeline
    const where: any = {};

    if (startYear !== undefined || endYear !== undefined) {
      if (startYear !== undefined && endYear !== undefined) {
        // Events that overlap with the timeline range
        where.OR = [
          // Event starts within range
          {
            startYear: {
              gte: startYear,
              lte: endYear,
            },
          },
          // Event ends within range
          {
            endYear: {
              gte: startYear,
              lte: endYear,
            },
          },
          // Event spans the entire range
          {
            AND: [
              { startYear: { lte: startYear } },
              {
                OR: [{ endYear: { gte: endYear } }, { endYear: null }],
              },
            ],
          },
        ];
      } else if (startYear !== undefined) {
        where.OR = [
          { startYear: { gte: startYear } },
          {
            AND: [
              { startYear: { lt: startYear } },
              {
                OR: [{ endYear: { gte: startYear } }, { endYear: null }],
              },
            ],
          },
        ];
      } else if (endYear !== undefined) {
        where.startYear = { lte: endYear };
      }
    }

    if (eventType) {
      where.eventType = eventType;
    }

    // Get events for timeline
    const events = await this.prisma.event.findMany({
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
    });

    // Calculate actual timeline bounds
    const actualStartYear =
      events.length > 0
        ? Math.min(...events.map((e) => e.startYear))
        : startYear || 0;

    const actualEndYear =
      events.length > 0
        ? Math.max(...events.map((e) => e.endYear || e.startYear))
        : endYear || 0;

    return {
      events: events.map((event) => ({
        id: event.id,
        title: event.title,
        startYear: event.startYear,
        endYear: event.endYear,
        eventType: event.eventType,
        description: event.description,
      })),
      startYear: actualStartYear,
      endYear: actualEndYear,
      totalEvents: events.length,
    };
  }
}
