import type { Scholar } from './types';
import { createApiClient, handleApiResponse } from '../utils/apiResponseHandler';

const api = createApiClient();

export const getScholars = async () => {
  const response = await api.get('/scholars');
  return handleApiResponse<Scholar>(response);
};

export const getScholarById = async (id: string) => {
  const response = await api.get(`/scholars/${id}`);
  const result = handleApiResponse<Scholar>(response);
  const scholar = Array.isArray(result.data) ? result.data[0] : result.data;
  return { data: scholar || null };
};