/**
 * 统一数据客户端
 * 在这里统一处理所有的错误处理、重试、熔断和降级策略
 * 所有DataClient都通过这个统一入口，无需单独修改每个文件
 */

import { getDataSourceMode } from '@/config/dataSource';
import { fallbackManager } from './fallbackManager';
import { ApiErrorType } from './enhancedApiClient';

/**
 * 统一数据获取函数类型
 */
type DataFetcher<TArgs extends any[], TReturn> = (...args: TArgs) => Promise<TReturn>;
type SyncDataFetcher<TArgs extends any[], TReturn> = (...args: TArgs) => TReturn;

/**
 * 统一的异步数据获取器
 * 自动处理数据源选择、错误处理、重试和降级策略
 */
export function createUnifiedAsyncFetcher<TArgs extends any[], TReturn>(
  apiFetcher: DataFetcher<TArgs, TReturn>,
  mockFetcher: DataFetcher<TArgs, TReturn>,
  operationName: string = '数据获取'
): DataFetcher<TArgs, TReturn> {
  return async (...args: TArgs): Promise<TReturn> => {
    const dataSourceMode = getDataSourceMode();
    
    if (dataSourceMode === 'mock') {
      // Mock模式直接调用Mock函数
      return mockFetcher(...args);
    }
    
    // API模式使用降级策略
    return fallbackManager.executeWithFallback(
      () => apiFetcher(...args),
      () => mockFetcher(...args),
      operationName
    );
  };
}

/**
 * 统一的同步数据获取器
 * 主要用于getRoleTypes、getFactions等同步函数
 */
export function createUnifiedSyncFetcher<TArgs extends any[], TReturn>(
  apiFetcher: SyncDataFetcher<TArgs, TReturn>,
  mockFetcher: SyncDataFetcher<TArgs, TReturn>,
  operationName: string = '同步数据获取'
): SyncDataFetcher<TArgs, TReturn> {
  return (...args: TArgs): TReturn => {
    const dataSourceMode = getDataSourceMode();
    
    if (dataSourceMode === 'mock') {
      return mockFetcher(...args);
    }
    
    // API模式，对于同步函数，简单的try-catch降级
    try {
      return apiFetcher(...args);
    } catch (error) {
      console.warn(`⚠️ ${operationName} API调用失败，降级到Mock数据:`, error);
      return mockFetcher(...args);
    }
  };
}

/**
 * 批量创建统一数据获取器的工具函数
 */
export function createUnifiedDataClient<T extends Record<string, any>>(
  apiService: T,
  mockService: T,
  serviceConfig: {
    serviceName: string;
    asyncFunctions: string[];
    syncFunctions?: string[];
  }
): T {
  const { serviceName, asyncFunctions, syncFunctions = [] } = serviceConfig;
  const unifiedService = {} as any;
  
  // 处理异步函数
  asyncFunctions.forEach(funcName => {
    if (apiService[funcName] && mockService[funcName]) {
      const operationName = `${serviceName}.${funcName}`;
      unifiedService[funcName] = createUnifiedAsyncFetcher(
        apiService[funcName].bind(apiService),
        mockService[funcName].bind(mockService),
        operationName
      );
    } else {
      console.warn(`⚠️ 函数 ${funcName} 在 ${serviceName} 的API或Mock服务中不存在`);
    }
  });
  
  // 处理同步函数
  syncFunctions.forEach(funcName => {
    if (apiService[funcName] && mockService[funcName]) {
      const operationName = `${serviceName}.${funcName}`;
      unifiedService[funcName] = createUnifiedSyncFetcher(
        apiService[funcName].bind(apiService),
        mockService[funcName].bind(mockService),
        operationName
      );
    } else {
      console.warn(`⚠️ 同步函数 ${funcName} 在 ${serviceName} 的API或Mock服务中不存在`);
    }
  });
  
  return unifiedService as T;
}

/**
 * 预定义的服务配置
 * 在这里统一配置所有服务的函数列表
 */
export const SERVICE_CONFIGS = {
  tangFigure: {
    serviceName: '唐朝人物',
    asyncFunctions: ['getTangFigures', 'getTangFigureById'],
    syncFunctions: ['getRoleTypes', 'getFactions']
  },
  sanguoFigure: {
    serviceName: '三国人物',
    asyncFunctions: ['getSanguoFigures', 'getSanguoFigureById'],
    syncFunctions: ['getRoleTypes', 'getKingdoms']
  },
  songFigure: {
    serviceName: '宋朝人物',
    asyncFunctions: ['getSongFigures', 'getSongFigureById'],
    syncFunctions: ['getRoleTypes', 'getFactions']
  },
  mingFigure: {
    serviceName: '明朝人物',
    asyncFunctions: ['getMingFigures', 'getMingFigureById'],
    syncFunctions: ['getRoleTypes', 'getFactions']
  },
  yuanFigure: {
    serviceName: '元朝人物',
    asyncFunctions: ['getYuanFigures', 'getYuanFigureById'],
    syncFunctions: ['getRoleTypes', 'getFactions']
  },
  qingRuler: {
    serviceName: '清朝统治者',
    asyncFunctions: ['getQingRulers', 'getQingRulerById'],
    syncFunctions: []
  },
  emperor: {
    serviceName: '皇帝',
    asyncFunctions: ['getEmperors', 'getEmperorById'],
    syncFunctions: ['getDynasties']
  },
  scholar: {
    serviceName: '学者',
    asyncFunctions: ['getScholars', 'getScholarById'],
    syncFunctions: []
  },
  schools: {
    serviceName: '思想流派',
    asyncFunctions: ['getSchools', 'getSchoolById'],
    syncFunctions: []
  }
};

/**
 * 快速创建统一数据客户端的辅助函数
 */
export function createServiceDataClient<T extends Record<string, any>>(
  serviceName: keyof typeof SERVICE_CONFIGS,
  apiService: T,
  mockService: T
): T {
  const config = SERVICE_CONFIGS[serviceName];
  if (!config) {
    throw new Error(`未找到服务配置: ${serviceName}`);
  }
  
  return createUnifiedDataClient(apiService, mockService, config);
}

/**
 * 全局错误处理配置
 * 可以在这里统一调整所有服务的错误处理行为
 */
export const GLOBAL_ERROR_CONFIG = {
  // 重试配置
  retry: {
    maxRetries: 3,
    retryDelay: 1000,
    enableExponentialBackoff: true,
  },
  
  // 熔断器配置
  circuitBreaker: {
    failureThreshold: 5,
    recoveryTimeout: 30000,
    monitoringPeriod: 60000,
  },
  
  // 降级策略配置
  fallback: {
    enableAutoFallback: true,
    fallbackThreshold: 3,
    fallbackDuration: 5 * 60 * 1000, // 5分钟
    excludeErrorTypes: [ApiErrorType.CLIENT_ERROR],
  },
  
  // 日志配置
  logging: {
    enableDetailedLogs: true,
    logLevel: 'info' as 'debug' | 'info' | 'warn' | 'error',
  }
};

/**
 * 更新全局配置
 */
export function updateGlobalErrorConfig(newConfig: Partial<typeof GLOBAL_ERROR_CONFIG>) {
  Object.assign(GLOBAL_ERROR_CONFIG, newConfig);
  
  // 更新降级管理器配置
  if (newConfig.fallback) {
    fallbackManager.updateConfig(newConfig.fallback);
  }
  
  console.log('🔧 全局错误处理配置已更新:', GLOBAL_ERROR_CONFIG);
}