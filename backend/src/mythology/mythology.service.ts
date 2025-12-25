import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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
    const where: any = {};

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
      // Parse JSON fields safely
      const stories = this.safeJsonParse(mythology.stories) || [];
      const symbolism = this.safeJsonParse(mythology.symbolism) || [];

      // Convert database fields to frontend interface
      return {
        id: mythology.id,
        title: mythology.name, // Map database 'name' to frontend 'title'
        englishTitle: '', // Database doesn't have name_en field
        category: mythology.category as any, // Cast to match frontend category type
        description: mythology.description || '', // Ensure description is not null
        characters: Array.isArray(stories) ? stories.slice(0, 5) : [],
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

    // Parse JSON fields safely
    const stories = this.safeJsonParse(mythology.stories) || [];
    const symbolism = this.safeJsonParse(mythology.symbolism) || [];

    // Convert database fields to frontend interface
    return {
      id: mythology.id,
      title: mythology.name, // Map database 'name' to frontend 'title'
      englishTitle: '', // Database doesn't have name_en field
      category: mythology.category as any, // Cast to match frontend category type
      description: mythology.description || '', // Ensure description is not null
      characters: Array.isArray(stories) ? stories.slice(0, 5) : [],
      source: mythology.origin || '', // Map database 'origin' to frontend 'source'
      imageUrl: '', // Provide empty string if no image URL available
    };
  }

  private safeJsonParse(value: any): any {
    if (!value) return null;
    if (typeof value === 'string' && value.trim() !== '') {
      try {
        return JSON.parse(value);
      } catch (e) {
        // If it's not valid JSON, it might be a plain string
        return value;
      }
    }
    return value;
  }
}
