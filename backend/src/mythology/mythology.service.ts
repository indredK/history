import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';
import { MythologyQueryDto } from './dto/mythology-query.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { MythologyDto } from './dto/mythology.dto';

@Injectable()
export class MythologyService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: MythologyQueryDto,
  ): Promise<PaginatedResponseDto<MythologyDto>> {
    const { page = 1, limit = 20, category, origin, period, name } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.MythologyWhereInput = {};

    if (category) {
      where.category = category;
    }

    if (origin) {
      where.origin = { contains: origin };
    }

    if (period) {
      where.period = { contains: period };
    }

    if (name) {
      where.name = { contains: name };
    }

    // Execute queries
    const [mythologies, total] = await Promise.all([
      this.prisma.mythology.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.mythology.count({ where }),
    ]);

    // Transform the data to match frontend requirements
    const transformedMythologies = mythologies.map((mythology) => {
      // Parse JSON fields safely;stories 在历史落库里就是字符串数组,
      // safeJsonParse 拿回来后只挑 string 元素做 characters 列表的兜底。
      const stories = this.safeJsonParse<unknown[]>(mythology.stories) ?? [];
      const characters = Array.isArray(stories)
        ? stories.filter((s): s is string => typeof s === 'string').slice(0, 5)
        : [];

      // Convert database fields to frontend interface
      return {
        id: mythology.id,
        title: mythology.name, // Map database 'name' to frontend 'title'
        englishTitle: '', // Database doesn't have name_en field
        category: mythology.category, // 直接采用 DB 字段,DTO 已声明 string
        description: mythology.description || '', // Ensure description is not null
        characters,
        source: mythology.origin || '', // Map database 'origin' to frontend 'source'
        imageUrl: '', // Provide empty string if no image URL available
      };
    });

    return new PaginatedResponseDto(transformedMythologies, total, page, limit);
  }

  async findOne(id: string): Promise<MythologyDto> {
    const mythology = await this.prisma.mythology.findUnique({
      where: { id },
    });

    if (!mythology) {
      throw new NotFoundException(`Mythology with ID ${id} not found`);
    }

    // Parse JSON fields safely;同上,characters 只收 string。
    const stories = this.safeJsonParse<unknown[]>(mythology.stories) ?? [];
    const characters = Array.isArray(stories)
      ? stories.filter((s): s is string => typeof s === 'string').slice(0, 5)
      : [];

    // Convert database fields to frontend interface
    return {
      id: mythology.id,
      title: mythology.name, // Map database 'name' to frontend 'title'
      englishTitle: '', // Database doesn't have name_en field
      category: mythology.category, // Cast to match frontend category type
      description: mythology.description || '', // Ensure description is not null
      characters,
      source: mythology.origin || '', // Map database 'origin' to frontend 'source'
      imageUrl: '', // Provide empty string if no image URL available
    };
  }

  private safeJsonParse<T = unknown>(value: unknown): T | null {
    if (!value) return null;
    if (typeof value === 'string' && value.trim() !== '') {
      try {
        return JSON.parse(value) as T;
      } catch {
        // If it's not valid JSON, it might be a plain string
        return value as unknown as T;
      }
    }
    return value as T;
  }
}
