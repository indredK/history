import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { EmperorService } from './emperor.service';
import { EmperorQueryDto } from './dto/emperor-query.dto';
import { EmperorDto } from './dto/emperor.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@ApiTags('Emperors')
@Controller('emperors')
export class EmperorController {
  constructor(private readonly emperorService: EmperorService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get all emperors',
    description: 'Retrieve a paginated list of Chinese emperors with optional filtering by dynasty, reign period, and name'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved emperors',
    type: PaginatedResponseDto<EmperorDto>,
  })
  async findAll(@Query() query: EmperorQueryDto): Promise<PaginatedResponseDto<EmperorDto>> {
    return this.emperorService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get emperor by ID',
    description: 'Retrieve detailed information about a specific emperor including era names, achievements, and historical evaluation'
  })
  @ApiParam({ name: 'id', description: 'Emperor ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved emperor',
    type: EmperorDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Emperor not found',
  })
  async findOne(@Param('id') id: string): Promise<EmperorDto> {
    return this.emperorService.findOne(id);
  }
}