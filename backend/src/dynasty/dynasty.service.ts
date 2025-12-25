import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DynastyQueryDto } from './dto/dynasty-query.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { DynastyDto } from './dto/dynasty.dto';

@Injectable()
export class DynastyService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: DynastyQueryDto,
  ): Promise<PaginatedResponseDto<DynastyDto>> {
    const { page = 1, limit = 20, startYear, endYear, name } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (startYear !== undefined) {
      where.startYear = { gte: startYear };
    }

    if (endYear !== undefined) {
      where.OR = [
        { endYear: { lte: endYear } },
        { endYear: null }, // Include ongoing dynasties
      ];
    }

    if (name) {
      where.name = { contains: name };
    }

    // Execute queries
    const [dynasties, total] = await Promise.all([
      this.prisma.dynasty.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startYear: 'asc' },
      }),
      this.prisma.dynasty.count({ where }),
    ]);

    return new PaginatedResponseDto(dynasties, total, page, limit);
  }

  async findOne(id: string): Promise<DynastyDto> {
    const dynasty = await this.prisma.dynasty.findUnique({
      where: { id },
    });

    if (!dynasty) {
      throw new NotFoundException(`Dynasty with ID ${id} not found`);
    }

    return dynasty;
  }
}
