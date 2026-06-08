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
import { PersonService } from './person.service';
import { PersonQueryDto } from './dto/person-query.dto';
import { PersonDto } from './dto/person.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { CreatePersonDto, UpdatePersonDto } from './dto/person-mutation.dto';

@ApiTags('Persons')
@Controller('persons')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all persons',
    description:
      'Retrieve a paginated list of historical persons with optional filtering by year range, name, and dynasty',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved persons',
    type: PaginatedResponseDto<PersonDto>,
  })
  async findAll(
    @Query() query: PersonQueryDto,
  ): Promise<PaginatedResponseDto<PersonDto>> {
    return this.personService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get person by ID',
    description:
      'Retrieve detailed information about a specific historical person',
  })
  @ApiParam({ name: 'id', description: 'Person ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved person',
    type: PersonDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Person not found',
  })
  async findOne(@Param('id') id: string): Promise<PersonDto> {
    return this.personService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create person',
    description:
      'Create a historical person record for the unified people archive',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully created person',
    type: PersonDto,
  })
  async create(@Body() dto: CreatePersonDto): Promise<PersonDto> {
    return this.personService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update person',
    description: 'Update a historical person record',
  })
  @ApiParam({ name: 'id', description: 'Person ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated person',
    type: PersonDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Person not found',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePersonDto,
  ): Promise<PersonDto> {
    return this.personService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete person',
    description: 'Delete a historical person record',
  })
  @ApiParam({ name: 'id', description: 'Person ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully deleted person',
    type: PersonDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Person not found',
  })
  async remove(@Param('id') id: string): Promise<PersonDto> {
    return this.personService.remove(id);
  }
}
