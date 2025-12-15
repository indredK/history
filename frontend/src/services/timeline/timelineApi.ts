import axios from 'axios';
import type { TimelineService } from './timelineService';
import type { Event } from './types';

const api = axios.create({
  baseURL: '/api/v1',
});

export const timelineApi: TimelineService = {
  getEvents: async () => {
    const response = await api.get<Event[]>('/events');
    return { data: response.data };
  },
  getEventsByRange: async (startYear: number, endYear: number) => {
    const response = await api.get<Event[]>('/timeline', { params: { startYear, endYear } });
    return { data: response.data };
  },
};
