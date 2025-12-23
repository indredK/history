/**
 * API响应处理工具
 * 统一处理后端API的响应格式，包含增强的错误处理和降级策略
 */

import { ApiError, ApiErrorType } from './enhancedApiClient';
import { fallbackManager } from './fallbackManager';

/**
 * 后端API响应格式
 */
interface BackendApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * 后端分页响应格式
 */
interface BackendPaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * 前端期望的响应格式
 */
interface FrontendResponse<T> {
  data: T;
}

/**
 * 处理后端API响应，提取数据
 * @param response axios响应对象
 * @returns 前端格式的响应
 */
export function handleApiResponse<T>(response: any): FrontendResponse<T[]> {
  const backendData: BackendApiResponse<BackendPaginatedResponse<T> | T | T[]> = response.data;
  
  // 检查响应是否成功
  if (!backendData.success) {
    throw new ApiError(ApiErrorType.SERVER_ERROR, backendData.message || 'API请求失败');
  }
  
  // 提取实际数据
  if (backendData.data) {
    // 如果是分页响应
    if (typeof backendData.data === 'object' && 'data' in backendData.data && Array.isArray(backendData.data.data)) {
      return { data: backendData.data.data };
    }
    
    // 如果直接是数组
    if (Array.isArray(backendData.data)) {
      return { data: backendData.data };
    }
    
    // 如果是单个对象，包装成数组
    return { data: [backendData.data] as T[] };
  }
  
  return { data: [] };
}

/**
 * 处理单个对象的API响应
 * @param response axios响应对象
 * @returns 前端格式的响应
 */
export function handleSingleApiResponse<T>(response: any): FrontendResponse<T> {
  const backendData: BackendApiResponse<T> = response.data;
  
  // 检查响应是否成功
  if (!backendData.success) {
    throw new ApiError(ApiErrorType.SERVER_ERROR, backendData.message || 'API请求失败');
  }
  
  // 提取实际数据
  if (backendData.data) {
    return { data: backendData.data };
  }
  
  throw new ApiError(ApiErrorType.SERVER_ERROR, '响应数据为空');
}

/**
 * 创建统一的API客户端
 * 返回axios兼容的接口
 */
import axios from 'axios';

export const createApiClient = (baseURL: string = '/api/v1') => {
  // 创建基础axios客户端
  const client = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  // 基础拦截器
  client.interceptors.request.use(
    (config) => {
      console.log(`🌐 API请求: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    (error) => {
      console.error('❌ API请求错误:', error);
      return Promise.reject(error);
    }
  );
  
  client.interceptors.response.use(
    (response) => {
      console.log(`✅ API响应: ${response.config.url} - ${response.status}`);
      return response;
    },
    (error) => {
      console.error(`❌ API响应错误: ${error.config?.url}`, error.response?.data || error.message);
      return Promise.reject(error);
    }
  );
  
  return client;
};

/**
 * 带降级策略的API请求包装器
 * @param apiOperation API操作函数
 * @param fallbackOperation 降级操作函数
 * @param operationName 操作名称（用于日志）
 * @returns Promise结果
 */
export async function executeWithFallback<T>(
  apiOperation: () => Promise<T>,
  fallbackOperation: () => Promise<T>,
  operationName: string = 'API操作'
): Promise<T> {
  return fallbackManager.executeWithFallback(apiOperation, fallbackOperation, operationName);
}

/**
 * 获取API客户端状态信息
 */
export function getApiStatus() {
  const fallbackState = fallbackManager.getState();
  
  return {
    fallback: {
      isActive: fallbackState.isActive,
      failureCount: fallbackState.failureCount,
      lastError: fallbackState.lastError?.message,
      config: fallbackState.config,
    },
  };
}

/**
 * 手动控制降级策略
 */
export const fallbackControl = {
  /**
   * 手动激活降级策略
   */
  activate: () => fallbackManager.manualActivate(),
  
  /**
   * 手动停用降级策略
   */
  deactivate: () => fallbackManager.manualDeactivate(),
  
  /**
   * 重置降级状态
   */
  reset: () => fallbackManager.reset(),
  
  /**
   * 更新降级配置
   */
  updateConfig: (config: any) => fallbackManager.updateConfig(config),
  
  /**
   * 获取当前状态
   */
  getState: () => fallbackManager.getState(),
};