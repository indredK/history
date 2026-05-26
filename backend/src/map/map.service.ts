import { Injectable } from '@nestjs/common';
import { PlaceDto } from './dto/place.dto';

/**
 * 当前 MapService 全部方法都是同步桩(待接入真实数据源前的占位实现):
 * 没有 IO,因此 method body 不需要 await。
 * 为了保持 controller 端调用 `await this.mapService.x()` 的写法兼容,
 * 这里仍然返回 Promise(用 Promise.resolve 包裹),但不再标记 async,
 * 从而避免 ESLint `@typescript-eslint/require-await` 报错。
 */

export interface BoundaryDataResponse {
  period?: string;
  year?: number;
  boundary: string;
  timestamp: string;
}

export interface BoundaryMappingsResponse {
  mappings: { period: string; map: string }[];
  timestamp: string;
}

export interface PreloadResponse {
  commonData: string;
  timestamp: string;
}

export interface ClearCacheResponse {
  message: string;
  timestamp: string;
}

export interface CacheStatsResponse {
  cacheItems: number;
  cacheSize: string;
  timestamp: string;
}

@Injectable()
export class MapService {
  // 获取所有地点
  getPlaces(): Promise<PlaceDto[]> {
    // 这里应该从数据库获取数据，暂时返回模拟数据
    return Promise.resolve([
      {
        id: 'place_beijing_0',
        canonical_name: '北京',
        alt_names: ['北平', '燕京'],
        description: '中国首都',
        location: {
          type: 'Point',
          coordinates: [116.4074, 39.9042],
        },
        source_ids: ['src_1'],
      },
      {
        id: 'place_shanghai_1',
        canonical_name: '上海',
        alt_names: ['申城', '沪'],
        description: '中国最大城市',
        location: {
          type: 'Point',
          coordinates: [121.4737, 31.2304],
        },
        source_ids: ['src_2'],
      },
    ]);
  }

  // 加载边界数据
  loadBoundaryData(period: string): Promise<BoundaryDataResponse> {
    return Promise.resolve({
      period,
      boundary: '模拟边界数据',
      timestamp: new Date().toISOString(),
    });
  }

  // 根据年份获取边界数据
  getBoundaryDataByYear(year: number): Promise<BoundaryDataResponse> {
    return Promise.resolve({
      year,
      boundary: '模拟年份边界数据',
      timestamp: new Date().toISOString(),
    });
  }

  // 加载边界映射
  loadBoundaryMappings(): Promise<BoundaryMappingsResponse> {
    return Promise.resolve({
      mappings: [
        { period: 'ancient', map: 'map1' },
        { period: 'medieval', map: 'map2' },
      ],
      timestamp: new Date().toISOString(),
    });
  }

  // 预加载通用数据
  preloadCommonData(): Promise<PreloadResponse> {
    return Promise.resolve({
      commonData: '预加载的通用数据',
      timestamp: new Date().toISOString(),
    });
  }

  // 清除缓存
  clearCache(key?: string): Promise<ClearCacheResponse> {
    return Promise.resolve({
      message: `缓存已清除${key ? ` (key: ${key})` : ''}`,
      timestamp: new Date().toISOString(),
    });
  }

  // 获取缓存统计
  getCacheStats(): Promise<CacheStatsResponse> {
    return Promise.resolve({
      cacheItems: 100,
      cacheSize: '10MB',
      timestamp: new Date().toISOString(),
    });
  }
}
