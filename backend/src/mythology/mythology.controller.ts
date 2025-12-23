import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { MythologyService } from './mythology.service';
import { MythologyQueryDto } from './dto/mythology-query.dto';
import { MythologyDto } from './dto/mythology.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@ApiTags('Mythology')
@Controller('mythologies')
export class MythologyController {
  constructor(private readonly mythologyService: MythologyService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get all mythologies',
    description: 'Retrieve a paginated list of Chinese mythologies with optional filtering by category, origin, period, and name'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved mythologies',
    type: PaginatedResponseDto<MythologyDto>,
  })
  async findAll(@Query() query: MythologyQueryDto): Promise<PaginatedResponseDto<MythologyDto>> {
    return this.mythologyService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get mythology by ID',
    description: 'Retrieve detailed information about a specific mythology including stories and symbolism'
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
}