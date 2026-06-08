import type { SchoolsService } from './schoolService';
import { createUnifiedService } from '../base/serviceFactory';
import type {
  PhilosophicalSchool,
  PhilosophicalSchoolMutationInput,
} from './types';
import { getDataSourceMode } from '@/config/dataSource';
import { apiClient, handleSingleApiResponse } from '@/utils/services/apiClient';

// 数据转换器
function transformJsonToSchool(jsonSchool: any): PhilosophicalSchool {
  const school: PhilosophicalSchool = {
    id: jsonSchool.id || `school_${Date.now()}`,
    name: jsonSchool.name || '',
    name_en: jsonSchool.name_en || jsonSchool.nameEn || '',
    founder: jsonSchool.founder || '',
    founderEn: jsonSchool.founderEn || '',
    foundingYear: jsonSchool.foundingYear ?? null,
    foundingPeriod: jsonSchool.foundingPeriod || '',
    coreBeliefs: jsonSchool.coreBeliefs || [],
    keyTexts: jsonSchool.keyTexts || [],
    representativeFigures: jsonSchool.representativeFigures || [],
    classicWorks: jsonSchool.classicWorks || [],
    description: jsonSchool.description || '',
    influence: jsonSchool.influence || '',
    color: jsonSchool.color || '',
    sources: jsonSchool.sources || [],
  };

  if (jsonSchool.createdAt) {
    school.createdAt = new Date(jsonSchool.createdAt);
  }
  if (jsonSchool.updatedAt) {
    school.updatedAt = new Date(jsonSchool.updatedAt);
  }

  return school;
}

async function mutateSchool(
  method: 'post' | 'put' | 'delete',
  idOrPayload?: string | PhilosophicalSchoolMutationInput,
  payload?: Partial<PhilosophicalSchoolMutationInput>,
): Promise<{ data: PhilosophicalSchool | null }> {
  if (getDataSourceMode() === 'mock') {
    if (method === 'delete') {
      return { data: null };
    }

    const id = typeof idOrPayload === 'string' ? idOrPayload : undefined;
    const input = (typeof idOrPayload === 'string' ? payload : idOrPayload) || {};
    return {
      data: transformJsonToSchool({
        ...input,
        id: id || input.id || `school_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    };
  }

  const endpoint = method === 'post' ? '/schools' : `/schools/${String(idOrPayload)}`;
  const response = method === 'delete'
    ? await apiClient.delete(endpoint)
    : method === 'post'
      ? await apiClient.post(endpoint, idOrPayload)
      : await apiClient.put(endpoint, payload);
  const apiResponse = handleSingleApiResponse<unknown>(response);

  return {
    data: apiResponse.data ? transformJsonToSchool(apiResponse.data) : null,
  };
}

// 创建统一服务
const unifiedService = createUnifiedService<PhilosophicalSchool>(
  '/schools',
  '/data/json/schools.json',
  transformJsonToSchool,
  { hasGetById: true }
);

// 实现学派服务
export const schoolsApi: SchoolsService = {
  ...unifiedService,
  getSchools: () => unifiedService.getAll(),
  getSchool: (id: string) => unifiedService.getById!(id),
  createSchool: (input: PhilosophicalSchoolMutationInput) =>
    mutateSchool('post', input) as Promise<{ data: PhilosophicalSchool }>,
  updateSchool: (
    id: string,
    input: Partial<PhilosophicalSchoolMutationInput>,
  ) => mutateSchool('put', id, input) as Promise<{ data: PhilosophicalSchool }>,
  deleteSchool: (id: string) => mutateSchool('delete', id),
};

// 保持向后兼容的导出
export const getSchools = () => schoolsApi.getSchools();
export const getSchoolById = (id: string) => schoolsApi.getSchool(id);
export const createSchool = (input: PhilosophicalSchoolMutationInput) =>
  schoolsApi.createSchool(input);
export const updateSchool = (
  id: string,
  input: Partial<PhilosophicalSchoolMutationInput>,
) => schoolsApi.updateSchool(id, input);
export const deleteSchool = (id: string) => schoolsApi.deleteSchool(id);
