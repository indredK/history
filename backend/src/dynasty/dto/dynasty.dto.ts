import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DynastyDto {
  @ApiProperty({ description: 'Dynasty ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Dynasty name', example: '唐朝' })
  name: string;

  @ApiProperty({ description: 'Dynasty start year', example: 618 })
  startYear: number;

  @ApiPropertyOptional({ description: 'Dynasty end year', example: 907 })
  endYear?: number | null;

  @ApiPropertyOptional({ description: 'Dynasty capital', example: '长安' })
  capital?: string | null;

  @ApiPropertyOptional({ description: 'Dynasty founder', example: '李渊' })
  founder?: string | null;

  @ApiPropertyOptional({ description: 'Dynasty description' })
  description?: string | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}