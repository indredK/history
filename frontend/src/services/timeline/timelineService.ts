import type { Event } from './types';

export interface TimelineService {
  getEvents(): Promise<{ data: Event[] }>;
  getEventsByRange(_startYear: number, _endYear: number): Promise<{ data: Event[] }>;
}
