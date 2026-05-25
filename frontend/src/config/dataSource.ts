/**
 * 数据源配置
 *
 * 数据源由环境变量 VITE_DATA_SOURCE 控制（mock | api | json）。
 * 在 frontend/.env 或 frontend/.env.production 中修改后重启 dev server 生效。
 *  - mock / json → 使用模拟数据
 *  - api         → 使用真实后端 API
 */

// 数据源类型定义
export type DataSourceMode = 'mock' | 'api';

const rawMode = (import.meta.env.VITE_DATA_SOURCE || 'mock').toString().toLowerCase();

/**
 * 当前数据源模式（兼容旧代码的二值表示：0=mock, 1=api）
 */
export const DATA_SOURCE_MODE: 0 | 1 = rawMode === 'api' ? 1 : 0;

/**
 * 获取当前数据源模式
 * @returns 'mock' | 'api'
 */
export function getDataSourceMode(): DataSourceMode {
  return DATA_SOURCE_MODE === 1 ? 'api' : 'mock';
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
    rawMode,
    config,
    description: mode === 'mock' ? '🎭 使用模拟数据' : '🌐 使用真实API',
  };
}

// 开发环境下打印数据源信息
if (import.meta.env.DEV) {
  const info = getDataSourceInfo();
  console.log(`📊 数据源模式: ${info.description}`, info);
}
