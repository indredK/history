import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { YuanService } from './yuan.service';
import { FigureQueryDto } from '../common/query.dto';
import { YuanFigureDto } from './yuan.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

@ApiTags('Yuan Dynasty Figures')
@Controller()
export class YuanController {
  constructor(private readonly yuanService: YuanService) {}

  @Get('figures/yuan')
  @ApiOperation({
    summary: 'Get Yuan Dynasty figures',
    description:
      'Retrieve a paginated list of Yuan Dynasty historical figures with optional filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved Yuan figures',
    type: PaginatedResponseDto<YuanFigureDto>,
  })
  async getYuanFigures(
    @Query() query: FigureQueryDto,
  ): Promise<PaginatedResponseDto<YuanFigureDto>> {
    return this.yuanService.getYuanFigures(query);
  }

  @Get('yuan-figures')
  @ApiOperation({
    summary: 'Get Yuan Dynasty figures (compatible endpoint)',
    description:
      'Retrieve a paginated list of Yuan Dynasty figures (compatible with frontend API)',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved Yuan figures',
    type: PaginatedResponseDto<YuanFigureDto>,
  })
  async getYuanFiguresCompat(
    @Query() query: FigureQueryDto,
  ): Promise<PaginatedResponseDto<YuanFigureDto>> {
    return this.yuanService.getYuanFigures(query);
  }

  @Get('yuan-figures/:id')
  @ApiOperation({
    summary: 'Get Yuan Dynasty figure by ID (compatible endpoint)',
    description: 'Retrieve detailed information about a specific Yuan Dynasty figure',
  })
  @ApiParam({ name: 'id', description: 'Yuan figure ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved Yuan figure',
    type: YuanFigureDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Yuan figure not found',
  })
  async getYuanFigureById(@Param('id') id: string): Promise<YuanFigureDto> {
    return this.yuanService.getYuanFigureById(id);
  }
}
