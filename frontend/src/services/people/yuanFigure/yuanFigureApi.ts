import type { YuanFigure } from './types';
import { createApiClient, handleApiResponse } from '../../utils/apiResponseHandler';

const api = createApiClient();

export async function getYuanFigures(): Promise<{ data: YuanFigure[] }> {
  const response = await api.get('/yuan-figures');
  return handleApiResponse<YuanFigure>(response);
}

export async function getYuanFigureById(id: string): Promise<{ data: YuanFigure | null }> {
  try {
    const response = await api.get(`/yuan-figures/${id}`);
    const result = handleApiResponse<YuanFigure>(response);
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

