import { Injectable, NotFoundException } from '@nestjs/common';
import { FigureBaseService } from '../common/figure-base.service';
import { Prisma } from '../../generated/prisma/client';
import { FigureQueryDto } from '../common/query.dto';
import { YuanFigureDto } from './yuan.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

@Injectable()
export class YuanService extends FigureBaseService {
  async getYuanFigures(
    query: FigureQueryDto,
  ): Promise<PaginatedResponseDto<YuanFigureDto>> {
    const { page = 1, limit = 20, role, name, birthYear, deathYear } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.YuanFigureWhereInput = {};

    if (role) where.role = { contains: role };
    if (name) where.name = { contains: name };
    if (birthYear !== undefined) where.birthYear = { gte: birthYear };
    if (deathYear !== undefined) {
      where.OR = [{ deathYear: { lte: deathYear } }, { deathYear: null }];
    }

    const [figures, total] = await Promise.all([
      this.prisma.yuanFigure.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ birthYear: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.yuanFigure.count({ where }),
    ]);

    const transformedFigures = figures.map((figure) =>
      this.transformFigure<YuanFigureDto>(figure),
    );

    return new PaginatedResponseDto(transformedFigures, total, page, limit);
  }

  async getYuanFigureById(id: string): Promise<YuanFigureDto> {
    const figure = await this.prisma.yuanFigure.findUnique({
      where: { id },
    });

    if (!figure) {
      throw new NotFoundException(`未找到 ID 为 ${id} 的元朝人物记录`);
    }

    return this.transformFigure<YuanFigureDto>(figure);
  }
}
