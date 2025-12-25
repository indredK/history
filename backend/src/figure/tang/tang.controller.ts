import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
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
}
