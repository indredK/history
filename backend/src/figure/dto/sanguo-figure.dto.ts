import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SanguoFigureDto {
  @ApiProperty({ description: 'Figure ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Figure name', example: '诸葛亮' })
  name: string;

  @ApiProperty({ 
    description: 'Role/occupation', 
    example: 'strategist',
    enum: ['general', 'strategist', 'ruler', 'advisor', 'other']
  })
  role: string;

  @ApiProperty({ 
    description: 'Kingdom', 
    example: 'shu',
    enum: ['wei', 'shu', 'wu']
  })
  kingdom: string;

  @ApiPropertyOptional({ description: 'Birth year', example: 181 })
  birthYear?: number | null;

  @ApiPropertyOptional({ description: 'Death year', example: 234 })
  deathYear?: number | null;

  @ApiPropertyOptional({ description: 'Achievements', type: [String] })
  achievements?: string[] | null;

  @ApiPropertyOptional({ description: 'Battles participated', type: [String] })
  battles?: string[] | null;

  @ApiPropertyOptional({ description: 'Biography' })
  biography?: string | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}