import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MythologyDto {
  @ApiProperty({ description: 'Mythology ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Mythology name', example: '盘古开天' })
  name: string;

  @ApiProperty({ 
    description: 'Mythology category', 
    example: 'creation_myth',
    enum: ['deity', 'legend', 'folklore', 'creation_myth', 'other']
  })
  category: string;

  @ApiPropertyOptional({ description: 'Geographic or cultural origin', example: '中原' })
  origin?: string | null;

  @ApiPropertyOptional({ description: 'Historical period', example: '上古' })
  period?: string | null;

  @ApiPropertyOptional({ description: 'Mythology description' })
  description?: string | null;

  @ApiPropertyOptional({ description: 'Related stories', type: [String] })
  stories?: string[] | null;

  @ApiPropertyOptional({ description: 'Symbolic meanings', type: [String] })
  symbolism?: string[] | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}