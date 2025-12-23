import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BaseFigureDto {
  @ApiProperty({ description: 'Figure ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Figure name', example: '李白' })
  name: string;

  @ApiProperty({ description: 'Role/occupation', example: 'poet' })
  role: string;

  @ApiPropertyOptional({ description: 'Birth year', example: 701 })
  birthYear?: number | null;

  @ApiPropertyOptional({ description: 'Death year', example: 762 })
  deathYear?: number | null;

  @ApiPropertyOptional({ description: 'Achievements', type: [String] })
  achievements?: string[] | null;

  @ApiPropertyOptional({ description: 'Biography' })
  biography?: string | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}