import { Injectable, NotFoundException } from '@nestjs/common';
import { FigureBaseService } from '../common/figure-base.service';
import { Prisma } from '../../generated/prisma/client';
import { FigureQueryDto } from '../common/query.dto';
import { QingRulerDto } from './qing.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

@Injectable()
export class QingService extends FigureBaseService {
  async getQingRulers(
    query: FigureQueryDto,
  ): Promise<PaginatedResponseDto<QingRulerDto>> {
    const { page = 1, limit = 20, role, name, birthYear, deathYear } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.QingRulerWhereInput = {};

    if (role) where.role = { contains: role };
    if (name) where.name = { contains: name };
    if (birthYear !== undefined) where.birthYear = { gte: birthYear };
    if (deathYear !== undefined) {
      where.OR = [{ deathYear: { lte: deathYear } }, { deathYear: null }];
    }

    const [figures, total] = await Promise.all([
      this.prisma.qingRuler.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ reignStart: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.qingRuler.count({ where }),
    ]);

    const transformedFigures = figures.map((figure) =>
      this.transformFigure<QingRulerDto>(figure),
    );

    return new PaginatedResponseDto(transformedFigures, total, page, limit);
  }

  async getQingRulerById(id: string): Promise<QingRulerDto> {
    const figure = await this.prisma.qingRuler.findUnique({
      where: { id },
    });

    if (!figure) {
      throw new NotFoundException(`未找到 ID 为 ${id} 的清朝统治者记录`);
    }

    return this.transformFigure<QingRulerDto>(figure);
  }
}
