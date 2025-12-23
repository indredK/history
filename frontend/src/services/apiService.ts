import type { Event } from '@/services/timeline/types';
import type { Place } from '@/services/map/types';
import type { CommonPerson } from '@/services/people/common/types';
import type { Dynasty } from '@/services/culture/types';
import { timelineApi } from '@/services/timeline/timelineApi';
import { mapApi } from '@/services/map/mapApi';
import { personApi } from '@/services/people/common/personApi';
import { dynastiesApi } from '@/services/culture/cultureApi';

export interface ApiService {
  // Timeline API
  getEvents(): Promise<{ data: Event[] }>;
  
  // Map API
  getPlaces(): Promise<{ data: Place[] }>;
  
  // Person API
  getPersons(): Promise<{ data: CommonPerson[] }>;
  getPerson(_id: string): Promise<{ data: CommonPerson }>;
  
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
