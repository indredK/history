import { Injectable } from '@nestjs/common';
import { FigureBaseService } from '../common/figure-base.service';
import { FigureQueryDto } from '../common/query.dto';
import { TangFigureDto } from './tang.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

@Injectable()
export class TangService extends FigureBaseService {
  async getTangFigures(query: FigureQueryDto): Promise<PaginatedResponseDto<TangFigureDto>> {
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
      this.prisma.tangFigure.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ birthYear: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.tangFigure.count({ where }),
    ]);

    const transformedFigures = figures.map(figure => this.transformFigure<TangFigureDto>(figure));

    return new PaginatedResponseDto(transformedFigures, total, page, limit);
  }
}
