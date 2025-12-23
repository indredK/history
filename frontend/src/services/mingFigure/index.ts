export * from './types';
export * from './mingFigureMock';
export { mingFigureService, type MingFigureSortBy } from './mingFigureService';

// 只导出数据客户端的函数，避免命名冲突
export { 
  getMingFigures,
  getMingFigureById,
  getRoleTypes,
  getFactions
} from './mingFigureDataClient';
