import type { PersonService } from './personService';
import type {
  CommonPerson,
  CreateCommonPersonInput,
  SourceRef,
  UpdateCommonPersonInput,
} from './types';
import { getDataSourceMode } from '@/config/dataSource';
import { apiClient, handleSingleApiResponse } from '@/utils/services/apiClient';
import { fetchApiListData } from '@/utils/services/serviceFactory';
import { loadJsonArray } from '@/utils/services/dataLoaders';

interface RawPerson {
  id?: unknown;
  name?: unknown;
  nameEn?: unknown;
  name_en?: unknown;
  courtesy?: unknown;
  dynasty?: unknown;
  period?: unknown;
  gender?: unknown;
  birthYear?: unknown;
  birth_year?: unknown;
  birthMonth?: unknown;
  birth_month?: unknown;
  deathYear?: unknown;
  death_year?: unknown;
  deathMonth?: unknown;
  death_month?: unknown;
  birthplace?: unknown;
  biography?: unknown;
  roles?: unknown;
  role?: unknown;
  aliases?: unknown;
  achievements?: unknown;
  works?: unknown;
  events?: unknown;
  evaluations?: unknown;
  portraitUrl?: unknown;
  portrait_url?: unknown;
  sources?: unknown;
  source?: unknown;
  source_ids?: unknown;
  confidence?: unknown;
  createdAt?: unknown;
  created_at?: unknown;
  updatedAt?: unknown;
  updated_at?: unknown;
  title?: unknown;
  url?: unknown;
  author?: unknown;
}

const API_ENDPOINT = '/persons';
const JSON_DATA_PATH = '/data/json/persons.json';

let mockCache: CommonPerson[] | null = null;

