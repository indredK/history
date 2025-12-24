import type { Event } from './types';
import type { BaseService } from '../base/types';

export interface TimelineService extends BaseService<Event> {
  getEvents(): Promise<{ data: Event[] }>;
}
