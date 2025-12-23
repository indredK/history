export * from './types';
export * from './tangFigureMock';
export { tangFigureService, type TangFigureSortBy } from './tangFigureService';

// 只导出数据客户端的函数，避免命名冲突
export { 
  getTangFigures,
  getTangFigureById,
  getRoleTypes,
  getFactions
} from './tangFigureDataClient';
