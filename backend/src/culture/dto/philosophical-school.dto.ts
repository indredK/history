import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PhilosophicalSchoolDto {
  @ApiProperty({ description: 'School ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'School name', example: '儒家' })
  name: string;

  @ApiPropertyOptional({ description: 'School founder', example: '孔子' })
  founder?: string | null;

  @ApiPropertyOptional({ description: 'Founding year', example: -551 })
  foundingYear?: number | null;

  @ApiPropertyOptional({ description: 'Core beliefs', type: [String] })
  coreBeliefs?: string[] | null;

  @ApiPropertyOptional({ description: 'Key texts', type: [String] })
  keyTexts?: string[] | null;

  @ApiPropertyOptional({ description: 'School description' })
  description?: string | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
