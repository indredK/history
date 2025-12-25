import { Injectable } from '@nestjs/common';
import { FigureBaseService } from '../common/figure-base.service';
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

    const where: any = {};

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
}
