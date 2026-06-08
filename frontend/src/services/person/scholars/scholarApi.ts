import type { Scholar, ScholarMutationInput, LiteraryWork } from './types';
import { createUnifiedService } from '@/utils/services/serviceFactory';
import type { ScholarService } from './scholarService';
import { scholarServiceHelper } from './scholarService';
import { getDataSourceMode } from '@/config/dataSource';
import { apiClient, handleSingleApiResponse } from '@/utils/services/apiClient';
import {
  isRecord,
  readNumber,
  readOptionalString,
  readString,
  readStringArray,
} from '../common/figureTransform';

type RawScholarRecord = Record<string, unknown>;

function isLiteraryWork(work: unknown): work is LiteraryWork {
  return Boolean(
    work &&
    typeof work === 'object' &&
    'title' in work &&
  );
}

function readNullableNumber(record: RawScholarRecord, keys: string | string[]): number | null {
  const value = readNumber(record, keys, Number.NaN);
  return Number.isFinite(value) ? value : null;
}

function readDate(record: RawScholarRecord, keys: string | string[]): Date | undefined {
  const value = readOptionalString(record, keys);
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function readDynasty(record: RawScholarRecord): string {
  const dynasty = record.dynasty;
  if (isRecord(dynasty)) return readString(dynasty, 'name');
  return readString(record, 'dynasty');
}

function readStringArrayWithFallback(record: RawScholarRecord, keys: string[]): string[] {
  for (const key of keys) {
    const values = readStringArray(record, key);
    if (values.length > 0) return values;
  }
  return [];
}

function readWorks(value: unknown): Array<LiteraryWork | string> {
  if (!Array.isArray(value)) return [];
  return value.filter((work): work is LiteraryWork | string =>
    typeof work === 'string' || isLiteraryWork(work),
  );
}

/**
 * 转换JSON数据为Scholar类型
 */
const transformJsonToScholar = (jsonData: unknown, index: number): Scholar => {
  const record = isRecord(jsonData) ? jsonData : {};
  const name = readString(record, 'name');
  const representativeSource = readWorks(record.representativeWorks ?? record.representative_works);
  const majorSource = readWorks(record.majorWorks ?? record.major_works);
  const works = representativeSource.length > 0
    ? [...representativeSource, ...majorSource.filter((work) => !isLiteraryWork(work))]
    : majorSource;

  const scholar: Scholar = {
    id: readString(record, 'id', `scholar_${name.replace(/\s+/g, '_') || `unknown_${index}`}`),
    name,
    name_en: readString(record, ['name_en', 'nameEn']),
    dynasty: readDynasty(record),
    dynastyPeriod: readString(record, ['dynastyPeriod', 'dynasty_period']),
    birthYear: readNullableNumber(record, ['birthYear', 'birth_year']),
    deathYear: readNullableNumber(record, ['deathYear', 'death_year']),
    schoolOfThought: readString(record, ['schoolOfThought', 'school_of_thought']),
    philosophicalSchoolId: readString(record, ['philosophicalSchoolId', 'philosophical_school_id']),
    biography: readString(record, 'biography'),
    portraitUrl: readOptionalString(record, ['portraitUrl', 'portrait_url']) ?? null,
    achievements: readStringArrayWithFallback(record, ['achievements', 'contributions']),
    contributions: readStringArray(record, 'contributions'),
    representativeWorks: works.filter(isLiteraryWork),
    majorWorks: works.filter((work) => !isLiteraryWork(work)),
    sources: readStringArray(record, 'sources'),
  };

  const createdAt = readDate(record, ['createdAt', 'created_at']);
  if (createdAt) scholar.createdAt = createdAt;
  const updatedAt = readDate(record, ['updatedAt', 'updated_at']);
  if (updatedAt) scholar.updatedAt = updatedAt;

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
