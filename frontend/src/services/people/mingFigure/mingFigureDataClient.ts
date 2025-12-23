/**
 * MingFigure 统一数据客户端
 * 使用统一的错误处理、重试和降级策略
 * 
 * 🎯 统一配置：所有错误处理逻辑都在 unifiedDataClient.ts 中统一管理
 * 📝 无需修改：此文件使用统一配置，无需单独修改错误处理逻辑
 */

import { createServiceDataClient } from '../../utils/unifiedDataClient';
import * as mingFigureApi from './mingFigureApi';
import * as mingFigureMock from './mingFigureMock';

// 🎯 使用统一数据客户端创建服务
// 所有的错误处理、重试、熔断、降级策略都在统一配置中处理
const unifiedService = createServiceDataClient(
  'mingFigure',
  mingFigureApi,
  mingFigureMock
);

// 导出所有函数
export const {
  getMingFigures,
  getMingFigureById,
  getRoleTypes,
  getFactions
} = unifiedService;

/**
 * 🔧 配置说明：
 * 
 * 1. 错误处理：统一在 unifiedDataClient.ts 中配置
 * 2. 重试策略：最多3次，指数退避
 * 3. 熔断保护：连续5次失败后熔断30秒
 * 4. 自动降级：连续3次失败后切换到Mock数据
 * 5. 智能恢复：API恢复后自动切换回真实数据
 * 
 * 如需调整配置，请修改：
 * - frontend/src/services/utils/unifiedDataClient.ts (统一配置)
 * - frontend/src/services/utils/fallbackManager.ts (降级策略)
 * - frontend/src/services/utils/enhancedApiClient.ts (重试和熔断)
 */
