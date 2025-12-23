/**
 * 神话服务模块导出
 * Mythology Service Module Exports
 */

// 类型导出
export type { 
  Mythology, 
  MythologyCategory, 
  MythologyState, 
  MythologyActions,
  MythologyStore 
} from './types';

export { VALID_CATEGORIES } from './types';

// 服务函数导出
export { 
  validateMythology,
  isValidCategory,
  filterByCategory,
  getMythologies,
  getMythologyById,
  getAllCategories
} from './mythologyService';

export type { ValidationResult } from './mythologyService';

// API 导出
export { fetchMythologies, fetchMythologyById } from './mythologyApi';
export type { MythologyApiResponse } from './mythologyApi';

// 数据客户端导出
export * from './mythologyDataClient';

// Mock 数据导出（用于测试）
export { mockMythologies } from './mythologyMock';
