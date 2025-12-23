import type { TimelineService } from './timelineService';
import type { Event } from './types';
import { createApiClient, handleApiResponse } from '../utils/apiResponseHandler';

const api = createApiClient();

export const timelineApi: TimelineService = {
  getEvents: async () => {
    const response = await api.get('/events');
    return handleApiResponse<Event>(response);
  },
  getEventsByRange: async (startYear: number, endYear: number) => {
    const response = await api.get('/timeline', { params: { startYear, endYear } });
    return handleApiResponse<Event>(response);
  },
};
