import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsInt,
  Min,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class EventQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by start year (events starting from this year)',
    example: 600,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-3000)
  startYear?: number;

  @ApiPropertyOptional({
    description: 'Filter by end year (events ending before this year)',
    example: 1000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-3000)
  endYear?: number;

  @ApiPropertyOptional({
    description:
      'Filter by year range start (events that occurred during or after this year)',
    example: 700,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-3000)
  yearRangeStart?: number;

  @ApiPropertyOptional({
    description:
      'Filter by year range end (events that occurred during or before this year)',
    example: 800,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-3000)
  yearRangeEnd?: number;

  @ApiPropertyOptional({
    description:
      'Filter by a single event type tag. Seed data stores multiple tags as comma-separated values, so `war` matches `war,civil_war`.',
    example: 'war',
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  @Matches(/^[A-Za-z0-9_'-]+$/, {
    message: 'eventType 只能包含英文字母、数字、下划线、连字符或英文撇号',
  })
  eventType?: string;

  @ApiPropertyOptional({
    description: 'Search by event title (partial match)',
    example: '战争',
  })
  @IsOptional()
  title?: string;
}
