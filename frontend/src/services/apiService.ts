import type { Event } from '@/services/timeline/types';
import type { Place } from '@/services/map/types';
import type { Person } from '@/services/person/types';
import type { Dynasty } from '@/services/culture/types';
import { timelineApi } from '@/services/timeline/timelineApi';
import { mapApi } from '@/services/map/mapApi';
import { personApi } from '@/services/person/personApi';
import { dynastiesApi } from '@/services/culture/cultureApi';

export interface ApiService {
  // Timeline API
  getEvents(): Promise<{ data: Event[] }>;
  
  // Map API
  getPlaces(): Promise<{ data: Place[] }>;
  
  // Person API
  getPersons(): Promise<{ data: Person[] }>;
  getPerson(_id: string): Promise<{ data: Person }>;
  
  // Culture API
  getDynasties(): Promise<{ data: Dynasty[] }>;
}

export const apiService: ApiService = {
  // Timeline API
  getEvents: () => timelineApi.getEvents(),
  
  // Map API
  getPlaces: () => mapApi.getPlaces(),
  
  // Person API
  getPersons: () => personApi.getPersons(),
  getPerson: (_id) => personApi.getPerson(_id),
  
  // Culture API
  getDynasties: () => dynastiesApi.getDynasties(),
};
