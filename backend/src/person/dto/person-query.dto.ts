import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class PersonQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by birth year (persons born from this year)',
    example: 600,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-3000)
  birthYear?: number;

  @ApiPropertyOptional({
    description: 'Filter by death year (persons died before this year)',
    example: 1000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-3000)
  deathYear?: number;

  @ApiPropertyOptional({
    description: 'Search by person name (partial match)',
    example: '李',
  })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter by dynasty period',
    example: '唐朝',
  })
  @IsOptional()
  dynasty?: string;
}