import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ACCEPTED_BOUNDARY_PERIODS,
  BoundaryPeriodQueryDto,
  BoundaryYearQueryDto,
} from './dto/boundary-query.dto';
import { PlaceDto, PlaceQueryDto } from './dto/place.dto';
import { MapService } from './map.service';

@ApiTags('Places')
@Controller('places')
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Get()
  @ApiOperation({
    summary: 'Get historical places',
    description:
      'Retrieve place records with optional keyword and coordinate range filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved places',
    type: [PlaceDto],
  })
  async getPlaces(@Query() query: PlaceQueryDto): Promise<PlaceDto[]> {
    return await this.mapService.getPlaces(query);
  }
}

// 边界数据控制器
@ApiTags('Map')
@Controller('map')
export class MapDataController {
  constructor(private readonly mapService: MapService) {}

  @Get('boundary-data')
  @ApiOperation({
    summary: 'Get boundary data by period',
    description: 'Load a historical boundary GeoJSON snapshot by period key',
  })
  @ApiQuery({
    name: 'period',
    enum: ACCEPTED_BOUNDARY_PERIODS,
    required: true,
    example: 'qin',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved boundary data',
  })
  @ApiResponse({ status: 400, description: 'Invalid period query' })
  @ApiResponse({ status: 404, description: 'Boundary period not found' })
  async loadBoundaryData(@Query() query: BoundaryPeriodQueryDto) {
    return await this.mapService.loadBoundaryData(query.period);
  }

  @Get('boundary-data/year')
  @ApiOperation({
    summary: 'Get boundary data by year',
    description:
      'Resolve the closest historical boundary snapshot that covers the requested year',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved boundary data for year',
  })
  @ApiResponse({ status: 400, description: 'Invalid year query' })
  @ApiResponse({ status: 404, description: 'Boundary year not found' })
  async getBoundaryDataByYear(@Query() query: BoundaryYearQueryDto) {
    return await this.mapService.getBoundaryDataByYear(query.year);
  }

  @Get('boundary-mappings')
  @ApiOperation({
    summary: 'Get boundary mappings',
    description: 'Retrieve period-to-file mapping metadata for map boundaries',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved boundary mappings',
  })
  async loadBoundaryMappings() {
    return await this.mapService.loadBoundaryMappings();
  }

  @Get('preload')
  @ApiOperation({
    summary: 'Preload common map data',
    description:
      'Warm places and frequently used boundary snapshots, including the Qin default first-screen boundary',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully preloaded common map data',
  })
  async preloadCommonData() {
    return await this.mapService.preloadCommonData();
  }

  @Get('clear-cache')
  @ApiOperation({
    summary: 'Clear map data cache',
    description: 'Clear all cached boundary data or a specific cache item',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully cleared map cache',
  })
  async clearCache(@Query('key') key?: string) {
    return await this.mapService.clearCache(key);
  }

  @Get('cache-stats')
  @ApiOperation({
    summary: 'Get map cache stats',
    description: 'Inspect cached boundary file count for map data service',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved cache stats',
  })
  async getCacheStats() {
    return await this.mapService.getCacheStats();
  }
}
