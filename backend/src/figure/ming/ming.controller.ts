import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MingService } from './ming.service';
import { FigureQueryDto } from '../common/query.dto';
import { MingFigureDto } from './ming.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

@ApiTags('Ming Dynasty Figures')
@Controller()
export class MingController {
  constructor(private readonly mingService: MingService) {}

  @Get('figures/ming')
  @ApiOperation({ 
    summary: 'Get Ming Dynasty figures',
    description: 'Retrieve a paginated list of Ming Dynasty historical figures with optional filtering'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved Ming figures',
    type: PaginatedResponseDto<MingFigureDto>,
  })
  async getMingFigures(@Query() query: FigureQueryDto): Promise<PaginatedResponseDto<MingFigureDto>> {
    return this.mingService.getMingFigures(query);
  }

  @Get('ming-figures')
  @ApiOperation({ 
    summary: 'Get Ming Dynasty figures (compatible endpoint)',
    description: 'Retrieve a paginated list of Ming Dynasty figures (compatible with frontend API)' 
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved Ming figures',
    type: PaginatedResponseDto<MingFigureDto>,
  })
  async getMingFiguresCompat(@Query() query: FigureQueryDto): Promise<PaginatedResponseDto<MingFigureDto>> {
    return this.mingService.getMingFigures(query);
  }
}
