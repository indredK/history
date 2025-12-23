import type { MingFigure } from './types';
import { createApiClient, handleApiResponse } from '../utils/apiResponseHandler';

const api = createApiClient();

export async function getMingFigures(): Promise<{ data: MingFigure[] }> {
  const response = await api.get('/ming-figures');
  return handleApiResponse<MingFigure>(response);
}

export async function getMingFigureById(id: string): Promise<{ data: MingFigure | null }> {
  try {
    const response = await api.get(`/ming-figures/${id}`);
    const result = handleApiResponse<MingFigure>(response);
    const figure = Array.isArray(result.data) ? result.data[0] : result.data;
    return { data: figure || null };
  } catch (error) {
    return { data: null };
  }
}

export function getRoleTypes(): string[] {
  // 这个函数需要从API获取数据，暂时返回空数组
  // 在实际实现中，应该调用专门的API端点
  return [];
}

export function getFactions(): string[] {
  // 这个函数需要从API获取数据，暂时返回空数组
  // 在实际实现中，应该调用专门的API端点
  return [];
}

