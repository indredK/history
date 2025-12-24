import { Injectable } from '@nestjs/common';
import { FigureBaseService } from '../common/figure-base.service';
import { FigureQueryDto } from '../common/query.dto';
import { MingFigureDto } from './ming.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

@Injectable()
export class MingService extends FigureBaseService {
  async getMingFigures(query: FigureQueryDto): Promise<PaginatedResponseDto<MingFigureDto>> {
    const { page = 1, limit = 20, role, period, name, birthYear, deathYear } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (role) where.role = { contains: role };
    if (period) where.period = period;
    if (name) where.name = { contains: name };
    if (birthYear !== undefined) where.birthYear = { gte: birthYear };
    if (deathYear !== undefined) {
      where.OR = [
        { deathYear: { lte: deathYear } },
        { deathYear: null },
      ];
    }

    const [figures, total] = await Promise.all([
      this.prisma.mingFigure.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ birthYear: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.mingFigure.count({ where }),
    ]);

    const transformedFigures = figures.map(figure => this.transformFigure<MingFigureDto>(figure));

    return new PaginatedResponseDto(transformedFigures, total, page, limit);
  }
}
