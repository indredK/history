import type { SchoolsService } from './schoolService';
import { createUnifiedService } from '../base/serviceFactory';
import type {
  PhilosophicalSchool,
  PhilosophicalSchoolMutationInput,
  ClassicWork,
  RepresentativeFigure,
} from './types';
import { getDataSourceMode } from '@/config/dataSource';
import { apiClient, handleSingleApiResponse } from '@/utils/services/apiClient';
import {
  isRecord,
  readNumber,
  readOptionalString,
  readString,
  readStringArray,
} from '../person/common/figureTransform';

interface RawSchoolRecord {
  [key: string]: unknown;
  id?: unknown;
  name?: unknown;
  name_en?: unknown;
  nameEn?: unknown;
  founder?: unknown;
  founderEn?: unknown;
  founder_en?: unknown;
  foundingYear?: unknown;
  founding_year?: unknown;
  foundingPeriod?: unknown;
  founding_period?: unknown;
  coreBeliefs?: unknown;
  core_beliefs?: unknown;
  coreIdeas?: unknown;
  core_ideas?: unknown;
  keyTexts?: unknown;
  key_texts?: unknown;
  representativeFigures?: unknown;
  representative_figures?: unknown;
  classicWorks?: unknown;
  classic_works?: unknown;
  description?: unknown;
  influence?: unknown;
  color?: unknown;
  sources?: unknown;
  createdAt?: unknown;
  created_at?: unknown;
  updatedAt?: unknown;
  updated_at?: unknown;
}

function readNullableNumber(record: RawSchoolRecord, keys: string | string[]): number | null {
  const value = readNumber(record, keys, Number.NaN);
  return Number.isFinite(value) ? value : null;
}

function readDate(record: RawSchoolRecord, keys: string | string[]): Date | undefined {
  const value = readOptionalString(record, keys);
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function readStringArrayWithFallback(record: RawSchoolRecord, keys: string[]): string[] {
  for (const key of keys) {
    const values = readStringArray(record, key);
    if (values.length > 0) return values;
  }
  return [];
}

function readRecordArray(value: unknown): RawSchoolRecord[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function readRepresentativeFigures(record: RawSchoolRecord): RepresentativeFigure[] {
  return readRecordArray(
    record.representativeFigures ?? record.representative_figures,
  ).map((item, index) => {
    const name = readString(item, 'name');
    return {
      id: readString(item, 'id', `figure_${index}_${name || 'unknown'}`),
      name,
      name_en: readString(item, ['name_en', 'nameEn']),
      period: readString(item, 'period'),
      contribution: readString(item, 'contribution'),
    };
  });
}

function readClassicWorks(record: RawSchoolRecord): ClassicWork[] {
  return readRecordArray(record.classicWorks ?? record.classic_works).map(
    (item, index) => {
      const title = readString(item, 'title');
      return {
        id: readString(item, 'id', `work_${index}_${title || 'unknown'}`),
        title,
        title_en: readString(item, ['title_en', 'titleEn']),
        author: readString(item, 'author'),
        description: readString(item, 'description'),
      };
    },
  );
}

// 数据转换器
function transformJsonToSchool(jsonSchool: unknown, index: number): PhilosophicalSchool {
  const record = isRecord(jsonSchool) ? jsonSchool : {};
  const name = readString(record, 'name');
  const coreBeliefs = readStringArrayWithFallback(record, [
    'coreBeliefs',
    'core_beliefs',
    'coreIdeas',
    'core_ideas',
  ]);

  const school: PhilosophicalSchool = {
    id: readString(
      record,
      'id',
      `school_${name.replace(/\s+/g, '_') || `unknown_${index}`}`,
    ),
    name,
    name_en: readOptionalString(record, ['name_en', 'nameEn']) ?? null,
    founder: readOptionalString(record, 'founder') ?? null,
    founderEn: readOptionalString(record, ['founderEn', 'founder_en']) ?? null,
    foundingYear: readNullableNumber(record, ['foundingYear', 'founding_year']),
    foundingPeriod: readOptionalString(record, ['foundingPeriod', 'founding_period']) ?? null,
    coreBeliefs,
    coreIdeas: coreBeliefs,
    keyTexts: readStringArray(record, ['keyTexts', 'key_texts']),
    representativeFigures: readRepresentativeFigures(record),
    classicWorks: readClassicWorks(record),
    description: readOptionalString(record, 'description') ?? null,
    influence: readOptionalString(record, 'influence') ?? null,
    color: readOptionalString(record, 'color') ?? null,
    sources: readStringArray(record, 'sources'),
  };

  const createdAt = readDate(record, ['createdAt', 'created_at']);
  if (createdAt) school.createdAt = createdAt;
  const updatedAt = readDate(record, ['updatedAt', 'updated_at']);
  if (updatedAt) school.updatedAt = updatedAt;

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
      data: transformJsonToSchool(
        {
          ...input,
          id: id || input.id || `school_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        0,
      ),
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
    data: apiResponse.data ? transformJsonToSchool(apiResponse.data, 0) : null,
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
