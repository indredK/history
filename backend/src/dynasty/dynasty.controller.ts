import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { DynastyService } from './dynasty.service';
import { DynastyQueryDto } from './dto/dynasty-query.dto';
import { DynastyDto } from './dto/dynasty.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@ApiTags('Dynasties')
@Controller('dynasties')
export class DynastyController {
  constructor(private readonly dynastyService: DynastyService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all dynasties',
    description:
      'Retrieve a paginated list of Chinese dynasties with optional filtering by year range and name',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved dynasties',
    type: PaginatedResponseDto<DynastyDto>,
  })
  async findAll(
    @Query() query: DynastyQueryDto,
  ): Promise<PaginatedResponseDto<DynastyDto>> {
    return this.dynastyService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get dynasty by ID',
    description: 'Retrieve detailed information about a specific dynasty',
  })
  @ApiParam({ name: 'id', description: 'Dynasty ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved dynasty',
    type: DynastyDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Dynasty not found',
  })
  async findOne(@Param('id') id: string): Promise<DynastyDto> {
    return this.dynastyService.findOne(id);
  }
}
