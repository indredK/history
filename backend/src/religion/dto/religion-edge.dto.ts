import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReligionNodeDto } from './religion-node.dto';

export class ReligionEdgeDto {
  @ApiProperty({ description: 'Edge ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Source node ID', example: 'uuid-string' })
  sourceNodeId: string;

  @ApiProperty({ description: 'Target node ID', example: 'uuid-string' })
  targetNodeId: string;

  @ApiProperty({
    description: 'Relationship type',
    example: 'founded_by',
    enum: [
      'founded_by',
      'influenced_by',
      'split_from',
      'merged_with',
      'located_at',
    ],
  })
  relationship: string;

  @ApiPropertyOptional({
    description: 'Relationship strength (0.0 to 1.0)',
    example: 0.8,
    minimum: 0,
    maximum: 1,
  })
  strength?: number | null;

  @ApiPropertyOptional({
    description: 'Period when relationship existed',
    example: '唐朝',
  })
  period?: string | null;

  @ApiPropertyOptional({ description: 'Relationship description' })
  description?: string | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  // Optional: Include related nodes for graph visualization
  @ApiPropertyOptional({
    description: 'Source node details',
    type: ReligionNodeDto,
  })
  sourceNode?: ReligionNodeDto;

  @ApiPropertyOptional({
    description: 'Target node details',
    type: ReligionNodeDto,
  })
  targetNode?: ReligionNodeDto;
}
