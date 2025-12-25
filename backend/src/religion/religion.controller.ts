import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ReligionService } from './religion.service';
import { ReligionGraphQueryDto } from './dto/religion-query.dto';
import { ReligionGraphDto } from './dto/religion-graph.dto';

@ApiTags('Religion')
@Controller('religion')
export class ReligionController {
  constructor(private readonly religionService: ReligionService) {}

  @Get('graph')
  @ApiOperation({
    summary: 'Get religion relationship graph',
    description:
      'Retrieve a graph of religious relationships including nodes (sects, temples, masters, texts, concepts) and their connections with optional filtering by tradition, node type, and relationship type',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved religion graph',
    type: ReligionGraphDto,
  })
  async getGraph(
    @Query() query: ReligionGraphQueryDto,
  ): Promise<ReligionGraphDto> {
    return this.religionService.getGraph(query);
  }
}

// Frontend-compatible endpoints
@ApiTags('Religions')
@Controller('religions')
export class ReligionsController {
  constructor(private readonly religionService: ReligionService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all religions (frontend compatible)',
    description: 'Retrieve religion graph data for frontend compatibility',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved religions',
    type: ReligionGraphDto,
  })
  async getAll(
    @Query() query: ReligionGraphQueryDto,
  ): Promise<{ data: ReligionGraphDto[] }> {
    const graph = await this.religionService.getGraph(query);
    return { data: [graph] };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get religion node by ID (frontend compatible)',
    description: 'Retrieve a specific religion node by ID',
  })
  @ApiParam({ name: 'id', description: 'Religion node ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved religion node',
    type: Object,
  })
  async getById(
    @Param('id') id: string,
    @Query() query: ReligionGraphQueryDto,
  ): Promise<{ data: any }> {
    const graph = await this.religionService.getGraph(query);
    const node = graph.nodes.find((n) => n.id === id) || null;
    return { data: node };
  }
}
