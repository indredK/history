/**
 * API客户端工具
 * 提供统一的API调用接口
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { handleApiResponse, handleSingleApiResponse } from './dataLoaders';
import { ApiError, ApiErrorType, fallbackManager } from './errorHandling';

const isDev = import.meta.env.DEV;

/**
 * 将 axios 错误标准化为 ApiError，让上层可以按类型分支处理
 */
function normalizeAxiosError(error: AxiosError): ApiError {
  // 客户端代码错误（非 axios 抛出，已经是 ApiError）
  if (error instanceof ApiError) {
    return error;
  }

  // 网络错误（无 response）
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return new ApiError(ApiErrorType.TIMEOUT_ERROR, '请求超时', error);
    }
    return new ApiError(ApiErrorType.NETWORK_ERROR, '网络连接失败', error);
  }

  const status = error.response.status;
  const message =
    (error.response.data as { message?: string })?.message ||
    error.message ||
    `HTTP ${status}`;

  if (status >= 500) {
    return new ApiError(ApiErrorType.SERVER_ERROR, message, error);
  }
  return new ApiError(ApiErrorType.CLIENT_ERROR, message, error);
}

/**
 * 全局事件名，业务侧可监听处理：
 * - `app:auth-required` —— 401/403，提示用户重新登录
 */
export const AUTH_REQUIRED_EVENT = 'app:auth-required';

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
      if (isDev) {
        console.log(`🌐 API请求: ${config.method?.toUpperCase()} ${config.url}`);
      }
      return config;
    },
    (error) => {
      if (isDev) {
        console.error('❌ API请求错误:', error);
      }
      return Promise.reject(normalizeAxiosError(error));
    }
  );

  // 响应拦截器
  client.interceptors.response.use(
    (response) => {
      if (isDev) {
        console.log(`✅ API响应: ${response.config.url} - ${response.status}`);
      }
      return response;
    },
    (error: AxiosError) => {
      const apiError = normalizeAxiosError(error);

      if (isDev) {
        console.error(
          `❌ API响应错误 [${apiError.type}]: ${error.config?.url}`,
          apiError.message
        );
      }

      // 401/403 抛出全局事件，业务可在 App 顶层监听
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent(AUTH_REQUIRED_EVENT, {
              detail: { status, url: error.config?.url },
            })
          );
        }
      }

      return Promise.reject(apiError);
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

// 创建并导出默认API客户端实例
import { DATA_SOURCE_CONFIG } from '@/config/dataSource';
export const apiClient = createApiClient(DATA_SOURCE_CONFIG.api.baseURL);
