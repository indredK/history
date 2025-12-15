import axios from 'axios';
import type { CultureService } from './cultureService';
import type { Dynasty } from './types';

const api = axios.create({
  baseURL: '/api/v1',
});

export const cultureApi: CultureService = {
  getDynasties: async () => {
    const response = await api.get<Dynasty[]>('/dynasties');
    return { data: response.data };
  },
};
