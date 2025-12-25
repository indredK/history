import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PersonDto {
  @ApiProperty({ description: 'Person ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Person name', example: '李白' })
  name: string;

  @ApiPropertyOptional({ description: 'Birth year', example: 701 })
  birthYear?: number | null;

  @ApiPropertyOptional({ description: 'Death year', example: 762 })
  deathYear?: number | null;

  @ApiPropertyOptional({ description: 'Biography' })
  biography?: string | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
