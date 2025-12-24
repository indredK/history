import type { MapService } from './mapService';
import { createUnifiedService } from '../base/serviceFactory';
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

export const mapApi: MapService = {
  ...unifiedService,
  getPlaces: () => unifiedService.getAll(),
};
