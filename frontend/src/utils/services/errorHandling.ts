/**
 * 统一的错误处理工具
 * 从 services/utils 迁移到 utils/services
 */

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
 * 降级策略配置
 */
export interface FallbackConfig {
  enableAutoFallback: boolean;
  fallbackThreshold: number;
  fallbackDuration: number;
  excludeErrorTypes?: ApiErrorType[];
}

/**
 * 降级状态
 */
export interface FallbackState {
  isActive: boolean;
  activatedAt: number;
  failureCount: number;
  lastError?: ApiError;
}

/**
 * 简化的降级管理器
 */
export class SimpleFallbackManager {
  private state: FallbackState = {
    isActive: false,
    activatedAt: 0,
    failureCount: 0,
  };

  private config: FallbackConfig = {
    enableAutoFallback: true,
    fallbackThreshold: 3,
    fallbackDuration: 5 * 60 * 1000, // 5分钟
    excludeErrorTypes: [ApiErrorType.CLIENT_ERROR],
  };

  /**
   * 执行带降级策略的操作
   */
  async executeWithFallback<T>(
    apiOperation: () => Promise<T>,
    fallbackOperation: () => Promise<T>,
    operationName: string = 'API操作'
  ): Promise<T> {
    // 检查是否在降级状态
    if (this.shouldUseFallback()) {
      console.log(`🎭 ${operationName}: 使用降级策略（Mock数据）`);
      return fallbackOperation();
    }

    // 尝试执行API操作
    try {
      const result = await apiOperation();
      this.onSuccess();
      return result;
    } catch (error) {
      return this.handleApiError(error, fallbackOperation, operationName);
    }
  }

  private async handleApiError<T>(
    error: any,
    fallbackOperation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    const apiError = error instanceof ApiError ? error : new ApiError(
      ApiErrorType.NETWORK_ERROR,
      error.message || '未知错误',
      error
    );

    console.error(`❌ ${operationName} API请求失败:`, apiError.message);

    if (this.shouldTriggerFallback(apiError)) {
      this.onFailure(apiError);
      
      if (this.shouldActivateFallback()) {
        console.warn(`⚠️ ${operationName}: 触发自动降级策略`);
        this.activateFallback();
      }
    }

    if (this.config.enableAutoFallback && this.shouldUseFallback()) {
      console.log(`🎭 ${operationName}: 使用降级策略（Mock数据）`);
      return fallbackOperation();
    }

    throw apiError;
  }

  private shouldUseFallback(): boolean {
    if (!this.config.enableAutoFallback || !this.state.isActive) {
      return false;
    }

    const now = Date.now();
    if (now - this.state.activatedAt > this.config.fallbackDuration) {
      this.deactivateFallback();
      return false;
    }

    return true;
  }

  private shouldTriggerFallback(error: ApiError): boolean {
    if (!this.config.enableAutoFallback) {
      return false;
    }

    return !this.config.excludeErrorTypes?.includes(error.type);
  }

  private shouldActivateFallback(): boolean {
    return this.state.failureCount >= this.config.fallbackThreshold;
  }

  private activateFallback(): void {
    this.state.isActive = true;
    this.state.activatedAt = Date.now();
    console.warn('🎭 自动降级策略已激活，将使用Mock数据');
  }

  private deactivateFallback(): void {
    this.state.isActive = false;
    this.state.activatedAt = 0;
    this.state.failureCount = 0;
    console.log('✅ 自动降级策略已停用，恢复API请求');
  }

  private onSuccess(): void {
    if (this.state.failureCount > 0) {
      console.log('✅ API请求恢复正常');
    }
    this.state.failureCount = 0;
    delete this.state.lastError;
  }

  private onFailure(error: ApiError): void {
    this.state.failureCount++;
    this.state.lastError = error;
    console.log(`⚠️ API失败计数: ${this.state.failureCount}/${this.config.fallbackThreshold}`);
  }

  getState(): FallbackState & { config: FallbackConfig } {
    return {
      ...this.state,
      config: { ...this.config },
    };
  }

  updateConfig(newConfig: Partial<FallbackConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  reset(): void {
    this.state = {
      isActive: false,
      activatedAt: 0,
      failureCount: 0,
    };
  }

  /**
   * 手动激活降级
   */
  manualActivate(): void {
    this.activateFallback();
  }

  /**
   * 手动停用降级
   */
  manualDeactivate(): void {
    this.deactivateFallback();
  }
}

// 全局降级管理器实例
export const fallbackManager = new SimpleFallbackManager();

/**
 * 重试函数
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError!;
}