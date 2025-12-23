import type { MapService } from './mapService';
import type { Place } from './types';
import { createApiClient, handleApiResponse } from '../utils/apiResponseHandler';

const api = createApiClient();

export const mapApi: MapService = {
  getPlaces: async () => {
    const response = await api.get('/places');
    return handleApiResponse<Place>(response);
  },
};
