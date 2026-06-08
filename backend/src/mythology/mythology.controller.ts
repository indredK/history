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
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MythologyService } from './mythology.service';
import { MythologyQueryDto } from './dto/mythology-query.dto';
import { MythologyDto } from './dto/mythology.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { CreateMythologyDto } from './dto/create-mythology.dto';
import { UpdateMythologyDto } from './dto/update-mythology.dto';

@ApiTags('Mythology')
@Controller('mythologies')
export class MythologyController {
  constructor(private readonly mythologyService: MythologyService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all mythologies',
    description:
      'Retrieve a paginated list of Chinese mythologies with optional filtering by category, origin, period, and name',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved mythologies',
    type: PaginatedResponseDto<MythologyDto>,
  })
  async findAll(
    @Query() query: MythologyQueryDto,
  ): Promise<PaginatedResponseDto<MythologyDto>> {
    return this.mythologyService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get mythology by ID',
    description:
      'Retrieve detailed information about a specific mythology including stories and symbolism',
  })
  @ApiParam({ name: 'id', description: 'Mythology ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved mythology',
    type: MythologyDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Mythology not found',
  })
  async findOne(@Param('id') id: string): Promise<MythologyDto> {
    return this.mythologyService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create mythology',
    description:
      'Create a mythology story record with title, category, story beats, symbolism, and related characters',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully created mythology',
    type: MythologyDto,
  })
  async create(@Body() body: CreateMythologyDto): Promise<MythologyDto> {
    return this.mythologyService.create(body);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update mythology',
    description:
      'Update an existing mythology story record and keep frontend-friendly fields aligned with database fields',
  })
  @ApiParam({ name: 'id', description: 'Mythology ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated mythology',
    type: MythologyDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Mythology not found',
  })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateMythologyDto,
  ): Promise<MythologyDto> {
    return this.mythologyService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete mythology',
    description: 'Delete a mythology story record by ID',
  })
  @ApiParam({ name: 'id', description: 'Mythology ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully deleted mythology',
    type: MythologyDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Mythology not found',
  })
  async remove(@Param('id') id: string): Promise<MythologyDto> {
    return this.mythologyService.remove(id);
  }
}
