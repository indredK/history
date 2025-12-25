import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SanguoService } from './sanguo.service';
import { SanguoFigureQueryDto } from '../common/query.dto';
import { SanguoFigureDto } from './sanguo.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

@ApiTags('Three Kingdoms Figures')
@Controller()
export class SanguoController {
  constructor(private readonly sanguoService: SanguoService) {}

  @Get('figures/sanguo')
  @ApiOperation({
    summary: 'Get Three Kingdoms figures',
    description:
      'Retrieve a paginated list of Three Kingdoms period figures with optional filtering by kingdom and role',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved Three Kingdoms figures',
    type: PaginatedResponseDto<SanguoFigureDto>,
  })
  async getSanguoFigures(
    @Query() query: SanguoFigureQueryDto,
  ): Promise<PaginatedResponseDto<SanguoFigureDto>> {
    return this.sanguoService.getSanguoFigures(query);
  }

  @Get('sanguo-figures')
  @ApiOperation({
    summary: 'Get Three Kingdoms figures (compatible endpoint)',
    description:
      'Retrieve a paginated list of Three Kingdoms period figures (compatible with frontend API)',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved Three Kingdoms figures',
    type: PaginatedResponseDto<SanguoFigureDto>,
  })
  async getSanguoFiguresCompat(
    @Query() query: SanguoFigureQueryDto,
  ): Promise<PaginatedResponseDto<SanguoFigureDto>> {
    return this.sanguoService.getSanguoFigures(query);
  }
}
