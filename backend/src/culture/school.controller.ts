import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CultureService } from './culture.service';
import { SchoolQueryDto } from './dto/school-query.dto';
import { PhilosophicalSchoolDto } from './dto/philosophical-school.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@ApiTags('Schools')
@Controller('schools')
export class SchoolController {
  constructor(private readonly cultureService: CultureService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all philosophical schools',
    description:
      'Retrieve a paginated list of philosophical schools with optional filtering by name, founder, and founding year',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved philosophical schools',
    type: PaginatedResponseDto<PhilosophicalSchoolDto>,
  })
  async findAll(
    @Query() query: SchoolQueryDto,
  ): Promise<PaginatedResponseDto<PhilosophicalSchoolDto>> {
    return this.cultureService.findAllSchools(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get philosophical school by ID',
    description:
      'Retrieve detailed information about a specific philosophical school including core beliefs and key texts',
  })
  @ApiParam({ name: 'id', description: 'Philosophical school ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved philosophical school',
    type: PhilosophicalSchoolDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Philosophical school not found',
  })
  async findOne(@Param('id') id: string): Promise<PhilosophicalSchoolDto> {
    return this.cultureService.findSchoolById(id);
  }
}
