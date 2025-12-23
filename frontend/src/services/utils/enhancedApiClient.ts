/**
 * 增强的API客户端
 * 包含重试机制、熔断器和降级策略
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * 重试配置
 */
interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryCondition?: (error: any) => boolean;
}

/**
 * 熔断器状态
 */
enum CircuitBreakerState {
  CLOSED = 'CLOSED',     // 正常状态
  OPEN = 'OPEN',         // 熔断状态
  HALF_OPEN = 'HALF_OPEN' // 半开状态
}

/**
 * 熔断器配置
 */
interface CircuitBreakerConfig {
  failureThreshold: number;    // 失败阈值
  recoveryTimeout: number;     // 恢复超时时间
  monitoringPeriod: number;    // 监控周期
}

/**
 * 熔断器类
 */
class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private successCount: number = 0;

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      if (Date.now() - this.lastFailureTime > this.config.recoveryTimeout) {
        this.state = CircuitBreakerState.HALF_OPEN;
        this.successCount = 0;
        console.log('🔄 熔断器进入半开状态');
      } else {
        throw new Error('熔断器已开启，请求被拒绝');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= 3) { // 连续3次成功后关闭熔断器
        this.state = CircuitBreakerState.CLOSED;
        console.log('✅ 熔断器已关闭，恢复正常');
      }
    }
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitBreakerState.OPEN;
      console.log('🚫 熔断器已开启，停止请求');
    }
  }

  getState(): CircuitBreakerState {
    return this.state;
  }
}

/**
 * API错误类型
 */
export enum ApiErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  CLIENT_ERROR = 'CLIENT_ERROR',
  CIRCUIT_BREAKER_OPEN = 'CIRCUIT_BREAKER_OPEN'
}

/**
 * API错误类
 */
export class ApiError extends Error {
  constructor(
    public type: ApiErrorType,
    message: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 增强的API客户端类
 */
class EnhancedApiClient {
  private client: AxiosInstance;
  private circuitBreaker: CircuitBreaker;
  private defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    retryCondition: (error) => {
      // 只对网络错误和5xx错误重试
      return !error.response || error.response.status >= 500;
    }
  };

  constructor(baseURL: string = '/api/v1') {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 初始化熔断器
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,      // 5次失败后熔断
      recoveryTimeout: 30000,   // 30秒后尝试恢复
      monitoringPeriod: 60000,  // 60秒监控周期
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        console.log(`🌐 API请求: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ API请求错误:', error);
        return Promise.reject(new ApiError(ApiErrorType.CLIENT_ERROR, '请求配置错误', error));
      }
    );

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ API响应: ${response.config.url} - ${response.status}`);
        return response;
      },
      (error) => {
        const apiError = this.transformError(error);
        console.error(`❌ API响应错误: ${error.config?.url}`, apiError.message);
        return Promise.reject(apiError);
      }
    );
  }

  private transformError(error: any): ApiError {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return new ApiError(ApiErrorType.TIMEOUT_ERROR, '请求超时', error);
    }

    if (!error.response) {
      return new ApiError(ApiErrorType.NETWORK_ERROR, '网络连接失败', error);
    }

    const status = error.response.status;
    if (status >= 500) {
      return new ApiError(ApiErrorType.SERVER_ERROR, `服务器错误 (${status})`, error);
    }

    if (status >= 400) {
      return new ApiError(ApiErrorType.CLIENT_ERROR, `客户端错误 (${status})`, error);
    }

    return new ApiError(ApiErrorType.NETWORK_ERROR, '未知错误', error);
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async retryRequest<T>(
    operation: () => Promise<T>,
    config: RetryConfig = this.defaultRetryConfig
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = config.retryDelay * Math.pow(2, attempt - 1); // 指数退避
          console.log(`🔄 第${attempt}次重试，等待${delay}ms...`);
          await this.sleep(delay);
        }

        return await operation();
      } catch (error) {
        lastError = error;
        
        // 如果是熔断器开启的错误，不重试
        if (error instanceof ApiError && error.type === ApiErrorType.CIRCUIT_BREAKER_OPEN) {
          break;
        }

        // 检查是否应该重试
        if (attempt < config.maxRetries && config.retryCondition?.(error)) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.log(`⚠️ 请求失败，准备重试: ${errorMessage}`);
          continue;
        }

        break;
      }
    }

    throw lastError;
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.circuitBreaker.execute(async () => {
      return this.retryRequest(() => this.client.get<T>(url, config));
    });
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.circuitBreaker.execute(async () => {
      return this.retryRequest(() => this.client.post<T>(url, data, config));
    });
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.circuitBreaker.execute(async () => {
      return this.retryRequest(() => this.client.put<T>(url, data, config));
    });
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.circuitBreaker.execute(async () => {
      return this.retryRequest(() => this.client.delete<T>(url, config));
    });
  }

  getCircuitBreakerState(): CircuitBreakerState {
    return this.circuitBreaker.getState();
  }
}

// 全局API客户端实例
let apiClientInstance: EnhancedApiClient | null = null;

/**
 * 创建增强的API客户端
 */
export const createEnhancedApiClient = (baseURL: string = '/api/v1'): EnhancedApiClient => {
  if (!apiClientInstance) {
    apiClientInstance = new EnhancedApiClient(baseURL);
  }
  return apiClientInstance;
};

/**
 * 获取API客户端状态
 */
export const getApiClientStatus = () => {
  if (!apiClientInstance) {
    return { circuitBreakerState: 'NOT_INITIALIZED' };
  }
  
  return {
    circuitBreakerState: apiClientInstance.getCircuitBreakerState(),
  };
};