// 导出学者服务
export * from './types';
export * from './scholarMock';
export { scholarService, type ScholarSortBy, type ScholarService } from './scholarService';

// 导出数据客户端函数
export { 
  getScholars,
  getScholarById
} from './scholarDataClient';