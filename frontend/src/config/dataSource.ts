/**
 * 数据源配置开关
 * 
 * 🔧 使用方法：
 * - 将 DATA_SOURCE_MODE 改为 0 使用模拟数据
 * - 将 DATA_SOURCE_MODE 改为 1 使用真实API
 * 
 * 这是唯一需要修改的地方！
 */

// 🎯 数据源开关：0=模拟数据，1=真实API
export const DATA_SOURCE_MODE: 0 | 1 = 1

// 数据源类型定义
export type DataSourceMode = 'mock' | 'api';

/**
 * 获取当前数据源模式
 * @returns 'mock' | 'api'
 */
export function getDataSourceMode(): DataSourceMode {
  // 优先使用代码开关
  if (DATA_SOURCE_MODE === 1) {
    return 'api';
  }
  
  // 默认使用模拟数据
  return 'mock';
}

/**
 * 数据源配置
 */
export const DATA_SOURCE_CONFIG = {
  // API配置
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1',
    timeout: 10000,
  },
  
  // Mock配置
  mock: {
    delay: 800, // 模拟网络延迟（毫秒）
    errorRate: Number(import.meta.env.VITE_MOCK_ERROR_RATE) || 0,
  }
};

/**
 * 获取当前数据源信息（用于调试）
 */
export function getDataSourceInfo() {
  const mode = getDataSourceMode();
  const config = DATA_SOURCE_CONFIG[mode];
  
  return {
    mode,
    config,
    description: mode === 'mock' ? '🎭 使用模拟数据' : '🌐 使用真实API',
  };
}

// 开发环境下打印数据源信息
if (import.meta.env.DEV) {
  const info = getDataSourceInfo();
  console.log(`📊 数据源模式: ${info.description}`, info);
}