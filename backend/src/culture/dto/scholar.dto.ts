import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ScholarDto {
  @ApiProperty({ description: 'Scholar ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Scholar name', example: '孔子' })
  name: string;

  @ApiPropertyOptional({
    description: 'English scholar name',
    example: 'Confucius',
  })
  name_en?: string | null;

  @ApiPropertyOptional({
    description: 'Dynasty label for frontend display',
    example: '春秋',
  })
  dynasty?: string | null;

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

  @ApiPropertyOptional({
    description: 'Philosophical school name',
    example: '儒家',
  })
  schoolOfThought?: string | null;

  @ApiPropertyOptional({ description: 'Major works', type: [Object] })
  majorWorks?: unknown[] | null;

  @ApiPropertyOptional({
    description: 'Representative works for frontend cards',
    type: [Object],
  })
  representativeWorks?: unknown[] | null;

  @ApiPropertyOptional({ description: 'Contributions', type: [String] })
  contributions?: string[] | null;

  @ApiPropertyOptional({ description: 'Visible achievements', type: [String] })
  achievements?: string[] | null;

  @ApiPropertyOptional({ description: 'Biography' })
  biography?: string | null;

  @ApiPropertyOptional({ description: 'Portrait image URL' })
  portraitUrl?: string | null;

  @ApiPropertyOptional({ description: 'Source names or URLs', type: [String] })
  sources?: string[] | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
