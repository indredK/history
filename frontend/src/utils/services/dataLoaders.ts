/**
 * 统一的数据加载工具
 * 处理所有静态资源的路径问题，确保在GitHub Pages等部署环境中正确加载
 */

/**
 * 获取正确的资源路径
 * 处理部署环境中的base路径问题
 */
export function getResourcePath(path: string): string {
  const basePath = import.meta.env.BASE_URL || '/';
  return path.startsWith('/') ? `${basePath.replace(/\/$/, '')}${path}` : path;
}

/**
 * 通用的JSON数据加载函数
 * 支持返回数组或单个对象
 */
export async function loadJsonData<T>(path: string): Promise<T> {
  try {
    // 处理部署路径，确保在 GitHub Pages 上正确加载
    const basePath = import.meta.env.BASE_URL || '/';
    const fullPath = path.startsWith('/') ? `${basePath.replace(/\/$/, '')}${path}` : path;
    
    const response = await fetch(fullPath);
    if (!response.ok) {
      throw new Error(`Failed to load ${fullPath}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading ${path}:`, error);
    throw error;
  }
}

/**
 * 加载JSON数组数据
 */
export async function loadJsonArray<T>(path: string): Promise<T[]> {
  try {
    const data = await loadJsonData<T[] | T>(path);
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error(`Error loading array from ${path}:`, error);
    return [];
  }
}

/**
 * 加载朝代配置数据
 */
export async function loadDynastiesConfig() {
  return loadJsonData('/data/json/chinese-dynasties.json');
}

/**
 * 加载单个朝代数据
 */
export async function loadDynastyData(dataFile: string) {
  return loadJsonData(`/data/json/${dataFile}`);
}

/**
 * 加载时间轴事件数据
 */
export async function loadTimelineEvents() {
  return loadJsonArray('/data/json/events.json');
}

/**
 * 加载人物数据
 */
export async function loadPersonsData() {
  return loadJsonArray('/data/json/persons.json');
}

/**
 * 加载地点数据
 */
export async function loadPlacesData() {
  return loadJsonArray('/data/json/places.json');
}

/**
 * 加载地图GeoJSON数据
 */
export async function loadMapGeoJson() {
  return loadJsonData('/data/json/100000.geoJson');
}

/**
 * 通用的资源加载器
 * 支持各种类型的静态资源
 */
export class ResourceLoader {
  private static cache = new Map<string, any>();

  /**
   * 加载并缓存JSON数据
   */
  static async loadJson<T>(path: string, useCache = true): Promise<T> {
    if (useCache && this.cache.has(path)) {
      return this.cache.get(path);
    }

    const data = await loadJsonData<T>(path);
    
    if (useCache) {
      this.cache.set(path, data);
    }
    
    return data;
  }

  /**
   * 加载图片资源
   */
  static loadImage(path: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = getResourcePath(path);
    });
  }

  /**
   * 清除缓存
   */
  static clearCache(path?: string) {
    if (path) {
      this.cache.delete(path);
    } else {
      this.cache.clear();
    }
  }

  /**
   * 获取缓存状态
   */
  static getCacheInfo() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

/**
 * 数据加载状态管理
 */
export interface LoadingState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * 创建数据加载状态
 */
export function createLoadingState<T>(): LoadingState<T> {
  return {
    data: null,
    loading: false,
    error: null
  };
}

/**
 * 数据加载错误处理
 */
export class DataLoadError extends Error {
  constructor(
    message: string,
    public path: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'DataLoadError';
  }
}

/**
 * 重试加载数据
 */
export async function retryLoad<T>(
  loadFn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await loadFn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw new DataLoadError(
    `Failed to load data after ${maxRetries} retries`,
    'unknown',
    lastError!
  );
}

// 导出常用的数据加载函数
export const dataLoaders = {
  dynastiesConfig: loadDynastiesConfig,
  dynastyData: loadDynastyData,
  timelineEvents: loadTimelineEvents,
  personsData: loadPersonsData,
  placesData: loadPlacesData,
  mapGeoJson: loadMapGeoJson,
} as const;

/**
 * API响应处理工具
 */
export interface ApiResponse<T> {
  data: T;
  success?: boolean;
  message?: string;
}

/**
 * 统一的API响应处理函数
 */
export function handleApiResponse<T>(response: any): ApiResponse<T[]> {
  // 如果是axios响应对象
  if (response.data) {
    const backendData = response.data;
    
    // 检查后端响应格式
    if (backendData.success !== undefined) {
      if (!backendData.success) {
        throw new Error(backendData.message || 'API请求失败');
      }
      
      // 提取实际数据
      if (backendData.data) {
        if (Array.isArray(backendData.data)) {
          return { data: backendData.data };
        }
        // 如果是分页响应
        if (typeof backendData.data === 'object' && 'data' in backendData.data) {
          return { data: backendData.data.data };
        }
        // 单个对象包装成数组
        return { data: [backendData.data] };
      }
    }
    
    // 直接是数组数据
    if (Array.isArray(backendData)) {
      return { data: backendData };
    }
  }
  
  return { data: [] };
}

/**
 * 处理单个对象的API响应
 */
export function handleSingleApiResponse<T>(response: any): ApiResponse<T> {
  if (response.data) {
    const backendData = response.data;
    
    if (backendData.success !== undefined) {
      if (!backendData.success) {
        throw new Error(backendData.message || 'API请求失败');
      }
      
      if (backendData.data) {
        return { data: backendData.data };
      }
    }
    
    // 直接返回数据
    return { data: backendData };
  }
  
  throw new Error('响应数据为空');
}

/**
 * 创建统一的数据获取函数
 */
export function createDataFetcher<TArgs extends any[], TReturn>(
  apiFetcher: (...args: TArgs) => TReturn,
  mockFetcher: (...args: TArgs) => TReturn,
  dataSourceMode: 'api' | 'mock' = 'mock'
): (...args: TArgs) => TReturn {
  return dataSourceMode === 'api' ? apiFetcher : mockFetcher;
}

// 导出类型
export type DataLoaderKey = keyof typeof dataLoaders;