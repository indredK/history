import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EventService } from './event.service';
import { TimelineQueryDto } from './dto/timeline-query.dto';
import { TimelineResponseDto } from './dto/timeline-event.dto';

@ApiTags('Timeline')
@Controller('timeline')
export class TimelineController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  @ApiOperation({
    summary: 'Get historical timeline',
    description:
      'Retrieve a chronological timeline of historical events within a specified year range',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved timeline',
    type: TimelineResponseDto,
  })
  async getTimeline(
    @Query() query: TimelineQueryDto,
  ): Promise<TimelineResponseDto> {
    return this.eventService.getTimeline(query);
  }
}
