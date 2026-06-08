import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CultureService } from './culture.service';
import { ScholarQueryDto } from './dto/scholar-query.dto';
import { ScholarDto } from './dto/scholar.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { CreateScholarDto } from './dto/create-scholar.dto';
import { UpdateScholarDto } from './dto/update-scholar.dto';

@ApiTags('Scholars')
@Controller('scholars')
export class ScholarController {
  constructor(private readonly cultureService: CultureService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all scholars',
    description:
      'Retrieve a paginated list of scholars with optional filtering by dynasty, philosophical school, and name',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved scholars',
    type: PaginatedResponseDto<ScholarDto>,
  })
  async findAll(
    @Query() query: ScholarQueryDto,
  ): Promise<PaginatedResponseDto<ScholarDto>> {
    return this.cultureService.findAllScholars(query);
  }

  @Post()
  @ApiOperation({
    summary: 'Create scholar',
    description:
      'Create a cultural scholar with works, achievements, and school metadata',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully created scholar',
    type: ScholarDto,
  })
  async create(@Body() dto: CreateScholarDto): Promise<ScholarDto> {
    return this.cultureService.createScholar(dto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get scholar by ID',
    description:
      'Retrieve detailed information about a specific scholar including their works and contributions',
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

  @Put(':id')
  @ApiOperation({
    summary: 'Update scholar',
    description:
      'Update a cultural scholar with works, achievements, and school metadata',
  })
  @ApiParam({ name: 'id', description: 'Scholar ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated scholar',
    type: ScholarDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Scholar not found',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateScholarDto,
  ): Promise<ScholarDto> {
    return this.cultureService.updateScholar(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete scholar',
    description: 'Delete a cultural scholar',
  })
  @ApiParam({ name: 'id', description: 'Scholar ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully deleted scholar',
    type: ScholarDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Scholar not found',
  })
  async remove(@Param('id') id: string): Promise<ScholarDto> {
    return this.cultureService.removeScholar(id);
  }
}
