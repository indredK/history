import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class DynastyQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by start year (dynasties starting from this year)',
    example: 600,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-3000)
  startYear?: number;

  @ApiPropertyOptional({
    description: 'Filter by end year (dynasties ending before this year)',
    example: 1000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-3000)
  endYear?: number;

  @ApiPropertyOptional({
    description: 'Search by dynasty name (partial match)',
    example: '唐',
  })
  @IsOptional()
  name?: string;
}