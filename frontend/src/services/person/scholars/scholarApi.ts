import type { Scholar } from './types';
import { createUnifiedService } from '@/utils/services/serviceFactory';
import type { ScholarService } from './scholarService';
import { scholarServiceHelper } from './scholarService';

/**
 * 转换JSON数据为Scholar类型
 */
const transformJsonToScholar = (jsonData: any, index: number): Scholar => {
  return {
    id: jsonData.id || `scholar_${jsonData.name?.replace(/\s+/g, '_') || `unknown_${index}`}`,
    name: jsonData.name || '',
    name_en: jsonData.name_en || jsonData.nameEn || '',
    dynasty: jsonData.dynasty?.name || jsonData.dynasty || '',
    dynastyPeriod: jsonData.dynastyPeriod || '',
    birthYear: jsonData.birthYear || 0,
    deathYear: jsonData.deathYear || 0,
    schoolOfThought: jsonData.schoolOfThought || '',
    philosophicalSchoolId: jsonData.philosophicalSchoolId || '',
    biography: jsonData.biography || '',
    portraitUrl: jsonData.portraitUrl,
    achievements: jsonData.achievements || [],
    contributions: jsonData.contributions || [],
    representativeWorks: jsonData.majorWorks || jsonData.representativeWorks || [],
    createdAt: jsonData.createdAt ? new Date(jsonData.createdAt) : undefined,
    updatedAt: jsonData.updatedAt ? new Date(jsonData.updatedAt) : undefined
  };
};

// 创建统一服务
const unifiedService = createUnifiedService<Scholar>(
  '/scholars',
  '/data/json/scholars.json',
  transformJsonToScholar,
  { hasGetById: true }
);

/**
 * 实现学者服务
 */
export const scholarService: ScholarService = {
  ...unifiedService,
  getAll: () => unifiedService.getAll(),
  getById: (id: string) => unifiedService.getById!(id),
  
  // 数据处理方法（代理到辅助类）
  filterByDynasty: scholarServiceHelper.filterByDynasty,
  filterBySchool: scholarServiceHelper.filterBySchool,
  searchScholars: scholarServiceHelper.searchScholars,
  sortScholars: scholarServiceHelper.sortScholars,
  filterAndSort: scholarServiceHelper.filterAndSort
};

// 保持向后兼容的导出
export const getScholars = () => scholarService.getAll();
export const getScholarById = (id: string) => scholarService.getById!(id);

// 导出类型
export type { ScholarService } from './scholarService';
