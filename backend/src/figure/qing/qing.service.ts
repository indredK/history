import { Injectable } from '@nestjs/common';
import { FigureBaseService } from '../common/figure-base.service';
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

    const where: any = {};

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
}
