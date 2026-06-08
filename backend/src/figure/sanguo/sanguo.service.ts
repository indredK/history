import { Injectable, NotFoundException } from '@nestjs/common';
import { FigureBaseService } from '../common/figure-base.service';
import { Prisma } from '../../generated/prisma/client';
import { SanguoFigureQueryDto } from '../common/query.dto';
import { SanguoFigureDto } from './sanguo.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

@Injectable()
export class SanguoService extends FigureBaseService {
  async getSanguoFigures(
    query: SanguoFigureQueryDto,
  ): Promise<PaginatedResponseDto<SanguoFigureDto>> {
    const { page = 1, limit = 20, kingdom, role, name } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.SanguoFigureWhereInput = {};

    if (kingdom) where.kingdom = kingdom;
    if (role) where.role = role;
    if (name) where.name = { contains: name };

    const [figures, total] = await Promise.all([
      this.prisma.sanguoFigure.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ birthYear: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.sanguoFigure.count({ where }),
    ]);

    const transformedFigures = figures.map((figure) =>
      this.transformFigure<SanguoFigureDto>(figure),
    );

    return new PaginatedResponseDto(transformedFigures, total, page, limit);
  }

  async getSanguoFigureById(id: string): Promise<SanguoFigureDto> {
    const figure = await this.prisma.sanguoFigure.findUnique({
      where: { id },
    });

    if (!figure) {
      throw new NotFoundException(`未找到 ID 为 ${id} 的三国人物记录`);
    }

    return this.transformFigure<SanguoFigureDto>(figure);
  }
}
