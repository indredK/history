import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { DynastyService } from './dynasty.service';
import { DynastyQueryDto } from './dto/dynasty-query.dto';
import { DynastyDto } from './dto/dynasty.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { CreateDynastyDto } from './dto/create-dynasty.dto';
import { UpdateDynastyDto } from './dto/update-dynasty.dto';

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

  @Post()
  @ApiOperation({
    summary: 'Create dynasty',
    description:
      'Create a dynasty record with name, year range, capital, founder, and description',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully created dynasty',
    type: DynastyDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid dynasty payload',
  })
  @ApiResponse({
    status: 409,
    description: 'Dynasty name already exists',
  })
  async create(@Body() body: CreateDynastyDto): Promise<DynastyDto> {
    return this.dynastyService.create(body);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update dynasty',
    description:
      'Update an existing dynasty record while preserving optional field clearing semantics',
  })
  @ApiParam({ name: 'id', description: 'Dynasty ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated dynasty',
    type: DynastyDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Dynasty not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Dynasty name already exists',
  })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateDynastyDto,
  ): Promise<DynastyDto> {
    return this.dynastyService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete dynasty',
    description: 'Delete a dynasty record by ID',
  })
  @ApiParam({ name: 'id', description: 'Dynasty ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully deleted dynasty',
    type: DynastyDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Dynasty not found',
  })
  async remove(@Param('id') id: string): Promise<DynastyDto> {
    return this.dynastyService.remove(id);
  }
}
