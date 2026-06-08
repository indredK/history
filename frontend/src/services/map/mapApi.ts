import type { MapService } from './mapService';
import { createUnifiedService } from '../base/serviceFactory';
import { mapDataService } from './mapDataService';
import { MAP_PLACES_PATH } from '@/config/mapDataPaths';
import type { Place } from './types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function readNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function readStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => readString(item))
      .filter(Boolean);
  }

  const text = readString(value);
  return text ? text.split(',').map((name) => name.trim()).filter(Boolean) : [];
}

function readPointLocation(source: Record<string, unknown>): Place['location'] | undefined {
  const rawLocation = source['location'];
  if (
    isRecord(rawLocation)
    && rawLocation['type'] === 'Point'
    && Array.isArray(rawLocation['coordinates'])
  ) {
    const [longitude, latitude] = rawLocation['coordinates'];
    if (typeof longitude === 'number' && typeof latitude === 'number') {
      return {
        type: 'Point',
        coordinates: [longitude, latitude],
      };
    }
  }

  const longitude = readNumber(source['longitude']);
  const latitude = readNumber(source['latitude']);
  if (longitude !== undefined && latitude !== undefined) {
    return {
      type: 'Point',
      coordinates: [longitude, latitude],
    };
  }

  return undefined;
}

// 数据转换器
function transformJsonToPlace(jsonPlace: unknown, index: number): Place {
  const source = isRecord(jsonPlace) ? jsonPlace : {};
  const canonicalName =
    readString(source['canonical_name']) || readString(source['name']) || `place_${index}`;
  const altNames = readStringArray(source['alt_names']);
  const sourceIds = readStringArray(source['source_ids']);
  const sourceName = readString(source['source']);
  const location = readPointLocation(source);

  const place: Place = {
    id: readString(source['id']) || `place_${canonicalName.replace(/\s+/g, '_')}_${index}`,
    canonical_name: canonicalName,
    source_ids: sourceIds.length > 0 ? sourceIds : sourceName ? [`src_${sourceName}`] : [],
  };

  if (altNames.length > 0) {
    place.alt_names = altNames;
  }
  const description = readString(source['description']);
  if (description) {
    place.description = description;
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
