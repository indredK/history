import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  Matches,
  MaxLength,
  NotEquals,
} from 'class-validator';

export class TimelineQueryDto {
  @ApiPropertyOptional({
    description: 'Timeline start year',
    example: 600,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-3000)
  @NotEquals(0, { message: 'startYear 不能为 0，历史纪年没有公元 0 年' })
  startYear?: number;

  @ApiPropertyOptional({
    description: 'Timeline end year',
    example: 1000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-3000)
  @NotEquals(0, { message: 'endYear 不能为 0，历史纪年没有公元 0 年' })
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
    description:
      'Filter by a single event type tag. Multi-tag event rows are matched by token boundary.',
    example: 'war',
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  @Matches(/^[A-Za-z0-9_'-]+$/, {
    message: 'eventType 只能包含英文字母、数字、下划线、连字符或英文撇号',
  })
  eventType?: string;
}
