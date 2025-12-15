import type { Event } from './types';

export interface TimelineService {
  getEvents(): Promise<{ data: Event[] }>;
  getEventsByRange(startYear: number, endYear: number): Promise<{ data: Event[] }>;
}
