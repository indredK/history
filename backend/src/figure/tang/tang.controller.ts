import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { TangService } from './tang.service';
import { FigureQueryDto } from '../common/query.dto';
import { TangFigureDto } from './tang.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

@ApiTags('Tang Dynasty Figures')
@Controller()
export class TangController {
  constructor(private readonly tangService: TangService) {}

  @Get('figures/tang')
  @ApiOperation({
    summary: 'Get Tang Dynasty figures',
    description:
      'Retrieve a paginated list of Tang Dynasty historical figures with optional filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved Tang figures',
    type: PaginatedResponseDto<TangFigureDto>,
  })
  async getTangFigures(
    @Query() query: FigureQueryDto,
  ): Promise<PaginatedResponseDto<TangFigureDto>> {
    return this.tangService.getTangFigures(query);
  }

  @Get('tang-figures')
  @ApiOperation({
    summary: 'Get Tang Dynasty figures (compatible endpoint)',
    description:
      'Retrieve a paginated list of Tang Dynasty figures (compatible with frontend API)',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved Tang figures',
    type: PaginatedResponseDto<TangFigureDto>,
  })
  async getTangFiguresCompat(
    @Query() query: FigureQueryDto,
  ): Promise<PaginatedResponseDto<TangFigureDto>> {
    return this.tangService.getTangFigures(query);
  }

  @Get('tang-figures/:id')
  @ApiOperation({
    summary: 'Get Tang Dynasty figure by ID (compatible endpoint)',
    description:
      'Retrieve detailed information about a specific Tang Dynasty figure',
  })
  @ApiParam({ name: 'id', description: 'Tang figure ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved Tang figure',
    type: TangFigureDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Tang figure not found',
  })
  async getTangFigureById(@Param('id') id: string): Promise<TangFigureDto> {
    return this.tangService.getTangFigureById(id);
  }
}
