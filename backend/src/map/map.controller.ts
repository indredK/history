import { Controller, Get, Param, Query } from '@nestjs/common';
import { MapService } from './map.service';

@Controller('places')
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Get()
  async getPlaces() {
    return await this.mapService.getPlaces();
  }
}

// 边界数据控制器
@Controller('map')
export class MapDataController {
  constructor(private readonly mapService: MapService) {}

  @Get('boundary-data')
  async loadBoundaryData(@Query('period') period: string) {
    return await this.mapService.loadBoundaryData(period);
  }

  @Get('boundary-data/year')
  async getBoundaryDataByYear(@Query('year') year: number) {
    return await this.mapService.getBoundaryDataByYear(year);
  }

  @Get('boundary-mappings')
  async loadBoundaryMappings() {
    return await this.mapService.loadBoundaryMappings();
  }

  @Get('preload')
  async preloadCommonData() {
    return await this.mapService.preloadCommonData();
  }

  @Get('clear-cache')
  async clearCache(@Query('key') key?: string) {
    return await this.mapService.clearCache(key);
  }

  @Get('cache-stats')
  async getCacheStats() {
    return await this.mapService.getCacheStats();
  }
}
