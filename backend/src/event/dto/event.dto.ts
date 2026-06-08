import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EventSourceDto {
  @ApiProperty({ description: 'Source ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Source title', example: '资治通鉴' })
  title: string;

  @ApiPropertyOptional({ description: 'Source URL' })
  url?: string | null;

  @ApiPropertyOptional({ description: 'Source author or organization' })
  author?: string | null;
}

export class EventRelatedPersonDto {
  @ApiProperty({ description: 'Person ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Person name', example: '郭子仪' })
  name: string;

  @ApiPropertyOptional({ description: 'Person dynasty', example: '唐' })
  dynasty?: string | null;
}

export class EventParticipantDto {
  @ApiProperty({
    description: 'Event participant relation ID',
    example: 'uuid-string',
  })
  id: string;

  @ApiProperty({ description: 'Referenced person ID', example: 'uuid-string' })
  personId: string;

  @ApiPropertyOptional({ description: 'Participant role in the event' })
  role?: string | null;

  @ApiPropertyOptional({
    description: 'Participant detail',
    type: EventRelatedPersonDto,
  })
  person?: EventRelatedPersonDto | null;
}

export class EventRelatedPlaceDto {
  @ApiProperty({ description: 'Place ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Place name', example: '洛阳' })
  name: string;

  @ApiPropertyOptional({ description: 'Latitude' })
  latitude?: number | null;

  @ApiPropertyOptional({ description: 'Longitude' })
  longitude?: number | null;
}

export class EventLocationDto {
  @ApiProperty({
    description: 'Event location relation ID',
    example: 'uuid-string',
  })
  id: string;

  @ApiProperty({ description: 'Referenced place ID', example: 'uuid-string' })
  placeId: string;

  @ApiPropertyOptional({ description: 'Location role in the event' })
  role?: string | null;

  @ApiPropertyOptional({
    description: 'Location detail',
    type: EventRelatedPlaceDto,
  })
  place?: EventRelatedPlaceDto | null;
}

export class EventDto {
  @ApiProperty({ description: 'Event ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Event title', example: '安史之乱' })
  title: string;

  @ApiProperty({ description: 'Event start year', example: 755 })
  startYear: number;

  @ApiPropertyOptional({ description: 'Event end year', example: 763 })
  endYear?: number | null;

  @ApiPropertyOptional({ description: 'Event description' })
  description?: string | null;

  @ApiPropertyOptional({ description: 'Event type', example: 'war' })
  eventType?: string | null;

  @ApiPropertyOptional({
    description: 'Related event participants',
    type: [EventParticipantDto],
  })
  participants?: EventParticipantDto[] | null;

  @ApiPropertyOptional({
    description: 'Related event locations',
    type: [EventLocationDto],
  })
  locations?: EventLocationDto[] | null;

  @ApiPropertyOptional({
    description: 'Related event sources',
    type: [EventSourceDto],
  })
  sources?: EventSourceDto[] | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
