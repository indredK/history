/**
 * 服务工厂 - 统一创建API和Mock服务
 */

import type { BaseService } from './types';
import { getDataSourceMode } from '@/config/dataSource';
import { createApiClient, handleApiResponse, handleSingleApiResponse } from '../utils/apiResponseHandler';
import { loadJsonData } from '@/utils/services/dataLoader';

/**
 * 创建API服务
 */
export function createApiService<T, ID = string>(
  endpoint: string,
  options: {
    hasGetById?: boolean;
  } = {}
): BaseService<T, ID> {
  const api = createApiClient();
  
  return {
    getAll: async () => {
      const response = await api.get(endpoint);
      return handleApiResponse<T>(response);
    },
    
    ...(options.hasGetById && {
      getById: async (id: ID) => {
        const response = await api.get(`${endpoint}/${id}`);
        return handleSingleApiResponse<T>(response);
      }
    })
  };
}

/**
 * 创建Mock服务
 */
export function createMockService<T, ID = string>(
  jsonPath: string,
  transformer: (jsonItem: any, index: number) => T,
  options: {
    hasGetById?: boolean;
    delay?: number;
  } = {}
): BaseService<T, ID> {
  let cachedData: T[] | null = null;
  const delay = options.delay || 800;
  
  const loadData = async (): Promise<T[]> => {
    if (cachedData) return cachedData;
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, delay));
    
    const jsonData = await loadJsonData<any>(jsonPath);
    cachedData = Array.isArray(jsonData) 
      ? jsonData.map((item, index) => transformer(item, index))
      : [transformer(jsonData, 0)];
    
    return cachedData;
  };
  
  return {
    getAll: async () => {
      const data = await loadData();
      return { data };
    },
    
    ...(options.hasGetById && {
      getById: async (id: ID) => {
        const data = await loadData();
        const item = data.find((item: any) => item.id === id);
        
        if (!item) {
          const error = new Error('Item not found');
          // @ts-expect-error decorate error
          error.status = 404;
          throw error;
        }
        
        return { data: item };
      }
    })
  };
}

/**
 * 创建统一服务（自动选择API或Mock）
 */
export function createUnifiedService<T, ID = string>(
  endpoint: string,
  jsonPath: string,
  transformer: (jsonItem: any, index: number) => T,
  options: {
    hasGetById?: boolean;
    mockDelay?: number;
  } = {}
): BaseService<T, ID> {
  const apiService = createApiService<T, ID>(endpoint, options);
  const mockService = createMockService<T, ID>(jsonPath, transformer, {
    ...(options.hasGetById !== undefined && { hasGetById: options.hasGetById }),
    ...(options.mockDelay !== undefined && { delay: options.mockDelay })
  });
  
  return {
    getAll: () => {
      return getDataSourceMode() === 'api' 
        ? apiService.getAll() 
        : mockService.getAll();
    },
    
    ...(options.hasGetById && {
      getById: (id: ID) => {
        return getDataSourceMode() === 'api'
          ? apiService.getById!(id)
          : mockService.getById!(id);
      }
    })
  };
}