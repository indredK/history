import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max } from 'class-validator';

export class TimelineQueryDto {
  @ApiPropertyOptional({
    description: 'Timeline start year',
    example: 600,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-3000)
  startYear?: number;

  @ApiPropertyOptional({
    description: 'Timeline end year',
    example: 1000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-3000)
  endYear?: number;

  @ApiPropertyOptional({
    description: 'Maximum number of events to return',
    minimum: 1,
    maximum: 1000,
    default: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(1000)
  limit?: number = 100;

  @ApiPropertyOptional({
    description: 'Filter by event type',
    example: 'war',
  })
  @IsOptional()
  eventType?: string;
}