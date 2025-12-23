import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MythologyQueryDto } from './dto/mythology-query.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { MythologyDto } from './dto/mythology.dto';

@Injectable()
export class MythologyService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: MythologyQueryDto): Promise<PaginatedResponseDto<MythologyDto>> {
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
        orderBy: [
          { category: 'asc' },
          { name: 'asc' },
        ],
      }),
      this.prisma.mythology.count({ where }),
    ]);

    // Transform the data to match DTO structure
    const transformedMythologies = mythologies.map(mythology => ({
      ...mythology,
      // Parse JSON fields if they exist
      stories: mythology.stories ? JSON.parse(mythology.stories as string) : null,
      symbolism: mythology.symbolism ? JSON.parse(mythology.symbolism as string) : null,
    }));

    return new PaginatedResponseDto(transformedMythologies, total, page, limit);
  }

  async findOne(id: string): Promise<MythologyDto> {
    const mythology = await this.prisma.mythology.findUnique({
      where: { id },
    });

    if (!mythology) {
      throw new NotFoundException(`Mythology with ID ${id} not found`);
    }

    // Transform the data to match DTO structure
    return {
      ...mythology,
      // Parse JSON fields if they exist
      stories: mythology.stories ? JSON.parse(mythology.stories as string) : null,
      symbolism: mythology.symbolism ? JSON.parse(mythology.symbolism as string) : null,
    };
  }
}