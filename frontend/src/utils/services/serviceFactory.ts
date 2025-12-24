/**
 * 统一的服务工厂
 * 整合所有服务创建逻辑，简化services层的代码
 */

import { getDataSourceMode } from '@/config/dataSource';
import { loadJsonArray, type ApiResponse } from './dataLoaders';
import { fallbackManager } from './errorHandling';

import { apiClient, handleApiResponse, handleSingleApiResponse } from './apiClient';

/**
 * 基础服务接口
 */
export interface BaseService<T, ID = string> {
  getAll(): Promise<ApiResponse<T[]>>;
  getById?(id: ID): Promise<ApiResponse<T | null>>;
}

/**
 * 服务配置选项
 */
export interface ServiceOptions {
  hasGetById?: boolean;
  enableCache?: boolean;
  cacheTimeout?: number;
}

/**
 * 创建统一服务的工厂函数
 */
export function createUnifiedService<T>(
  apiEndpoint: string,
  jsonDataPath: string,
  transformer: (jsonItem: any, index: number) => T,
  options: ServiceOptions = {}
): BaseService<T> {
  const { hasGetById = false } = options;

  // Mock数据获取函数
  const getMockData = async (): Promise<ApiResponse<T[]>> => {
    try {
      const jsonData = await loadJsonArray(jsonDataPath);
      const transformedData = jsonData.map(transformer);
      return { data: transformedData };
    } catch (error) {
      console.error(`Mock数据加载失败 (${jsonDataPath}):`, error);
      return { data: [] };
    }
  };

  // API数据获取函数
  const getApiData = async (): Promise<ApiResponse<T[]>> => {
    try {
      console.log(`API调用: GET ${apiEndpoint}`);
      const response = await apiClient.get(apiEndpoint);
      const apiResponse = handleApiResponse<any>(response);
      const transformedData = apiResponse.data.map((item, index) => transformer(item, index));
      return { data: transformedData };
    } catch (error) {
      console.error(`API调用失败 (${apiEndpoint}):`, error);
      throw error;
    }
  };

  // API单个数据获取函数
  const getApiDataById = async (id: string): Promise<ApiResponse<T | null>> => {
    try {
      const endpoint = `${apiEndpoint}/${id}`;
      console.log(`API调用: GET ${endpoint}`);
      const response = await apiClient.get(endpoint);
      const apiResponse = handleSingleApiResponse<any>(response);
      const transformedItem = apiResponse.data ? transformer(apiResponse.data, 0) : null;
      return { data: transformedItem };
    } catch (error) {
      console.error(`API单个数据获取失败 (${apiEndpoint}/${id}):`, error);
      throw error;
    }
  };

  // Mock单个数据获取函数 (从全量数据中查找)
  const getMockDataById = async (id: string): Promise<ApiResponse<T | null>> => {
    const allData = await getMockData();
    const item = allData.data.find((item: any) => {
      // 兼容不同类型的ID比较
      return String((item as any).id) === String(id);
    });
    return { data: item || null };
  };

  // 统一的数据获取函数
  const getAll = async (): Promise<ApiResponse<T[]>> => {
    const dataSourceMode = getDataSourceMode();
    
    if (dataSourceMode === 'mock') {
      return getMockData();
    }
    
    // API模式使用降级策略
    return fallbackManager.executeWithFallback(
      getApiData,
      getMockData,
      `获取${apiEndpoint}数据`
    );
  };

  // 基础服务对象
  const service: BaseService<T> = { getAll };

  // 如果需要getById方法
  if (hasGetById) {
    service.getById = async (id: string): Promise<ApiResponse<T | null>> => {
      const dataSourceMode = getDataSourceMode();
      
      if (dataSourceMode === 'mock') {
        return getMockDataById(id);
      }
      
      // API模式下，先尝试请求特定ID的API，如果失败则回退到Mock
      return fallbackManager.executeWithFallback(
        () => getApiDataById(id),
        () => getMockDataById(id),
        `获取${apiEndpoint}单个数据(id=${id})`
      );
    };
  }

  return service;
}

/**
 * 创建简单的数据客户端
 */
export function createSimpleDataClient<T>(
  apiService: T,
  mockService: T
): T {
  const dataSourceMode = getDataSourceMode();
  return dataSourceMode === 'api' ? apiService : mockService;
}

/**
 * 批量创建服务的配置
 */
export interface ServiceConfig<T> {
  name: string;
  apiEndpoint: string;
  jsonDataPath: string;
  transformer: (jsonItem: any, index: number) => T;
  options?: ServiceOptions;
}

/**
 * 批量创建多个服务
 */
export function createMultipleServices<T extends Record<string, BaseService<any>>>(
  configs: Array<ServiceConfig<any> & { key: keyof T }>
): T {
  const services = {} as T;
  
  configs.forEach(config => {
    (services as any)[config.key] = createUnifiedService(
      config.apiEndpoint,
      config.jsonDataPath,
      config.transformer,
      config.options
    );
  });
  
  return services;
}

/**
 * 服务状态监控
 */
export class ServiceMonitor {
  private static instance: ServiceMonitor;
  private services = new Map<string, any>();
  private stats = new Map<string, { calls: number; errors: number; lastCall: number }>();

  static getInstance(): ServiceMonitor {
    if (!ServiceMonitor.instance) {
      ServiceMonitor.instance = new ServiceMonitor();
    }
    return ServiceMonitor.instance;
  }

  registerService(name: string, service: any): void {
    this.services.set(name, service);
    this.stats.set(name, { calls: 0, errors: 0, lastCall: 0 });
  }

  recordCall(serviceName: string, success: boolean): void {
    const stat = this.stats.get(serviceName);
    if (stat) {
      stat.calls++;
      stat.lastCall = Date.now();
      if (!success) {
        stat.errors++;
      }
    }
  }

  getStats(): Record<string, any> {
    const result: Record<string, any> = {};
    this.stats.forEach((stat, name) => {
      result[name] = {
        ...stat,
        errorRate: stat.calls > 0 ? (stat.errors / stat.calls * 100).toFixed(2) + '%' : '0%'
      };
    });
    return result;
  }

  getServiceList(): string[] {
    return Array.from(this.services.keys());
  }
}

// 全局服务监控实例
export const serviceMonitor = ServiceMonitor.getInstance();