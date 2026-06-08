import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { EventService } from './event.service';
import { EventQueryDto } from './dto/event-query.dto';
import { EventDto } from './dto/event.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

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

  @Post()
  @ApiOperation({
    summary: 'Create event',
    description:
      'Create a historical event record with optional participants, locations, and sources',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully created event',
    type: EventDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid event payload',
  })
  async create(@Body() body: CreateEventDto): Promise<EventDto> {
    return this.eventService.create(body);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update event',
    description:
      'Update a historical event record and optionally replace its participants, locations, and sources',
  })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated event',
    type: EventDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
  })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateEventDto,
  ): Promise<EventDto> {
    return this.eventService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete event',
    description: 'Delete a historical event record by ID',
  })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully deleted event',
    type: EventDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
  })
  async remove(@Param('id') id: string): Promise<EventDto> {
    return this.eventService.remove(id);
  }
}
