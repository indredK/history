export * from './types';
export * from './emperorMock';
export { emperorService, type EmperorSortBy } from './emperorService';

// 只导出数据客户端的函数，避免命名冲突
export { 
  getEmperors,
  getEmperorById,
  getDynasties
} from './emperorDataClient';
