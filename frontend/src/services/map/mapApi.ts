import type { MapService } from './mapService';
import { createUnifiedService } from '../base/serviceFactory';
import { mapDataService } from './mapDataService';
import { MAP_PLACES_PATH } from '@/config/mapDataPaths';
import type { Place } from './types';

// 数据转换器
function transformJsonToPlace(jsonPlace: any, index: number): Place {
  const canonicalName = jsonPlace.canonical_name || jsonPlace.name || `place_${index}`;
  const altNames = Array.isArray(jsonPlace.alt_names)
    ? jsonPlace.alt_names
    : jsonPlace.alt_names
      ? String(jsonPlace.alt_names).split(',').map((name: string) => name.trim()).filter(Boolean)
      : [];
  const location = jsonPlace.location?.type === 'Point' && Array.isArray(jsonPlace.location.coordinates)
    ? jsonPlace.location
    : typeof jsonPlace.longitude === 'number' && typeof jsonPlace.latitude === 'number'
      ? {
          type: 'Point' as const,
          coordinates: [jsonPlace.longitude, jsonPlace.latitude] as [number, number],
        }
      : undefined;

  const place: Place = {
    id: jsonPlace.id || `place_${canonicalName.replace(/\s+/g, '_')}_${index}`,
    canonical_name: canonicalName,
    source_ids: jsonPlace.source_ids || (jsonPlace.source ? [`src_${jsonPlace.source}`] : []),
  };

  if (altNames.length > 0) {
    place.alt_names = altNames;
  }
  if (typeof jsonPlace.description === 'string' && jsonPlace.description.trim()) {
    place.description = jsonPlace.description;
  }
  if (location) {
    place.location = location;
  }

  return place;
}

// 创建统一服务
const unifiedService = createUnifiedService<Place>(
  '/places',
  MAP_PLACES_PATH,
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
