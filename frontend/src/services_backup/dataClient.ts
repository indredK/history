import type { ServiceInterface } from './apiService';
import { getDataSourceMode } from '@/config/dataSource';
import { apiService } from './apiService';
import { mockService } from './mockService';

export const getService = (): ServiceInterface => {
  return getDataSourceMode() === 'mock' ? mockService : apiService;
};

export const dataClient = getService();

// 导出单独的方法以保持兼容性
export const getEvents = () => dataClient.getEvents();
export const getPlaces = () => dataClient.getPlaces();
export const getPersons = () => dataClient.getPersons();
export const getPerson = (id: string) => dataClient.getPerson(id);
export const getDynasties = () => dataClient.getDynasties();
