import type { Event } from '@/services/timeline/types';
import type { Place } from '@/services/map/types';
import type { Person } from '@/services/person/types';
import type { Dynasty } from '@/services/culture/types';
import { timelineApi } from '@/services/timeline/timelineApi';
import { mapApi } from '@/services/map/mapApi';
import { personApi } from '@/services/person/personApi';
import { cultureApi } from '@/services/culture/cultureApi';

export interface ApiService {
  // Timeline API
  getEvents(): Promise<{ data: Event[] }>;
  getEventsByRange(startYear: number, endYear: number): Promise<{ data: Event[] }>;
  
  // Map API
  getPlaces(): Promise<{ data: Place[] }>;
  
  // Person API
  getPersons(): Promise<{ data: Person[] }>;
  getPerson(id: string): Promise<{ data: Person }>;
  
  // Culture API
  getDynasties(): Promise<{ data: Dynasty[] }>;
}

export const apiService: ApiService = {
  // Timeline API
  getEvents: () => timelineApi.getEvents(),
  getEventsByRange: (startYear, endYear) => timelineApi.getEventsByRange(startYear, endYear),
  
  // Map API
  getPlaces: () => mapApi.getPlaces(),
  
  // Person API
  getPersons: () => personApi.getPersons(),
  getPerson: (id) => personApi.getPerson(id),
  
  // Culture API
  getDynasties: () => cultureApi.getDynasties(),
};
