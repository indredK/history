import type { MapService } from './mapService';
import { createUnifiedService } from '../base/serviceFactory';
import { mapDataService } from './mapDataService';
import type { Place } from './types';

// 数据转换器
function transformJsonToPlace(jsonPlace: any, index: number): Place {
  const altNames = jsonPlace.alt_names ? 
    jsonPlace.alt_names.split(',').map((name: string) => name.trim()) : 
    undefined;
  
  return {
    id: `place_${jsonPlace.canonical_name.replace(/\s+/g, '_')}_${index}`,
    canonical_name: jsonPlace.canonical_name,
    alt_names: altNames,
    description: jsonPlace.description,
    location: {
      type: 'Point',
      coordinates: [jsonPlace.longitude, jsonPlace.latitude],
    },
    source_ids: jsonPlace.source ? [`src_${jsonPlace.source}`] : [],
  };
}

// 创建统一服务
const unifiedService = createUnifiedService<Place>(
  '/places',
  '/data/json/places.json',
  transformJsonToPlace
);

// 实现地图服务，集成统一服务和地图数据服务
export const mapApi: MapService = {
  ...unifiedService,
  getPlaces: () => unifiedService.getAll(),
  // 集成地图数据服务的其他功能
  loadBoundaryData: async (period: string) => await mapDataService.loadBoundaryData(period),
  getBoundaryDataByYear: async (year: number) => await mapDataService.getBoundaryDataByYear(year),
  loadBoundaryMappings: async () => await mapDataService.loadBoundaryMappings(),
  preloadCommonData: async () => await mapDataService.preloadCommonData(),
  clearCache: (key?: string) => mapDataService.clearCache(key),
  getCacheStats: () => mapDataService.getCacheStats(),
};

// 保持向后兼容的导出
export const getPlaces = () => mapApi.getPlaces();
