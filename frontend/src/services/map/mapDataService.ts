/**
 * 地图数据专用服务
 * 处理大型地图数据的加载、缓存和优化
 */

import { loadJsonData } from '@/utils/services/dataLoaders';
import {
  CHINA_GEOJSON_PATH,
  MAP_BOUNDARIES_DATA_PATH,
  MAP_PLACES_PATH,
} from '@/config/mapDataPaths';
import type {
  Place,
  BoundaryGeoJSON,
  BoundaryMapping,
  GeoJsonData,
  MapDataPoint,
  ProvinceData,
} from './types';

/**
 * 地图数据缓存管理器
 */
class MapDataCache {
  private cache = new Map<string, any>();
  private loadingPromises = new Map<string, Promise<any>>();

  async get<T>(key: string, loader: () => Promise<T>): Promise<T> {
    // 如果已缓存，直接返回
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    // 如果正在加载，返回加载Promise
    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key)!;
    }

    // 开始加载
    const loadingPromise = loader().then(data => {
      this.cache.set(key, data);
      this.loadingPromises.delete(key);
      return data;
    }).catch(error => {
      this.loadingPromises.delete(key);
      throw error;
    });

    this.loadingPromises.set(key, loadingPromise);
    return loadingPromise;
  }

  clear(key?: string) {
    if (key) {
      this.cache.delete(key);
      this.loadingPromises.delete(key);
    } else {
      this.cache.clear();
      this.loadingPromises.clear();
    }
  }

  getStats() {
    return {
      cacheSize: this.cache.size,
      loadingCount: this.loadingPromises.size,
      cachedKeys: Array.from(this.cache.keys())
    };
  }
}

/**
 * 地图数据服务类
 */
export class MapDataService {
  private cache = new MapDataCache();

  /**
   * 加载地点数据
   */
  async loadPlaces(): Promise<Place[]> {
    return this.cache.get('places', async () => {
      console.log('🗺️ 加载地点数据...');
      const data = await loadJsonData<Place[]>(MAP_PLACES_PATH);
      console.log(`✅ 地点数据加载完成，共 ${data.length} 个地点`);
      return data;
    });
  }

  async loadChinaGeoJson(): Promise<GeoJsonData> {
    return this.cache.get('china-geojson', () =>
      loadJsonData<GeoJsonData>(CHINA_GEOJSON_PATH),
    );
  }

  async loadProvinceData(): Promise<ProvinceData[]> {
    return this.cache.get('china-province-data', async () => {
      const geoJson = await this.loadChinaGeoJson();
      return geoJson.features.map((feature, index) => ({
        name: feature.properties.name,
        value: 500 + (index + 1) * 275,
        ...(feature.properties.adcode
          ? { adcode: feature.properties.adcode }
          : {}),
        ...(feature.properties.center
          ? { center: feature.properties.center }
          : {}),
      }));
    });
  }

  async loadCityMarkers(limit: number = 10): Promise<MapDataPoint[]> {
    return this.cache.get(`china-city-markers-${limit}`, async () => {
      const geoJson = await this.loadChinaGeoJson();
      return geoJson.features
        .filter((feature) => feature.properties.center)
        .slice(0, limit)
        .map((feature, index) => ({
          name: feature.properties.name.replace(
            /省|市|自治区|特别行政区|壮族|回族|维吾尔/g,
            '',
          ),
          value: 50 + (index + 1) * 8,
          ...(feature.properties.center
            ? { coord: feature.properties.center }
            : {}),
        }));
    });
  }

