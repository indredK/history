/**
 * API客户端工具
 * 提供统一的API调用接口
 */

import axios, { AxiosInstance } from 'axios';
import { handleApiResponse, handleSingleApiResponse } from './dataLoaders';
import { fallbackManager } from './errorHandling';

/**
 * 创建API客户端
 */
export function createApiClient(baseURL: string = '/api/v1'): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 请求拦截器
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

  // 响应拦截器
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
}

/**
 * 获取API状态信息
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

// 重新导出响应处理函数，保持兼容性
export { handleApiResponse, handleSingleApiResponse };