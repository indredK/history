import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CultureService } from './culture.service';
import { ScholarQueryDto } from './dto/scholar-query.dto';
import { ScholarDto } from './dto/scholar.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@ApiTags('Scholars')
@Controller('scholars')
export class ScholarController {
  constructor(private readonly cultureService: CultureService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get all scholars',
    description: 'Retrieve a paginated list of scholars with optional filtering by dynasty, philosophical school, and name'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved scholars',
    type: PaginatedResponseDto<ScholarDto>,
  })
  async findAll(@Query() query: ScholarQueryDto): Promise<PaginatedResponseDto<ScholarDto>> {
    return this.cultureService.findAllScholars(query);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get scholar by ID',
    description: 'Retrieve detailed information about a specific scholar including their works and contributions'
  })
  @ApiParam({ name: 'id', description: 'Scholar ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved scholar',
    type: ScholarDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Scholar not found',
  })
  async findOne(@Param('id') id: string): Promise<ScholarDto> {
    return this.cultureService.findScholarById(id);
  }
}