import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
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
    description: 'Retrieve a paginated list of Qing Dynasty historical rulers with optional filtering'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved Qing rulers',
    type: PaginatedResponseDto<QingRulerDto>,
  })
  async getQingRulers(@Query() query: FigureQueryDto): Promise<PaginatedResponseDto<QingRulerDto>> {
    return this.qingService.getQingRulers(query);
  }

  @Get('qing-rulers')
  @ApiOperation({ 
    summary: 'Get Qing Dynasty rulers (compatible endpoint)',
    description: 'Retrieve a paginated list of Qing Dynasty rulers (compatible with frontend API)' 
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved Qing rulers',
    type: PaginatedResponseDto<QingRulerDto>,
  })
  async getQingRulersCompat(@Query() query: FigureQueryDto): Promise<PaginatedResponseDto<QingRulerDto>> {
    return this.qingService.getQingRulers(query);
  }
}
