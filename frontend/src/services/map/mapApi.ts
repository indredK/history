import axios from 'axios';
import type { MapService } from './mapService';
import type { Place } from './types';

const api = axios.create({
  baseURL: '/api/v1',
});

export const mapApi: MapService = {
  getPlaces: async () => {
    const response = await api.get<Place[]>('/places');
    return { data: response.data };
  },
};
