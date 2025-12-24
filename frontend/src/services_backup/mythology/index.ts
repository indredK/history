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
export { validateMythology, getMythologies, filterByCategory } from './mythologyService';

// API 导出
export { fetchMythologies, fetchMythologyById, mythologyApi } from './mythologyApi';