function splitList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value !== 'string') {
    return [];
  }

  return value
    .split(/[,，、|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeSources(raw: RawPerson): SourceRef[] {
  const sources = raw.sources;

  if (Array.isArray(sources)) {
    return sources
      .map((source) => {
        if (typeof source === 'string') {
          return { title: source };
        }
        if (source && typeof source === 'object') {
          const sourceRecord = source as RawPerson;
          const title = sourceRecord.title ?? sourceRecord.name;
          if (!title) return null;
          const normalizedSource: SourceRef = { title: String(title) };
          if (sourceRecord.id) normalizedSource.id = String(sourceRecord.id);
          if (sourceRecord.url) normalizedSource.url = String(sourceRecord.url);
          if (sourceRecord.author) normalizedSource.author = String(sourceRecord.author);
          return normalizedSource;
        }
        return null;
      })
      .filter((source): source is SourceRef => Boolean(source));
  }

  if (typeof raw.source === 'string' && raw.source.trim()) {
    return [{ title: raw.source.trim() }];
  }

  return [];
}

function numberOrUndefined(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function stringOrUndefined(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function transformJsonToPerson(jsonPerson: unknown, index: number): CommonPerson {
  const raw = (jsonPerson && typeof jsonPerson === 'object' && !Array.isArray(jsonPerson))
    ? jsonPerson as RawPerson
    : {};
  const name = String(raw.name ?? `person_${index}`);
  const id = String(raw.id ?? `person_${name.replace(/\s+/g, '_')}_${index}`);

  const person: CommonPerson = {
    id,
    name,
    roles: splitList(raw.roles ?? raw.role),
    aliases: splitList(raw.aliases),
    achievements: splitList(raw.achievements),
    works: splitList(raw.works),
    events: Array.isArray(raw.events)
      ? (raw.events as NonNullable<CommonPerson['events']>)
      : [],
    evaluations: Array.isArray(raw.evaluations)
      ? (raw.evaluations as NonNullable<CommonPerson['evaluations']>)
      : [],
    sources: normalizeSources(raw),
    source_ids: Array.isArray(raw.source_ids)
      ? raw.source_ids.map((source) => String(source))
      : [],
  };

  const optionalTextFields = {
    nameEn: stringOrUndefined(raw.nameEn ?? raw.name_en),
    name_en: stringOrUndefined(raw.name_en ?? raw.nameEn),
    courtesy: stringOrUndefined(raw.courtesy),
    dynasty: stringOrUndefined(raw.dynasty),
    period: stringOrUndefined(raw.period),
    gender: stringOrUndefined(raw.gender),
    birthplace: stringOrUndefined(raw.birthplace),
    biography: stringOrUndefined(raw.biography),
    portraitUrl: stringOrUndefined(raw.portraitUrl ?? raw.portrait_url),
    createdAt: stringOrUndefined(raw.createdAt ?? raw.created_at),
    updatedAt: stringOrUndefined(raw.updatedAt ?? raw.updated_at),
    created_at: stringOrUndefined(raw.created_at ?? raw.createdAt),
    updated_at: stringOrUndefined(raw.updated_at ?? raw.updatedAt),
  };
  const optionalNumberFields = {
    birthYear: numberOrUndefined(raw.birthYear ?? raw.birth_year),
    birthMonth: numberOrUndefined(raw.birthMonth ?? raw.birth_month),
    deathYear: numberOrUndefined(raw.deathYear ?? raw.death_year),
    deathMonth: numberOrUndefined(raw.deathMonth ?? raw.death_month),
    confidence: numberOrUndefined(raw.confidence),
  };

  for (const [key, value] of Object.entries(optionalTextFields)) {
    if (value !== undefined) {
      (person as unknown as Record<string, unknown>)[key] = value;
    }
  }
  for (const [key, value] of Object.entries(optionalNumberFields)) {
    if (value !== undefined) {
      (person as unknown as Record<string, unknown>)[key] = value;
    }
  }

  return person;
}

async function loadMockPersons(): Promise<CommonPerson[]> {
  if (mockCache) {
    return mockCache;
  }

  const jsonData = await loadJsonArray(JSON_DATA_PATH);
  mockCache = jsonData.map((item, index) => transformJsonToPerson(item, index));
  return mockCache;
}

function createMockId(name: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `person_${name.replace(/\s+/g, '_')}_${Date.now()}`;
}

function toApiPayload(input: CreateCommonPersonInput | UpdateCommonPersonInput) {
  return {
    name: input.name,
    nameEn: input.nameEn ?? input.name_en,
    courtesy: input.courtesy,
    dynasty: input.dynasty,
    period: input.period,
    gender: input.gender,
    birthYear: input.birthYear,
    birthMonth: input.birthMonth,
    deathYear: input.deathYear,
    deathMonth: input.deathMonth,
    birthplace: input.birthplace,
    biography: input.biography,
    roles: input.roles,
    aliases: input.aliases,
    achievements: input.achievements,
    works: input.works,
    events: input.events,
    evaluations: input.evaluations,
    portraitUrl: input.portraitUrl,
    sources: input.sources,
    confidence: input.confidence,
  };
}

async function getApiPersons(): Promise<{ data: CommonPerson[] }> {
  return {
    data: (await fetchApiListData(API_ENDPOINT)).map((item, index) =>
      transformJsonToPerson(item, index),
    ),
  };
}

async function getApiPerson(id: string): Promise<{ data: CommonPerson | null }> {
  const response = await apiClient.get(`${API_ENDPOINT}/${id}`);
  const apiResponse = handleSingleApiResponse<unknown>(response);
  return {
    data: apiResponse.data
      ? transformJsonToPerson(apiResponse.data, 0)
      : null,
  };
}

async function createApiPerson(
  input: CreateCommonPersonInput,
): Promise<{ data: CommonPerson }> {
  const response = await apiClient.post(API_ENDPOINT, toApiPayload(input));
  const apiResponse = handleSingleApiResponse<unknown>(response);
  return { data: transformJsonToPerson(apiResponse.data, 0) };
}

async function updateApiPerson(
  id: string,
  input: UpdateCommonPersonInput,
): Promise<{ data: CommonPerson }> {
  const response = await apiClient.patch(`${API_ENDPOINT}/${id}`, toApiPayload(input));
  const apiResponse = handleSingleApiResponse<unknown>(response);
  return { data: transformJsonToPerson(apiResponse.data, 0) };
}

async function deleteApiPerson(id: string): Promise<{ data: CommonPerson }> {
  const response = await apiClient.delete(`${API_ENDPOINT}/${id}`);
  const apiResponse = handleSingleApiResponse<unknown>(response);
  return { data: transformJsonToPerson(apiResponse.data, 0) };
}

export const personApi: PersonService = {
  async getAll() {
    return personApi.getPersons();
  },

  async getById(id: string) {
    return personApi.getPerson(id);
  },

  async getPersons() {
    if (getDataSourceMode() === 'api') {
      try {
        return await getApiPersons();
      } catch (error) {
        console.error('人物 API 加载失败，回退到静态数据:', error);
      }
    }
    return { data: await loadMockPersons() };
  },

  async getPerson(id: string) {
    if (getDataSourceMode() === 'api') {
      try {
        return await getApiPerson(id);
      } catch (error) {
        console.error(`人物 API 详情加载失败，回退到静态数据(id=${id}):`, error);
      }
    }

    const persons = await loadMockPersons();
    return { data: persons.find((person) => person.id === id) ?? null };
  },

  async createPerson(input: CreateCommonPersonInput) {
    if (getDataSourceMode() === 'api') {
      return createApiPerson(input);
    }

    const now = new Date().toISOString();
    const person: CommonPerson = {
      ...input,
      id: createMockId(input.name),
      name: input.name,
      nameEn: input.nameEn ?? input.name_en ?? null,
      createdAt: now,
      updatedAt: now,
      created_at: now,
      updated_at: now,
    };
    const persons = await loadMockPersons();
    mockCache = [person, ...persons];
    return { data: person };
  },

  async updatePerson(id: string, input: UpdateCommonPersonInput) {
    if (getDataSourceMode() === 'api') {
      return updateApiPerson(id, input);
    }

    const persons = await loadMockPersons();
    const index = persons.findIndex((person) => person.id === id);
    if (index === -1) {
      throw new Error('人物不存在');
    }
    const current = persons[index];
    if (!current) {
      throw new Error('人物不存在');
    }

    const updated: CommonPerson = {
      ...current,
      ...input,
      nameEn: input.nameEn ?? input.name_en ?? current.nameEn ?? null,
      updatedAt: new Date().toISOString(),
    };
    mockCache = [
      ...persons.slice(0, index),
      updated,
      ...persons.slice(index + 1),
    ];
    return { data: updated };
  },

  async deletePerson(id: string) {
    if (getDataSourceMode() === 'api') {
      return deleteApiPerson(id);
    }

    const persons = await loadMockPersons();
    const person = persons.find((item) => item.id === id);
    if (!person) {
      throw new Error('人物不存在');
    }

    mockCache = persons.filter((item) => item.id !== id);
    return { data: person };
  },
};

export const getPersons = () => personApi.getPersons();
export const getPerson = (id: string) => personApi.getPerson(id);
export const createPerson = (input: CreateCommonPersonInput) =>
  personApi.createPerson(input);
export const updatePerson = (id: string, input: UpdateCommonPersonInput) =>
  personApi.updatePerson(id, input);
export const deletePerson = (id: string) => personApi.deletePerson(id);
