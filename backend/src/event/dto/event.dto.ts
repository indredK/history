import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}