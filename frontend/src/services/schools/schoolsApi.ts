import type { PhilosophicalSchool } from './types';
import { createApiClient, handleApiResponse } from '../utils/apiResponseHandler';

const api = createApiClient();

export const getSchools = async () => {
  const response = await api.get('/schools');
  return handleApiResponse<PhilosophicalSchool>(response);
};

export const getSchoolById = async (id: string) => {
  const response = await api.get(`/schools/${id}`);
  const result = handleApiResponse<PhilosophicalSchool>(response);
  const school = Array.isArray(result.data) ? result.data[0] : result.data;
  return { data: school || null };
};