import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsIn } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class FigureQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by role',
    example: 'poet',
  })
  @IsOptional()
  role?: string;

  @ApiPropertyOptional({
    description: 'Filter by period (dynasty-specific)',
    example: 'early',
  })
  @IsOptional()
  period?: string;

  @ApiPropertyOptional({
    description: 'Search by name (partial match)',
    example: '李',
  })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter by birth year (figures born from this year)',
    example: 600,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-3000)
  birthYear?: number;

  @ApiPropertyOptional({
    description: 'Filter by death year (figures died before this year)',
    example: 1000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-3000)
  deathYear?: number;
}

export class SanguoFigureQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by kingdom',
    example: '蜀',
    enum: ['魏', '蜀', '吴', '其他'],
  })
  @IsOptional()
  @IsIn(['魏', '蜀', '吴', '其他'])
  kingdom?: string;

  @ApiPropertyOptional({
    description: 'Filter by role',
    example: 'strategist',
    enum: ['general', 'strategist', 'ruler', 'advisor', 'other'],
  })
  @IsOptional()
  @IsIn(['general', 'strategist', 'ruler', 'advisor', 'other'])
  role?: string;

  @ApiPropertyOptional({
    description: 'Search by name (partial match)',
    example: '诸葛',
  })
  @IsOptional()
  @IsOptional()
  name?: string;
}
