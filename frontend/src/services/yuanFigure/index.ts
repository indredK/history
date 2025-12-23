export * from './types';
export * from './yuanFigureMock';
export { yuanFigureService, type YuanFigureSortBy } from './yuanFigureService';

// 只导出数据客户端的函数，避免命名冲突
export { 
  getYuanFigures,
  getYuanFigureById,
  getRoleTypes,
  getFactions
} from './yuanFigureDataClient';
