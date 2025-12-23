import type { Emperor } from './types';
import { createApiClient, handleApiResponse } from '../utils/apiResponseHandler';

const api = createApiClient();

export async function getEmperors(): Promise<{ data: Emperor[] }> {
  const response = await api.get('/emperors');
  return handleApiResponse<Emperor>(response);
}

export async function getEmperorById(id: string): Promise<{ data: Emperor | null }> {
  try {
    const response = await api.get(`/emperors/${id}`);
    const result = handleApiResponse<Emperor>(response);
    return { data: result.data[0] || null };
  } catch (error) {
    return { data: null };
  }
}

export function getDynasties(): string[] {
  // 这个函数需要从API获取朝代列表，暂时返回空数组
  // 在实际实现中，应该调用专门的朝代API
  return [];
}