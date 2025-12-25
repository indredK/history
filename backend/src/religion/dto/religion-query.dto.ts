import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsIn, Min, Max } from 'class-validator';

export class ReligionGraphQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by religious tradition',
    example: 'buddhism',
    enum: ['buddhism', 'taoism', 'confucianism', 'folk_religion'],
  })
  @IsOptional()
  @IsIn(['buddhism', 'taoism', 'confucianism', 'folk_religion'])
  tradition?: string;

  @ApiPropertyOptional({
    description: 'Filter by node type',
    example: 'temple',
    enum: ['sect', 'temple', 'master', 'text', 'concept'],
  })
  @IsOptional()
  @IsIn(['sect', 'temple', 'master', 'text', 'concept'])
  nodeType?: string;

  @ApiPropertyOptional({
    description: 'Filter by relationship type',
    example: 'founded_by',
    enum: [
      'founded_by',
      'influenced_by',
      'split_from',
      'merged_with',
      'located_at',
    ],
  })
  @IsOptional()
  @IsIn([
    'founded_by',
    'influenced_by',
    'split_from',
    'merged_with',
    'located_at',
  ])
  relationship?: string;

  @ApiPropertyOptional({
    description: 'Filter by historical period',
    example: '唐朝',
  })
  @IsOptional()
  period?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of nodes to return',
    minimum: 1,
    maximum: 1000,
    default: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(1000)
  maxNodes?: number = 100;

  @ApiPropertyOptional({
    description: 'Maximum number of edges to return',
    minimum: 1,
    maximum: 2000,
    default: 200,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(2000)
  maxEdges?: number = 200;

  @ApiPropertyOptional({
    description: 'Include node details in edges',
    default: true,
  })
  @IsOptional()
  includeNodeDetails?: boolean = true;
}
