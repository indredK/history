import type { TangFigure } from './types';
import { createApiClient, handleApiResponse } from '../utils/apiResponseHandler';

const api = createApiClient();

export async function getTangFigures(): Promise<{ data: TangFigure[] }> {
  const response = await api.get('/tang-figures');
  return handleApiResponse<TangFigure>(response);
}

export async function getTangFigureById(id: string): Promise<{ data: TangFigure | null }> {
  try {
    const response = await api.get(`/tang-figures/${id}`);
    const result = handleApiResponse<TangFigure>(response);
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

