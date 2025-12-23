import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReligionNodeDto } from './religion-node.dto';
import { ReligionEdgeDto } from './religion-edge.dto';

export class ReligionGraphDto {
  @ApiProperty({ description: 'Graph nodes', type: [ReligionNodeDto] })
  nodes: ReligionNodeDto[];

  @ApiProperty({ description: 'Graph edges', type: [ReligionEdgeDto] })
  edges: ReligionEdgeDto[];

  @ApiProperty({ description: 'Total number of nodes', example: 25 })
  totalNodes: number;

  @ApiProperty({ description: 'Total number of edges', example: 30 })
  totalEdges: number;

  @ApiPropertyOptional({ description: 'Filtered tradition', example: 'buddhism' })
  tradition?: string;

  @ApiPropertyOptional({ description: 'Filtered node type', example: 'temple' })
  nodeType?: string;
}