  /**
   * 加载边界数据映射
   */
  async loadBoundaryMappings(): Promise<BoundaryMapping[]> {
    return this.cache.get('boundary-mappings', async () => {
      console.log('🗺️ 加载边界映射数据...');
      // 这里可以加载边界数据的索引文件
      const mappings: BoundaryMapping[] = [
        { file: 'boundaries_qin.geojson', validFrom: -221, validTo: -206, name: '秦朝', period: 'qin' },
        { file: 'boundaries_han.geojson', validFrom: -206, validTo: 220, name: '汉朝', period: 'han' },
        { file: 'boundaries_three_kingdoms.geojson', validFrom: 220, validTo: 280, name: '三国', period: 'sanguo' },
        { file: 'boundaries_jin.geojson', validFrom: 266, validTo: 420, name: '晋朝', period: 'jin' },
        { file: 'boundaries_sui.geojson', validFrom: 581, validTo: 618, name: '隋朝', period: 'sui' },
        { file: 'boundaries_tang.geojson', validFrom: 618, validTo: 907, name: '唐朝', period: 'tang' },
        { file: 'boundaries_song.geojson', validFrom: 960, validTo: 1279, name: '宋朝', period: 'song' },
        { file: 'boundaries_yuan.geojson', validFrom: 1271, validTo: 1368, name: '元朝', period: 'yuan' },
        { file: 'boundaries_ming.geojson', validFrom: 1368, validTo: 1644, name: '明朝', period: 'ming' },
        { file: 'boundaries_qing.geojson', validFrom: 1644, validTo: 1912, name: '清朝', period: 'qing' },
      ];
      console.log(`✅ 边界映射数据加载完成，共 ${mappings.length} 个时期`);
      return mappings;
    });
  }

  /**
   * 按需加载特定时期的边界数据
   */
  async loadBoundaryData(period: string): Promise<BoundaryGeoJSON | null> {
    const cacheKey = `boundary-${period}`;
    
    return this.cache.get(cacheKey, async () => {
      console.log(`🗺️ 加载 ${period} 时期边界数据...`);
      
      try {
        const mappings = await this.loadBoundaryMappings();
        const mapping = mappings.find(m => m.period === period);
        
        if (!mapping) {
          console.warn(`⚠️ 未找到 ${period} 时期的边界数据映射`);
          return null;
        }

        const data = await loadJsonData<BoundaryGeoJSON>(`${MAP_BOUNDARIES_DATA_PATH}/${mapping.file}`);
        console.log(`✅ ${period} 时期边界数据加载完成`);
        return data;
      } catch (error) {
        console.error(`❌ 加载 ${period} 时期边界数据失败:`, error);
        return null;
      }
    });
  }

  /**
   * 根据年份获取对应的边界数据
   */
  async getBoundaryDataByYear(year: number): Promise<BoundaryGeoJSON | null> {
    const mappings = await this.loadBoundaryMappings();
    const matchedMappings = mappings.filter((mapping) => year >= mapping.validFrom && year <= mapping.validTo);
    const mapping = matchedMappings.sort((left, right) => right.validFrom - left.validFrom)[0] ?? null;
    
    if (!mapping) {
      console.warn(`⚠️ 未找到年份 ${year} 对应的边界数据`);
      return null;
    }

    return this.loadBoundaryData(mapping.period);
  }

  /**
   * 预加载常用的地图数据
   */
  async preloadCommonData(): Promise<void> {
    console.log('🚀 开始预加载常用地图数据...');
    
    const preloadTasks = [
      this.loadPlaces(),
      this.loadBoundaryMappings(),
      // 预加载几个重要朝代的边界数据
      this.loadBoundaryData('tang'),
      this.loadBoundaryData('song'),
      this.loadBoundaryData('ming'),
      this.loadBoundaryData('qing'),
    ];

    try {
      await Promise.all(preloadTasks);
      console.log('✅ 常用地图数据预加载完成');
    } catch (error) {
      console.error('❌ 地图数据预加载失败:', error);
    }
  }

  /**
   * 清理缓存
   */
  clearCache(key?: string): void {
    this.cache.clear(key);
    console.log(key ? `🧹 已清理缓存: ${key}` : '🧹 已清理所有地图数据缓存');
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats() {
    return this.cache.getStats();
  }
}

// 全局地图数据服务实例
export const mapDataService = new MapDataService();
