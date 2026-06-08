import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
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
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter by dynasty period',
    example: '唐',
  })
  @IsOptional()
  @IsString()
  dynasty?: string;

  @ApiPropertyOptional({
    description: 'Filter by role keyword',
    example: 'poet',
  })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({
    description: 'Filter by gender',
    example: 'female',
  })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({
    description: 'Full-text keyword across name, alias, biography, dynasty and birthplace',
    example: '变法',
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({
    description: 'Birth year upper bound',
    example: 1200,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-3000)
  birthYearEnd?: number;

  @ApiPropertyOptional({
    description: 'Death year lower bound',
    example: 700,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-3000)
  deathYearStart?: number;

  @ApiPropertyOptional({
    description: 'Minimum confidence score',
    example: 0.8,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Max(1)
  confidenceMin?: number;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: ['birthYear', 'deathYear', 'name', 'dynasty', 'updatedAt', 'createdAt'],
    example: 'birthYear',
  })
  @IsOptional()
  @IsIn(['birthYear', 'deathYear', 'name', 'dynasty', 'updatedAt', 'createdAt'])
  sortBy?:
    | 'birthYear'
    | 'deathYear'
    | 'name'
    | 'dynasty'
    | 'updatedAt'
    | 'createdAt' = 'birthYear';

  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: ['asc', 'desc'],
    example: 'asc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';
}
