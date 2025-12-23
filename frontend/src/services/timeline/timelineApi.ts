import type { TimelineService } from './timelineService';
import type { Event } from './types';
import { createApiClient, handleApiResponse } from '../utils/apiResponseHandler';

const api = createApiClient();

export const timelineApi: TimelineService = {
  getEvents: async () => {
    const response = await api.get('/events');
    return handleApiResponse<Event>(response);
  },
};
