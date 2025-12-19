import type { MapService } from './mapService';
import type { Place } from './types';
import { loadJsonArray } from '@/utils/dataLoaders';

// 转换 JSON 数据为 Place 格式
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

// 缓存加载的数据
let cachedPlaces: Place[] | null = null;

// 延迟1秒获取数据
async function delay() {
  return new Promise((resolve) => setTimeout(resolve, 1000));
}

export const mapMock: MapService = {
  getPlaces: async () => {
    await delay();
    
    if (cachedPlaces) {
      return { data: cachedPlaces };
    }

    const jsonPlaces = await loadJsonArray<any>('/data/json/places.json');
    cachedPlaces = jsonPlaces.map(transformJsonToPlace);
    return { data: cachedPlaces };
  },
};
