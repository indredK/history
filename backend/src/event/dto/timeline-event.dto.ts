import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TimelineEventDto {
  @ApiProperty({ description: 'Event ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Event title', example: '安史之乱' })
  title: string;

  @ApiProperty({ description: 'Event start year', example: 755 })
  startYear: number;

  @ApiPropertyOptional({ description: 'Event end year', example: 763 })
  endYear?: number | null;

  @ApiPropertyOptional({ description: 'Event type', example: 'war' })
  eventType?: string | null;

  @ApiPropertyOptional({
    description: 'Brief description for timeline display',
  })
  description?: string | null;
}

export class TimelineResponseDto {
  @ApiProperty({ description: 'Timeline events', type: [TimelineEventDto] })
  events: TimelineEventDto[];

  @ApiProperty({ description: 'Timeline start year', example: 600 })
  startYear: number;

  @ApiProperty({ description: 'Timeline end year', example: 1000 })
  endYear: number;

  @ApiProperty({
    description: 'Total number of events in timeline',
    example: 25,
  })
  totalEvents: number;
}
