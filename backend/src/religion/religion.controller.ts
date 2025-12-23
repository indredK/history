import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
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
    description: 'Retrieve a graph of religious relationships including nodes (sects, temples, masters, texts, concepts) and their connections with optional filtering by tradition, node type, and relationship type'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved religion graph',
    type: ReligionGraphDto,
  })
  async getGraph(@Query() query: ReligionGraphQueryDto): Promise<ReligionGraphDto> {
    return this.religionService.getGraph(query);
  }
}