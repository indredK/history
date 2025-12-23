import type { SanguoFigure } from './types';
import { createApiClient, handleApiResponse } from '../utils/apiResponseHandler';

const api = createApiClient();

export async function getSanguoFigures(): Promise<{ data: SanguoFigure[] }> {
  const response = await api.get('/sanguo-figures');
  return handleApiResponse<SanguoFigure>(response);
}

export async function getSanguoFigureById(id: string): Promise<{ data: SanguoFigure | null }> {
  try {
    const response = await api.get(`/sanguo-figures/${id}`);
    const result = handleApiResponse<SanguoFigure>(response);
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

export function getKingdoms(): string[] {
  // 这个函数需要从API获取数据，暂时返回空数组
  // 在实际实现中，应该调用专门的API端点
  return [];
}

