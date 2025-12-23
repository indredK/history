import type { Event } from './types';

export interface TimelineService {
  getEvents(): Promise<{ data: Event[] }>;
}
