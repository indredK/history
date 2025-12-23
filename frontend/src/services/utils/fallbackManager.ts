/**
 * 降级策略管理器
 * 当API请求失败时自动降级到Mock数据
 */

import { ApiError, ApiErrorType } from './enhancedApiClient';

/**
 * 降级策略配置
 */
interface FallbackConfig {
  enableAutoFallback: boolean;     // 是否启用自动降级
  fallbackThreshold: number;       // 降级阈值（连续失败次数）
  fallbackDuration: number;        // 降级持续时间（毫秒）
  excludeErrorTypes?: ApiErrorType[]; // 排除的错误类型（这些错误不触发降级）
}

/**
 * 降级状态
 */
interface FallbackState {
  isActive: boolean;
  activatedAt: number;
  failureCount: number;
  lastError?: ApiError;
}

/**
 * 降级策略管理器
 */
class FallbackManager {
  private state: FallbackState = {
    isActive: false,
    activatedAt: 0,
    failureCount: 0,
  };

  private config: FallbackConfig = {
    enableAutoFallback: true,
    fallbackThreshold: 3,
    fallbackDuration: 5 * 60 * 1000, // 5分钟
    excludeErrorTypes: [ApiErrorType.CLIENT_ERROR], // 4xx错误不触发降级
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
      return this.executeFallback(fallbackOperation, operationName);
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

  /**
   * 处理API错误
   */
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

    // 检查是否应该触发降级
    if (this.shouldTriggerFallback(apiError)) {
      this.onFailure(apiError);
      
      if (this.shouldActivateFallback()) {
        console.warn(`⚠️ ${operationName}: 触发自动降级策略`);
        this.activateFallback();
      }
    }

    // 如果启用了自动降级且满足条件，使用降级策略
    if (this.config.enableAutoFallback && this.shouldUseFallback()) {
      console.log(`🎭 ${operationName}: 使用降级策略（Mock数据）`);
      return this.executeFallback(fallbackOperation, operationName);
    }

    // 否则抛出原始错误
    throw apiError;
  }

  /**
   * 执行降级操作
   */
  private async executeFallback<T>(
    fallbackOperation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    try {
      return await fallbackOperation();
    } catch (fallbackError) {
      console.error(`❌ ${operationName} 降级操作也失败:`, fallbackError);
      const errorMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
      throw new ApiError(
        ApiErrorType.NETWORK_ERROR,
        `API和降级策略都失败: ${errorMessage}`,
        fallbackError
      );
    }
  }

  /**
   * 检查是否应该使用降级策略
   */
  private shouldUseFallback(): boolean {
    if (!this.config.enableAutoFallback || !this.state.isActive) {
      return false;
    }

    // 检查降级是否已过期
    const now = Date.now();
    if (now - this.state.activatedAt > this.config.fallbackDuration) {
      this.deactivateFallback();
      return false;
    }

    return true;
  }

  /**
   * 检查是否应该触发降级
   */
  private shouldTriggerFallback(error: ApiError): boolean {
    if (!this.config.enableAutoFallback) {
      return false;
    }

    // 排除特定错误类型
    if (this.config.excludeErrorTypes?.includes(error.type)) {
      return false;
    }

    return true;
  }

  /**
   * 检查是否应该激活降级
   */
  private shouldActivateFallback(): boolean {
    return this.state.failureCount >= this.config.fallbackThreshold;
  }

  /**
   * 激活降级策略
   */
  private activateFallback(): void {
    this.state.isActive = true;
    this.state.activatedAt = Date.now();
    console.warn('🎭 自动降级策略已激活，将使用Mock数据');
  }

  /**
   * 停用降级策略
   */
  private deactivateFallback(): void {
    this.state.isActive = false;
    this.state.activatedAt = 0;
    this.state.failureCount = 0;
    console.log('✅ 自动降级策略已停用，恢复API请求');
  }

  /**
   * 成功回调
   */
  private onSuccess(): void {
    if (this.state.failureCount > 0) {
      console.log('✅ API请求恢复正常');
    }
    this.state.failureCount = 0;
    this.state.lastError = undefined as any;
  }

  /**
   * 失败回调
   */
  private onFailure(error: ApiError): void {
    this.state.failureCount++;
    this.state.lastError = error;
    console.log(`⚠️ API失败计数: ${this.state.failureCount}/${this.config.fallbackThreshold}`);
  }

  /**
   * 获取当前状态
   */
  getState(): FallbackState & { config: FallbackConfig } {
    return {
      ...this.state,
      config: { ...this.config },
    };
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<FallbackConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('🔧 降级策略配置已更新:', this.config);
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

  /**
   * 重置状态
   */
  reset(): void {
    this.state = {
      isActive: false,
      activatedAt: 0,
      failureCount: 0,
    };
    console.log('🔄 降级策略状态已重置');
  }
}

// 全局降级管理器实例
const fallbackManager = new FallbackManager();

export { fallbackManager, FallbackManager, type FallbackConfig, type FallbackState };