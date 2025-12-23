export * from './types';
export * from './sanguoFigureMock';
export { sanguoFigureService, type SanguoFigureSortBy } from './sanguoFigureService';

// 只导出数据客户端的函数，避免命名冲突
export { 
  getSanguoFigures,
  getSanguoFigureById,
  getRoleTypes,
  getKingdoms
} from './sanguoFigureDataClient';
