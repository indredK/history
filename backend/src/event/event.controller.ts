import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { EventService } from './event.service';
import { EventQueryDto } from './dto/event-query.dto';
import { EventDto } from './dto/event.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@ApiTags('Events')
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all events',
    description:
      'Retrieve a paginated list of historical events with optional filtering by year range, event type, and title',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved events',
    type: PaginatedResponseDto<EventDto>,
  })
  async findAll(
    @Query() query: EventQueryDto,
  ): Promise<PaginatedResponseDto<EventDto>> {
    return this.eventService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get event by ID',
    description:
      'Retrieve detailed information about a specific historical event',
  })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved event',
    type: EventDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
  })
  async findOne(@Param('id') id: string): Promise<EventDto> {
    return this.eventService.findOne(id);
  }
}
