export * from './types';
export * from './emperorService';

// 只导出数据客户端的函数，避免命名冲突
export { 
  getEmperors,
  getEmperorById,
  getDynasties
} from '../../emperor/emperorDataClient';