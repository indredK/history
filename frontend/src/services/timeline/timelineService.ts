import type { Event, EventInput } from './types';
import type { BaseService } from '../base/types';

export interface TimelineService extends BaseService<Event> {
  getEvents(): Promise<{ data: Event[] }>;
  createEvent?(input: EventInput): Promise<{ data: Event }>;
  updateEvent?(id: string, input: EventInput): Promise<{ data: Event }>;
  deleteEvent?(id: string): Promise<{ data: Event | null }>;
}
