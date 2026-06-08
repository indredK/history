import { getDataSourceMode } from '@/config/dataSource';
import { apiClient, handleSingleApiResponse } from '@/utils/services/apiClient';
import { fetchApiListData } from '@/utils/services/serviceFactory';
import { loadJsonArray } from '@/utils/services/dataLoaders';
import type { MythologyService } from './mythologyService';
import {
  VALID_CATEGORIES,
  type Mythology,
  type MythologyCategory,
  type MythologyInput,
} from './types';

const API_ENDPOINT = '/mythologies';
const JSON_DATA_PATH = '/data/json/mythologies.json';

const legacyCategoryMap: Record<string, MythologyCategory> = {
  creation_myth: '创世神话',
  creation: '创世神话',
  deity: '神仙传说',
  legend: '民间传说',
  folklore: '民间传说',
  other: '民间传说',
};

let mockCache: Mythology[] | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  const items: string[] = [];

  value.forEach((item) => {
    if (typeof item === 'string' && item.trim()) {
      items.push(item.trim());
      return;
    }

    if (Array.isArray(item)) {
      item.forEach((nested) => {
        if (typeof nested === 'string' && nested.trim()) {
          items.push(nested.trim());
        }
      });
    }
  });

  return Array.from(new Set(items));
}

function normalizeCategory(value: unknown): MythologyCategory {
  const category = readString(value);
  if (VALID_CATEGORIES.includes(category as MythologyCategory)) {
    return category as MythologyCategory;
  }
  return legacyCategoryMap[category] || '民间传说';
}

function readStorySections(rawStories: unknown): string[] {
  if (isRecord(rawStories)) {
    return readStringArray(rawStories['sections'] ?? rawStories['stories']);
  }
  return readStringArray(rawStories);
}

function readStoryCharacters(rawStories: unknown): string[] {
  if (isRecord(rawStories)) {
    return readStringArray(rawStories['characters']);
  }

  if (!Array.isArray(rawStories)) {
    return [];
  }

  const nested = rawStories.flatMap((item) => (Array.isArray(item) ? item : []));
  return readStringArray(nested);
}

function transformJsonToMythology(jsonMythology: unknown, index = 0): Mythology {
  const source = isRecord(jsonMythology) ? jsonMythology : {};
  const rawStories = source['stories'];
  const storySections = readStorySections(rawStories);
  const storyCharacters = readStoryCharacters(rawStories);
  const directCharacters = readStringArray(source['characters']);
  const title = readString(source['title']) || readString(source['name']) || `未命名神话 ${index + 1}`;
  const origin = readString(source['origin']) || readString(source['source']);
  const storyMeta = isRecord(rawStories) ? rawStories : {};

  return {
    id: readString(source['id']) || `mythology-${index + 1}`,
    title,
    englishTitle: readString(source['englishTitle']) || readString(storyMeta['englishTitle']),
    category: normalizeCategory(source['category']),
    description: readString(source['description']),
    characters: directCharacters.length > 0 ? directCharacters : storyCharacters,
    period: readString(source['period']),
    origin,
    stories: storySections,
    symbolism: readStringArray(source['symbolism']),
    source: readString(source['source']) || origin,
    imageUrl: readString(source['imageUrl']) || readString(storyMeta['imageUrl']),
    createdAt: readString(source['createdAt']),
    updatedAt: readString(source['updatedAt']),
  };
}

function normalizeInput(input: Partial<MythologyInput> | undefined, id: string): Mythology {
  const source = readString(input?.source) || readString(input?.origin);

  return {
    id,
    title: readString(input?.title) || `未命名神话 ${id}`,
    englishTitle: readString(input?.englishTitle),
    category: normalizeCategory(input?.category),
    description: readString(input?.description),
    characters: readStringArray(input?.characters),
    period: readString(input?.period),
    origin: readString(input?.origin) || source,
    stories: readStringArray(input?.stories),
    symbolism: readStringArray(input?.symbolism),
    source,
    imageUrl: readString(input?.imageUrl),
    updatedAt: new Date().toISOString(),
  };
}

async function getMockData(): Promise<Mythology[]> {
  if (!mockCache) {
    const jsonData = await loadJsonArray<unknown>(JSON_DATA_PATH);
    mockCache = jsonData.map((item, index) => transformJsonToMythology(item, index));
  }

  return [...mockCache];
}

