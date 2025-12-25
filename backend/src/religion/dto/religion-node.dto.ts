import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReligionNodeDto {
  @ApiProperty({ description: 'Node ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Node name', example: '少林寺' })
  name: string;

  @ApiProperty({
    description: 'Node type',
    example: 'temple',
    enum: ['sect', 'temple', 'master', 'text', 'concept'],
  })
  nodeType: string;

  @ApiProperty({
    description: 'Religious tradition',
    example: 'buddhism',
    enum: ['buddhism', 'taoism', 'confucianism', 'folk_religion'],
  })
  tradition: string;

  @ApiPropertyOptional({ description: 'Node description' })
  description?: string | null;

  @ApiPropertyOptional({ description: 'Historical period', example: '唐朝' })
  period?: string | null;

  @ApiPropertyOptional({
    description: 'Geographic location',
    example: '河南嵩山',
  })
  location?: string | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
