export * from './types';

// 导入并重新导出 mingFigureApi
export { mingFigureApi, getMingFigures, getMingFigureById, getRoleTypes, getFactions } from './mingFigureApi';

// 导入并重新导出 mingFigureService 相关类型和辅助函数
export { type MingFigureService, type MingFigureSortBy, mingFigureServiceHelper } from './mingFigureService';

// 保持向后兼容的导出
export { mingFigureApi as mingFigureService } from './mingFigureApi';