async function getApiData(): Promise<Mythology[]> {
  const apiItems = await fetchApiListData(API_ENDPOINT);
  return apiItems.map((item, index) => transformJsonToMythology(item, index));
}

async function getApiDataById(id: string): Promise<Mythology | null> {
  const response = await apiClient.get(`${API_ENDPOINT}/${id}`);
  const apiResponse = handleSingleApiResponse<unknown>(response);
  return apiResponse.data ? transformJsonToMythology(apiResponse.data) : null;
}

async function createApiData(input: MythologyInput): Promise<Mythology> {
  const response = await apiClient.post(API_ENDPOINT, input);
  const apiResponse = handleSingleApiResponse<unknown>(response);
  return transformJsonToMythology(apiResponse.data);
}

async function updateApiData(id: string, input: MythologyInput): Promise<Mythology> {
  const response = await apiClient.patch(`${API_ENDPOINT}/${id}`, input);
  const apiResponse = handleSingleApiResponse<unknown>(response);
  return transformJsonToMythology(apiResponse.data);
}

async function deleteApiData(id: string): Promise<Mythology | null> {
  const response = await apiClient.delete(`${API_ENDPOINT}/${id}`);
  const apiResponse = handleSingleApiResponse<unknown>(response);
  return apiResponse.data ? transformJsonToMythology(apiResponse.data) : null;
}

async function createMockData(input: MythologyInput): Promise<Mythology> {
  const current = await getMockData();
  const item = normalizeInput(input, `mythology-${Date.now()}`);
  mockCache = [item, ...current];
  return item;
}

async function updateMockData(id: string, input: MythologyInput): Promise<Mythology> {
  const current = await getMockData();
  const item = normalizeInput(input, id);
  const exists = current.some((entry) => entry.id === id);
  mockCache = exists
    ? current.map((entry) => (entry.id === id ? { ...entry, ...item } : entry))
    : [item, ...current];
  return item;
}

async function deleteMockData(id: string): Promise<Mythology | null> {
  const current = await getMockData();
  const deleted = current.find((item) => item.id === id) || null;
  mockCache = current.filter((item) => item.id !== id);
  return deleted;
}

async function getByIdFromMock(id: string): Promise<Mythology | null> {
  const data = await getMockData();
  return data.find((item) => String(item.id) === String(id)) || null;
}

export const mythologyApi: MythologyService = {
  getAll: async () => mythologyApi.getMythologies(),
  getById: async (id: string) => mythologyApi.getMythology(id),
  getMythologies: async () => {
    if (getDataSourceMode() === 'mock') {
      return { data: await getMockData() };
    }

    try {
      return { data: await getApiData() };
    } catch (error) {
      console.error('神话 API 数据加载失败，回退到静态数据:', error);
      return { data: await getMockData() };
    }
  },
  getMythology: async (id: string) => {
    if (getDataSourceMode() === 'mock') {
      return { data: await getByIdFromMock(id) };
    }

    try {
      return { data: await getApiDataById(id) };
    } catch (error) {
      console.error(`神话 API 详情加载失败，回退到静态数据(id=${id}):`, error);
      return { data: await getByIdFromMock(id) };
    }
  },
  createMythology: async (input: MythologyInput) => {
    if (getDataSourceMode() === 'mock') {
      return { data: await createMockData(input) };
    }

    return { data: await createApiData(input) };
  },
  updateMythology: async (id: string, input: MythologyInput) => {
    if (getDataSourceMode() === 'mock') {
      return { data: await updateMockData(id, input) };
    }

    return { data: await updateApiData(id, input) };
  },
  deleteMythology: async (id: string) => {
    if (getDataSourceMode() === 'mock') {
      return { data: await deleteMockData(id) };
    }

    return { data: await deleteApiData(id) };
  },
};

export async function fetchMythologies() {
  const result = await mythologyApi.getMythologies();
  return {
    data: result.data,
    success: true,
  };
}

export async function fetchMythologyById(id: string) {
  try {
    const result = await mythologyApi.getMythology(id);
    return result.data;
  } catch {
    return null;
  }
}
