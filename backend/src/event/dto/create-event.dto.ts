import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  NotEquals,
  ValidateNested,
} from 'class-validator';

const EVENT_TYPE_LIST_PATTERN = /^([A-Za-z0-9_'-]+)(\s*,\s*[A-Za-z0-9_'-]+)*$/;

export class EventParticipantInputDto {
  @ApiProperty({ description: 'Referenced person ID' })
  @IsString()
  personId: string;

  @ApiPropertyOptional({ description: 'Participant role in the event' })
  @IsOptional()
  @IsString()
  role?: string | null;
}

export class EventLocationInputDto {
  @ApiProperty({ description: 'Referenced place ID' })
  @IsString()
  placeId: string;

  @ApiPropertyOptional({ description: 'Location role in the event' })
  @IsOptional()
  @IsString()
  role?: string | null;
}

export class CreateEventDto {
  @ApiProperty({ description: 'Event title', example: '安史之乱' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'Event start year', example: 755 })
  @Type(() => Number)
  @IsInt()
  @Min(-3000)
  @NotEquals(0, { message: 'startYear 不能为 0，历史纪年没有公元 0 年' })
  startYear: number;

  @ApiPropertyOptional({ description: 'Event end year', example: 763 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-3000)
  @NotEquals(0, { message: 'endYear 不能为 0，历史纪年没有公元 0 年' })
  endYear?: number | null;

  @ApiPropertyOptional({ description: 'Event description' })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({
    description:
      'Comma-separated event type tags, for example `war,civil_war` or `political_event,dynasty_founding`',
    example: 'war,civil_war',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Matches(EVENT_TYPE_LIST_PATTERN, {
    message:
      'eventType 需为逗号分隔标签，标签只能包含英文字母、数字、下划线、连字符或英文撇号',
  })
  eventType?: string | null;

  @ApiPropertyOptional({
    description: 'Related participants',
    type: [EventParticipantInputDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EventParticipantInputDto)
  participants?: EventParticipantInputDto[];

  @ApiPropertyOptional({
    description: 'Related locations',
    type: [EventLocationInputDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EventLocationInputDto)
  locations?: EventLocationInputDto[];

  @ApiPropertyOptional({
    description: 'Referenced source IDs',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sourceIds?: string[];
}
