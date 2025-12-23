import type { DynastiesService } from './cultureService';
import type { Dynasty } from './types';
import { createApiClient, handleApiResponse } from '../utils/apiResponseHandler';

const api = createApiClient();

export const dynastiesApi: DynastiesService = {
  getDynasties: async () => {
    const response = await api.get('/dynasties');
    return handleApiResponse<Dynasty>(response);
  },
};
