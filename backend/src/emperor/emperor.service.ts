import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmperorQueryDto } from './dto/emperor-query.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { EmperorDto } from './dto/emperor.dto';

@Injectable()
export class EmperorService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: EmperorQueryDto): Promise<PaginatedResponseDto<EmperorDto>> {
    const { page = 1, limit = 20, dynastyId, reignStart, reignEnd, name, dynastyName } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (dynastyId) {
      where.dynastyId = dynastyId;
    }
    
    if (reignStart !== undefined) {
      where.reignStart = { gte: reignStart };
    }
    
    if (reignEnd !== undefined) {
      where.OR = [
        { reignEnd: { lte: reignEnd } },
        { reignEnd: null }, // Include current emperors
      ];
    }
    
    if (name) {
      where.name = { contains: name };
    }

    if (dynastyName) {
      where.dynasty = {
        name: { contains: dynastyName },
      };
    }

    // Execute queries
    const [emperors, total] = await Promise.all([
      this.prisma.emperor.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { reignStart: 'asc' },
          { name: 'asc' },
        ],
        include: {
          dynasty: true,
        },
      }),
      this.prisma.emperor.count({ where }),
    ]);

    // Transform the data to match DTO structure
    const transformedEmperors = emperors.map(emperor => {
      const { dynasty, ...emperorData } = emperor;
      return {
        ...emperorData,
        // Parse JSON fields if they exist and are strings
        eraNames: this.safeJsonParse(emperorData.eraNames),
        achievements: this.safeJsonParse(emperorData.achievements),
        historicalEvaluation: this.safeJsonParse(emperorData.historicalEvaluation),
      };
    });

    return new PaginatedResponseDto(transformedEmperors, total, page, limit);
  }

  async findOne(id: string): Promise<EmperorDto> {
    const emperor = await this.prisma.emperor.findUnique({
      where: { id },
      include: {
        dynasty: true,
      },
    });

    if (!emperor) {
      throw new NotFoundException(`Emperor with ID ${id} not found`);
    }

    // Transform the data to match DTO structure
    const { dynasty, ...emperorData } = emperor;
    return {
      ...emperorData,
      // Parse JSON fields if they exist
      eraNames: this.safeJsonParse(emperorData.eraNames),
      achievements: this.safeJsonParse(emperorData.achievements),
      historicalEvaluation: this.safeJsonParse(emperorData.historicalEvaluation),
    };
  }

  private safeJsonParse(value: any): any {
    if (!value) return null;
    if (typeof value === 'string' && value.trim() !== '') {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }
    return value;
  }
}