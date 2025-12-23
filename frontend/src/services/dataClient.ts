import { getDataSourceMode } from '@/config/dataSource';
import { apiService } from './apiService';
import { mockService } from './mockService';

// 🎯 数据源选择器 - 根据配置自动选择数据源
const provider = getDataSourceMode() === 'mock'
  ? mockService
  : apiService;

// 导出统一的数据接口
export const getPersons = provider.getPersons;
export const getPerson = provider.getPerson;
export const getEvents = provider.getEvents;
export const getPlaces = provider.getPlaces;
export const getDynasties = provider.getDynasties;

// 导出数据源信息（用于调试）
export { getDataSourceInfo } from '@/config/dataSource';
