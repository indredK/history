export * from './types';
export * from './emperorService';
export { emperorApi, getEmperors, getEmperorById, getDynasties } from './emperorApi';

// 从 emperorService 中导入 emperorServiceHelper
import { emperorServiceHelper } from './emperorService';

// 保持向后兼容的导出
export { emperorServiceHelper as emperorService };