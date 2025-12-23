import type { QingRuler } from './types';
import { createApiClient, handleApiResponse } from '../utils/apiResponseHandler';

const api = createApiClient();

export async function getQingRulers(): Promise<{ data: QingRuler[] }> {
  const response = await api.get('/qing-rulers');
  return handleApiResponse<QingRuler>(response);
}

export async function getQingRulerById(id: string): Promise<{ data: QingRuler | null }> {
  try {
    const response = await api.get(`/qing-rulers/${id}`);
    const result = handleApiResponse<QingRuler>(response);
    const ruler = Array.isArray(result.data) ? result.data[0] : result.data;
    return { data: ruler || null };
  } catch (error) {
    return { data: null };
  }
}

