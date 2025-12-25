import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ScholarDto {
  @ApiProperty({ description: 'Scholar ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Scholar name', example: '孔子' })
  name: string;

  @ApiPropertyOptional({ description: 'Dynasty period', example: '春秋' })
  dynastyPeriod?: string | null;

  @ApiPropertyOptional({ description: 'Birth year', example: -551 })
  birthYear?: number | null;

  @ApiPropertyOptional({ description: 'Death year', example: -479 })
  deathYear?: number | null;

  @ApiPropertyOptional({
    description: 'Philosophical school ID',
    example: 'uuid-string',
  })
  philosophicalSchoolId?: string | null;

  @ApiPropertyOptional({ description: 'Major works', type: [String] })
  majorWorks?: string[] | null;

  @ApiPropertyOptional({ description: 'Contributions', type: [String] })
  contributions?: string[] | null;

  @ApiPropertyOptional({ description: 'Biography' })
  biography?: string | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
