import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EraNameDto {
  @ApiProperty({ description: 'Era name', example: '贞观' })
  name: string;

  @ApiProperty({ description: 'Era start year', example: 627 })
  startYear: number;

  @ApiPropertyOptional({ description: 'Era end year', example: 649 })
  endYear?: number;

  @ApiPropertyOptional({ description: 'Era description' })
  description?: string;
}