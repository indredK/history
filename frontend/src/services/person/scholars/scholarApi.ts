import type { Scholar, ScholarMutationInput, LiteraryWork } from './types';
import { createUnifiedService } from '@/utils/services/serviceFactory';
import type { ScholarService } from './scholarService';
import { scholarServiceHelper } from './scholarService';
import { getDataSourceMode } from '@/config/dataSource';
import { apiClient, handleSingleApiResponse } from '@/utils/services/apiClient';

function isLiteraryWork(work: unknown): work is LiteraryWork {
  return Boolean(
    work &&
    typeof work === 'object' &&
    'title' in work &&
    'description' in work,
  );
}

/**
 * 转换JSON数据为Scholar类型
 */
const transformJsonToScholar = (jsonData: any, index: number): Scholar => {
  const representativeSource = Array.isArray(jsonData.representativeWorks)
    ? jsonData.representativeWorks
    : [];
  const majorSource = Array.isArray(jsonData.majorWorks)
    ? jsonData.majorWorks
    : [];
  const works = representativeSource.length > 0
    ? [...representativeSource, ...majorSource.filter((work) => !isLiteraryWork(work))]
    : majorSource;

  const scholar: Scholar = {
    id: jsonData.id || `scholar_${jsonData.name?.replace(/\s+/g, '_') || `unknown_${index}`}`,
    name: jsonData.name || '',
    name_en: jsonData.name_en || jsonData.nameEn || '',
    dynasty: jsonData.dynasty?.name || jsonData.dynasty || '',
    dynastyPeriod: jsonData.dynastyPeriod || '',
    birthYear: jsonData.birthYear ?? null,
    deathYear: jsonData.deathYear ?? null,
    schoolOfThought: jsonData.schoolOfThought || '',
    philosophicalSchoolId: jsonData.philosophicalSchoolId || '',
    biography: jsonData.biography || '',
    portraitUrl: jsonData.portraitUrl || null,
    achievements: jsonData.achievements || jsonData.contributions || [],
    contributions: jsonData.contributions || [],
    representativeWorks: works.filter(isLiteraryWork),
    majorWorks: works.filter((work) => !isLiteraryWork(work)),
    sources: jsonData.sources || [],
  };

  if (jsonData.createdAt) {
    scholar.createdAt = new Date(jsonData.createdAt);
  }
  if (jsonData.updatedAt) {
    scholar.updatedAt = new Date(jsonData.updatedAt);
  }

  return scholar;
};

async function mutateScholar(
  method: 'post' | 'put' | 'delete',
  idOrPayload?: string | ScholarMutationInput,
  payload?: Partial<ScholarMutationInput>,
): Promise<{ data: Scholar | null }> {
  if (getDataSourceMode() === 'mock') {
    if (method === 'delete') {
      return { data: null };
    }

    const id = typeof idOrPayload === 'string' ? idOrPayload : undefined;
    const input = (typeof idOrPayload === 'string' ? payload : idOrPayload) || {};
    return {
      data: transformJsonToScholar(
        {
          ...input,
          id: id || input.id || `scholar_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        0,
      ),
    };
  }

  const endpoint = method === 'post' ? '/scholars' : `/scholars/${String(idOrPayload)}`;
  const response = method === 'delete'
    ? await apiClient.delete(endpoint)
    : method === 'post'
      ? await apiClient.post(endpoint, idOrPayload)
      : await apiClient.put(endpoint, payload);
  const apiResponse = handleSingleApiResponse<unknown>(response);

  return {
    data: apiResponse.data ? transformJsonToScholar(apiResponse.data, 0) : null,
  };
}

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
  createScholar: (input: ScholarMutationInput) =>
    mutateScholar('post', input) as Promise<{ data: Scholar }>,
  updateScholar: (id: string, input: Partial<ScholarMutationInput>) =>
    mutateScholar('put', id, input) as Promise<{ data: Scholar }>,
  deleteScholar: (id: string) => mutateScholar('delete', id),
  
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
export const createScholar = (input: ScholarMutationInput) =>
  scholarService.createScholar(input);
export const updateScholar = (
  id: string,
  input: Partial<ScholarMutationInput>,
) => scholarService.updateScholar(id, input);
export const deleteScholar = (id: string) => scholarService.deleteScholar(id);

// 导出类型
export type { ScholarService } from './scholarService';
