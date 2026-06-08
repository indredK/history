import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { QingService } from './qing.service';
import { FigureQueryDto } from '../common/query.dto';
import { QingRulerDto } from './qing.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

@ApiTags('Qing Dynasty Rulers')
@Controller()
export class QingController {
  constructor(private readonly qingService: QingService) {}

  @Get('figures/qing')
  @ApiOperation({
    summary: 'Get Qing Dynasty rulers',
    description:
      'Retrieve a paginated list of Qing Dynasty historical rulers with optional filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved Qing rulers',
    type: PaginatedResponseDto<QingRulerDto>,
  })
  async getQingRulers(
    @Query() query: FigureQueryDto,
  ): Promise<PaginatedResponseDto<QingRulerDto>> {
    return this.qingService.getQingRulers(query);
  }

  @Get('qing-rulers')
  @ApiOperation({
    summary: 'Get Qing Dynasty rulers (compatible endpoint)',
    description:
      'Retrieve a paginated list of Qing Dynasty rulers (compatible with frontend API)',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved Qing rulers',
    type: PaginatedResponseDto<QingRulerDto>,
  })
  async getQingRulersCompat(
    @Query() query: FigureQueryDto,
  ): Promise<PaginatedResponseDto<QingRulerDto>> {
    return this.qingService.getQingRulers(query);
  }

  @Get('qing-rulers/:id')
  @ApiOperation({
    summary: 'Get Qing Dynasty ruler by ID (compatible endpoint)',
    description:
      'Retrieve detailed information about a specific Qing Dynasty ruler',
  })
  @ApiParam({ name: 'id', description: 'Qing ruler ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved Qing ruler',
    type: QingRulerDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Qing ruler not found',
  })
  async getQingRulerById(@Param('id') id: string): Promise<QingRulerDto> {
    return this.qingService.getQingRulerById(id);
  }
}
