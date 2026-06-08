/**
 * 神话服务模块导出
 * Mythology Service Module Exports
 */

// 类型导出
export type { 
  Mythology, 
  MythologyInput,
  MythologyCategory, 
  MythologyState, 
  MythologyActions,
  MythologyStore 
} from './types';

export { VALID_CATEGORIES } from './types';

// 服务函数导出
export { 
  validateMythology, 
  getMythologies, 
  createMythology,
  updateMythology,
  deleteMythology,
  filterByCategory,
} from './mythologyService';

// API 导出
export { 
  fetchMythologies, 
  fetchMythologyById, 
  mythologyApi,
} from './mythologyApi';
